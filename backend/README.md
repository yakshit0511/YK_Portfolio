# Yakshit Portfolio Backend

This is the backend foundation for the Yakshit Portfolio project.

## Tech stack

- Node.js 18+
- Express 4
- MongoDB + Mongoose 8
- ES modules
- Render-ready server configuration

## Environment setup

1. Copy `.env.example` to `.env`
2. Fill in the required MongoDB and JWT values
3. Install dependencies

```bash
npm install
```

## Run locally

```bash
npm run dev
```

The server listens on `PORT` (default `5000`).

## Bonus portfolio features

Public endpoints include `GET /api/public/projects/:slug`, `GET /api/public/github`, and `POST /api/public/track`. Tracking is anonymous, stores only a daily HMAC visitor hash and coarse event metadata, honors DNT/GPC, and records nothing until a visitor opts in through the public site. Event records expire after 180 days.

Protected admin endpoints include certificate CRUD at `/api/admin/certificates` and aggregated analytics at `/api/admin/insights?range=7|30|90`. The profile and project editors manage availability, learning topics, and case-study fields.

Before deploying existing data with the bonus features, run the additive migration once:

```bash
npm run migrate:bonus
```

It inserts missing `certificates` and `github` section settings, assigns slugs only to projects that do not have one, and creates supporting indexes. It does not clear or replace portfolio records. No seed command is required. `GITHUB_TOKEN` is optional and should be a fine-grained token with read-only public access; GitHub data degrades gracefully when the token or API is unavailable.
