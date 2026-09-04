# Create the standalone GitHub repository

Suggested repository name: `conceptmotion-studio`

After unzipping:

```bash
git init
git add .
git commit -m "Initial ConceptMotion Studio library"
git branch -M main
git remote add origin https://github.com/<YOUR_USER>/conceptmotion-studio.git
git push -u origin main
```

## Netlify

Import the new GitHub repository in Netlify. The included `netlify.toml` uses:

- build command: `npm run build`
- publish directory: `dist`
- Node 22

## Codex takeover order

Before editing code:

```text
CODEX_HANDOFF.md
AGENTS.md
AUDIT.md
ROADMAP.md
research/SOURCE_AUDIT.md
research/MOVING_VIDEO_SPEC.md
QA_REPORT.md
```

Then run the dependency-free checks before installation:

```bash
npm run check:offline
```

## Local QA

```bash
npm install
npm run check
npm run dev
```

Commit the generated lockfile after a successful clean install; do not hand-author one.

In the ChatGPT build environment, the dependency-free catalogue/scene/Python smoke tests passed. Package installation could not be completed because npm network access timed out, so run the full Vite build once after cloning/uploading.
