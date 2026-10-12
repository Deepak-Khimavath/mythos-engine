# Mythos Engine

An atmospheric, choice-driven story world. Explore the observatory, follow your own actions, discover the living world bible, and pick up where you left off: your current story is saved in this browser.

## Run locally

1. Install Node.js 20.19+ (or 22.12+).
2. In this folder, run `npm install`.
3. Run `npm run dev` and open the local address Vite prints.

The built-in narrative engine works immediately; no account or API key is required. The development command starts both the Vite app and the local API server.

## Mistral AI scenes

1. Copy `.env.example` to `.env`.
2. Set `MISTRAL_API_KEY` to your Mistral API key. Defaults use `open-mistral-7b` at `https://api.mistral.ai/v1`; override with `MISTRAL_MODEL` or `MISTRAL_BASE_URL` if needed.
3. Restart `npm run dev`.

The API key is read only by the Node server and is never embedded in the frontend bundle. If Mistral is missing, times out, or returns invalid output, the game falls back to the local story engine.

## Production

Run `npm run build`, then `npm start`. The server hosts the built app and API on port 3001 (or `PORT`).
