# Yakshit Portfolio Frontend

React 18, TypeScript, Vite, Tailwind CSS 3, and React Three Fiber frontend foundation. The application uses the public API when available and renders the bundled fallback profile when it is not.

## Setup

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Set `VITE_API_URL` and `VITE_ADMIN_PATH` in `.env.local` as needed. The site can render without the backend; API data replaces the fallback profile after the request completes.

## Build

```powershell
npm run build
npm run preview
```

## Manual media

Add supplied media under `public/` using the current filenames:

- `images/cutouts/01_coding_0-3s (1).png`
- `images/cutouts/02_looks_left_3-5s (1).png`
- `images/cutouts/03_looks_right_5-6.5s (1).png`
- `images/cutouts/04_remove_headset_8-10s (1).png`
- `images/cutouts/05_wave_10-12s (1).png`
- `images/cutouts/06_point_down_12-15s (1).png`
- `images/cutouts/07_final_pose (1).png`
- `images/backgrounds/room-bg.jpg.png` (used on desktop and mobile)
- `images/brand/Logo.png` (used as the favicon)
- `images/guide/` contains the supplied pointing illustrations for Prompt 4

Vercel's `vercel.json` is strict JSON and cannot contain comments. To proxy API requests through the frontend domain for first-party cookies, add this rewrite before the SPA catch-all and replace the Render host:

```jsonc
{ "source": "/api/(.*)", "destination": "https://YOUR-RENDER-SERVICE.onrender.com/api/$1" }
```
