# Vercel Deployment

This folder contains the Vercel deployment target for this project.

## 1) Configure project in Vercel

Use these settings in the Vercel dashboard:

- Framework Preset: `Other`
- Root Directory: `vercel`
- Build Command: `npm install && npm run build`
- Output Directory: *(leave empty)*
- Install Command: `npm install`

## 2) Deploy

After deployment, Vercel will assign a domain like:

- `https://your-project.vercel.app`

## 3) Update shared config

Edit `shared/config.js` and set:

- `VERCEL_HOME_DOMAIN` to your Vercel domain.
- Keep `CF_PAGES_HOME_DOMAIN` and `NETLIFY_HOME_DOMAIN` as-is (or set empty if unused).

## 4) Proxy routes

The following paths are supported on Vercel:

- `/ghproxy/*`
- `/dockerproxy/*`
- `/catbox/*`
- `/ssh/*`

All of them are rewritten to `vercel/api/proxy/[...path].js`, which reuses the shared proxy logic.
