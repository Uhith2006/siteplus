# SitePulse AI

A deployable full-stack construction progress workspace built with React, Vite, TypeScript, Three.js / React Three Fiber, GSAP, Node.js and Express.

## Features
- Responsive cinematic landing experience with a procedural 3D construction model.
- Scroll-triggered motion and project workspace.
- Project portfolio, progress-to-target views and health indicators.
- Site photo upload (JPG, PNG, WebP, max 12 MB), project/work-package metadata, reported progress and notes.
- Inspection log, human verification action and CSV export.
- Express API with JSON persistence and upload storage.
- Render Blueprint with a persistent disk so uploads and inspection records survive redeploys.

## Run locally
Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` and `/uploads` to the Express server on port 4000.

For a production-like local run:

```bash
npm run build
npm start
```

Open http://localhost:4000.

## Deploy to Render
1. Create a GitHub repository and push this project folder to it.
2. In Render, choose **New → Blueprint** and connect the repository.
3. Render reads `render.yaml`, installs dependencies, builds the React app and starts the Express server.
4. The Blueprint provisions a persistent disk mounted at `/var/data`. The API stores inspection metadata in `/var/data/inspections.json` and uploaded images in `/var/data/uploads`.
5. Open the generated `https://...onrender.com` URL.

The included Render Blueprint uses a paid Starter web service because persistent disks are not available on the free web-service tier. You can change the plan in `render.yaml` if your Render account offers a suitable persistent-storage option.

## Deploy elsewhere
The app can run on any Node host that supports a persistent writable directory. Set:

- `NODE_ENV=production`
- `DATA_DIR=/path/to/persistent/storage`
- `PORT` (usually supplied by the host)

Build with `npm install && npm run build`, then start with `npm start`.

## API
- `GET /api/health` – health check
- `GET /api/dashboard` – projects, recent inspections and summary metrics
- `GET /api/inspections` – all inspection records
- `POST /api/inspections` – multipart upload with `photo`, `project`, `package`, `progress`, `notes`
- `PATCH /api/inspections/:id/verify` – mark a record as human-verified

## Important product limitation
This version records **user-reported progress** and supports a human verification workflow. It does not run a computer-vision model or independently measure construction quantities from photos. The visual scanning overlays are illustrative UI, not AI detections. Do not use demo project figures or unverified reports for contractual, safety or financial decisions.

## Before production launch
Add authentication and role-based access, project-level permissions, audit logging, database backups, malware scanning, image retention rules, rate limiting, and a managed database/object-storage service. The JSON file store is intentionally lightweight for a prototype and a single app instance, not a multi-instance production database.
