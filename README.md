# PyxeeBot Landing (Next.js)

This repository contains a production-ready landing page component for PyxeeBot built with Next.js (App Router), Tailwind CSS, and Framer Motion.

Quick start

1. Install dependencies:

```bash
npm install
```

2. Run the dev server:

```bash
npm run dev
```

Open http://localhost:3000 to view the landing page.

Notes
- This is a drop-in example for a Next.js app directory. Ensure Tailwind is configured in your project.
- The hero includes an animated terminal simulation and Framer Motion scroll reveals.

Static deployment

This project is configured for static export (Next.js `next export`) so you can host it on GitHub Pages or Cloudflare Pages.

Build and export locally:

```bash
npm install
npm run build
npm run export   # produces ./out
```

GitHub Pages (auto-deploy):

- The repository includes a GitHub Action that runs on pushes to `main` and will build + export then deploy the `out/` directory to the `gh-pages` branch.
- Make sure your repository's default branch is `main` (or update `.github/workflows/deploy.yml`). The workflow uses the `GITHUB_TOKEN` automatically — no extra secrets required.

Cloudflare Pages (manual setup):

- In Cloudflare Pages, connect your repo, set the build command to:

```
npm run build && npm run export
```

- Set the output directory to `out`.

Notes on server features

- This static build does not support Next.js server-only features (SSR, server components that require runtime, API routes). For those, deploy on Vercel or Cloudflare with Next.js runtime support.

