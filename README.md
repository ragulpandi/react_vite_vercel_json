# React Cache-Control Playground

A small React + Vite client app for learning how HTTP caching headers work in a real frontend deployment.

## Requirements
- Node.js 20 or newer
- npm

## Run locally

```bash
npm install
npm run dev
```

Open: http://localhost:5173

## Production build

```bash
npm run build
npm run preview
```

## Vercel fingerprinted asset caching

This app is intentionally a client-only project. Vite emits hashed bundle names such as:

- `assets/index-U_u1qANU.css`
- `assets/index-B57Gz_A7.js`

The `vercel.json` file applies:

- `public, max-age=31536000, immutable` to fingerprinted asset files
- `public, max-age=0, must-revalidate` to HTML and non-hashed files

This is the standard pattern for frontend hosting on Vercel: immutable cached assets, revalidated HTML, and a new URL whenever the file contents change.
