"""
FastAPI microservice wrapping NAMAA-Space/NAMAA-Saudi-TTS (Saudi-dialect
Chatterbox Multilingual TTS) for the voice call-center assistant feature.

Runs separately from the Vercel-hosted frontend/API — it needs a GPU (or at
least a machine with internet access to Hugging Face) and is not deployable
as a Vercel serverless function. Point VITE_TTS_SERVICE_URL at wherever this
is running.
"""
import logging
import os
import tempfile

import torch
import torchaudio as ta
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import snapshot_download
from pydantic import BaseModel
from safetensors.torch import load_file as load_safetensors

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("namaa-saudi-tts")

MODEL_REPO = "NAMAA-Space/NAMAA-Saudi-TTS"
CHECKPOINT_FILE = "t3_mtl23ls_v2.safetensors"
DEFAULT_LANGUAGE = "ar"


def resolve_device() -> str:
    override = os.environ.get("TTS_DEVICE")
    if override:
        return override
    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


DEVICE = resolve_device()
_model = None


def get_model():
    """Lazily loads the model on first request, then keeps it in memory."""
    global _model
    if _model is None:
        from chatterbox import mtl_tts

        logger.info("Loading NAMAA-Saudi-TTS on device=%s ...", DEVICE)
        ckpt_dir = snapshot_download(repo_id=MODEL_REPO, repo_type="model", revision="main")

        model = mtl_tts.ChatterboxMultilingualTTS.from_pretrained(device=DEVICE)
        t3_state = load_safetensors(f"{ckpt_dir}/{CHECKPOINT_FILE}", device=DEVICE)
        model.t3.load_state_dict(t3_state)
        model.t3.to(DEVICE).eval()

        _model = model
        logger.info("Model loaded.")
    return _model


class SynthesizeRequest(BaseModel):
    text: str
    language_id: str = DEFAULT_LANGUAGE
    audio_prompt_path: str | None = None  # optional reference wav for voice/style transfer


app = FastAPI(title="NAMAA Saudi TTS Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.environ.get("ALLOWED_ORIGIN", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok", "device": DEVICE, "model_loaded": _model is not None}


@app.post("/synthesize")
def synthesize(req: SynthesizeRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text is required")

    model = get_model()
    kwargs = {"language_id": req.language_id}
    if req.audio_prompt_path:
        kwargs["audio_prompt_path"] = req.audio_prompt_path

    try:
        wav = model.generate(text, **kwargs)
    except Exception as exc:
        logger.exception("TTS generation failed")
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {exc}") from exc

    # Save through a temp file rather than an in-memory buffer — more
    # reliable across torchaudio backend versions.
    with tempfile.NamedTemporaryFile(suffix=".wav") as tmp:
        ta.save(tmp.name, wav, model.sr)
        tmp.seek(0)
        audio_bytes = tmp.read()

    return Response(content=audio_bytes, media_type="audio/wav")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 8000)))
