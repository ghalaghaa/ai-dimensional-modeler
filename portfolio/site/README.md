# Personal Portfolio Site

A single-page portfolio: about, skills, experience timeline, education/
certifications, a filterable project grid linking to all 10 project
repos, and contact links. Plain HTML/CSS/JS — no build step, no
dependencies, works by opening `index.html` directly or serving the
folder statically.

## Edit your content

Everything content-related lives in **`data.js`** — name, summary,
stats, skills, experience, education, certifications, and the project
list (title, description, tech stack, audience, GitHub repo slug, test
count). Change `GITHUB_USER` at the top if your repos live under a
different account than the default (`ghalaghaa`), and fill in
`PROFILE.linkedin` to show a LinkedIn button.

If you used `portfolio/scripts/split_and_push.sh` to push each project
to its own repo, the `repo` field for each project in `data.js` already
matches the default repo names that script creates — no changes needed
unless you renamed something.

## Preview locally

```bash
cd portfolio/site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy — GitHub Pages (free, ~2 minutes)

Easiest path: push this `site/` folder as the root of its own repo
(same `git subtree split` approach as the other projects), then in that
repo's **Settings → Pages**, set source to the `main` branch, root
folder. GitHub gives you a live URL like
`https://<username>.github.io/<repo-name>/`.

```bash
git subtree split --prefix=portfolio/site -b portfolio-site-only
mkdir ../portfolio-site && cd ../portfolio-site
git init && git pull ../ai-dimensional-modeler portfolio-site-only
gh repo create portfolio-site --public --source=. --remote=origin --push
gh repo edit portfolio-site --homepage "https://<username>.github.io/portfolio-site/"
# Then enable Pages in the repo's Settings → Pages (source: main, root)
```

Any other static host (Vercel, Netlify, Cloudflare Pages) works too —
just point it at this folder, no build command needed.
