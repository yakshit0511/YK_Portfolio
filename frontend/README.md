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

Add supplied media under `public/` using these names:

- `videos/hero.mp4` and `videos/hero-poster.jpg`
- `images/hero/hero-1.jpg` through `hero-7.jpg`
- `images/backgrounds/room-bg.jpg` and `room-bg-mobile.jpg`
- `images/brand/favicon.png` (optional)
- `images/guide/` and `images/cutouts/` are reserved for Prompt 4

Vercel's `vercel.json` is strict JSON and cannot contain comments. To proxy API requests through the frontend domain for first-party cookies, add this rewrite before the SPA catch-all and replace the Render host:

```jsonc
{ "source": "/api/(.*)", "destination": "https://YOUR-RENDER-SERVICE.onrender.com/api/$1" }
```
