# Mythos Engine

An atmospheric, choice-driven story studio. Create and keep multiple living worlds, make choices that shape each adventure, and resume your stories whenever you return.

## Play the story

1. Open the app and read the scene.
2. Choose a suggested action or write your own.
3. Explore **My worlds** to switch between saved adventures.
4. Open the **World bible** for the setting, cast, and discoveries; **Story history** shows prior choices.
5. Use **New world** to create another adventure. Your existing worlds remain saved separately in this browser.

## Run locally

1. Install Node.js 20.19+ (or 22.12+).
2. In this folder, run `npm install`.
3. Copy `.env.example` to `.env` and optionally add your AI provider credentials and configuration.
4. Run `npm run dev` and open the local address Vite prints.

Without an API key, the app uses a built-in narrative fallback. AI keys are read only by the local Node server and are never embedded in the browser bundle. Never commit a real `.env` file.

## AI configuration

The default configuration uses the Mistral chat-completions API with `open-mistral-7b`. Set `MISTRAL_API_KEY` locally to enable it. To use another compatible provider, configure `MISTRAL_BASE_URL` and `MISTRAL_MODEL` for that provider's compatible endpoint/model.

## Production

Run `npm run build`, then `npm start`. The server hosts the built app and API on port 3001 (or the configured `PORT`).