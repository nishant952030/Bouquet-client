# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Firebase Setup (Firestore)

1. Create a Firebase project and enable Firestore Database.
2. Copy `client/.env.example` to `client/.env`.
3. Fill all `VITE_FIREBASE_*` variables from your Firebase web app config.
4. Run `npm run dev` from `client`.

If Firebase variables are missing, the app falls back to `localStorage` for shared bouquet links.

## Grok AI Note Generation

Add these variables in `client/.env` to enable AI note generation in the Create page:

- `VITE_GROK_API_KEY`
- `VITE_GROK_MODEL` (default: `grok-2-latest`)
- `VITE_GROK_API_URL` (default: `https://api.x.ai/v1/chat/completions`)

Optional:

- `VITE_GROK_PROXY_URL` if you want to call your own backend endpoint instead of exposing an API key to the client.

## Groq Support (Recommended)

The note generator also supports Groq and will use it automatically when `VITE_GROQ_API_KEY` is present.

- `VITE_GROQ_API_KEY`
- `VITE_GROQ_MODEL` (default: `llama-3.3-70b-versatile`)
- `VITE_GROQ_API_URL` (default: `https://api.groq.com/openai/v1/chat/completions`)

## Razorpay Setup

Add this variable in `client/.env` (and Vercel project env):

- `VITE_RAZORPAY_KEY_ID`

Paid plans open Razorpay checkout and only create share links after successful payment.
