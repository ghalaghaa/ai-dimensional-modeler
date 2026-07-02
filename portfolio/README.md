# Portfolio — 10 Projects + Personal Site

Ten self-contained, tested, runnable projects, each in its own folder,
each using a different language/stack and built for a real category of
user. Every project has its own `README.md` with setup, run, and test
instructions — start there.

[**`site/`**](./site) is a personal portfolio website (about, skills,
experience, and a filterable grid linking to all 10 project repos) —
plain HTML/CSS/JS, deployable to GitHub Pages in minutes. See
`site/README.md`.

| # | Project | Who it's for | Stack | Tests |
|---|---------|---------------|-------|-------|
| 01 | [Study Buddy RAG](./01-study-buddy-rag) | Students turning notes into practice quizzes | Python, FastAPI, TF-IDF retrieval, Groq LLM (RAG) | 11 ✅ |
| 02 | [Fake News Classifier — From Scratch](./02-fake-news-classifier-scratch) | Demonstrates neural-net fundamentals | Python, NumPy (manual backprop, no ML framework) | 11 ✅ |
| 03 | [Appointment Agent](./03-appointment-agent) | Small clinics/businesses needing NL scheduling | Python, SQLite, Groq LLM tool-calling agent | 8 ✅ |
| 04 | [Clinic Manager](./04-clinic-manager) | Clinics/pharmacies tracking patients & inventory | Java, Spring Boot, H2 | 20 ✅ |
| 05 | [Budget Tracker](./05-budget-tracker) | Everyday personal finance tracking | C#, ASP.NET Core, EF Core + SQLite | 9 ✅ |
| 06 | [Fast Doc Search](./06-fast-doc-search) | Offline full-text search over personal archives | C++, CMake, inverted index + TF-IDF | 25 ✅ |
| 07 | [Study Room Realtime](./07-study-room-realtime) | Student groups studying together remotely | Node.js, Express, Socket.IO | 8 ✅ |
| 08 | [Volunteer Match](./08-volunteer-match) | Volunteers and nonprofits posting/finding opportunities | React 19, Vite, Express | 16 ✅ |
| 09 | [Accessible Reader](./09-accessible-reader) | Visually impaired users, text-to-speech | HTML/CSS/vanilla JS, Web Speech API (zero deps) | 29 ✅ |
| 10 | [Voice Accessibility Assistant](./10-voice-accessibility-assistant) | Users with motor impairments controlling a PC by voice | Python, rule-based NLU, pluggable STT | 22 ✅ |

**159 automated tests total, all independently verified passing** — no
project requires a paid API key or special hardware to run its test
suite (LLM calls, speech I/O, and live mouse/keyboard control are all
behind mockable/dry-run interfaces by default).

## AI/ML techniques covered (01, 02, 03, 10)

Deliberately different techniques rather than repeating the same
pattern: retrieval-augmented generation (01), a neural network trained
with hand-derived backpropagation instead of a framework (02), an LLM
agent that calls tools rather than just chatting (03), and rule-based
NLU driving a real action-execution pipeline (10).

## Splitting a project into its own repository

Each folder is fully self-contained (its own `.gitignore`, dependency
manifest, tests). To give one its own GitHub repo without losing
history for that folder:

```bash
# from the ai-dimensional-modeler repo root
git subtree split --prefix=portfolio/01-study-buddy-rag -b study-buddy-rag-only

# create an empty repo on GitHub first, then:
mkdir ../study-buddy-rag && cd ../study-buddy-rag
git init
git pull ../ai-dimensional-modeler study-buddy-rag-only
git remote add origin <your-new-repo-url>
git push -u origin main
```

Repeat per project, substituting the folder name and branch name. If
history isn't important, it's even simpler: just copy the folder into a
fresh `git init`.

### Or do all 10 at once

`scripts/split_and_push.sh` automates the above for every project using
the GitHub CLI (`gh`) — run it locally (not in this sandbox, since it
needs your own GitHub login):

```bash
git clone <this-repo-url> && cd ai-dimensional-modeler
git checkout claude/github-portfolio-projects-km0apg
gh auth login   # if not already logged in
bash portfolio/scripts/split_and_push.sh
```

It creates 11 public repos under your GitHub account (10 projects + the
personal site, names are listed at the top of the script — edit them
there if you want different names) and pushes each with its preserved
commit history. After it runs, enable GitHub Pages on the
`portfolio-site` repo (Settings → Pages → source: `main`, root) to get
your live site URL.
