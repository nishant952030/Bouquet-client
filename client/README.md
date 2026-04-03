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

## PayPal Setup

Add this variable in `client/.env` (and Vercel project env):

- `VITE_PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_ENV` (`sandbox` or `live`)

Paid plans open PayPal checkout and only create share links after successful payment capture.

The project creates and captures orders through serverless routes:

- `POST /api/paypal/create-order`
- `POST /api/paypal/capture-order`

## Global Checkout Setup (Stripe)

Use Stripe for non-INR countries. It has no monthly fee on standard plans (pay per successful transaction).

Server env variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET` (for optional webhook validation)

Serverless endpoints included:

- `POST /api/stripe/create-checkout-session`
- `GET /api/stripe/verify-session`
- `POST /api/stripe/webhook`

Payment flow behavior:

1. PayPal flow: create order (`/api/paypal/create-order`) and capture order (`/api/paypal/capture-order`).
2. Stripe flow (if enabled in app): create + verify checkout sessions.

## Razorpay Setup (India)

For Indian users (UPI/cards/wallets), add these variables in `client/.env` and Vercel env:

- `VITE_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET` (optional unless using webhook route)

Serverless endpoints:

- `POST /api/razorpay/create-order`
- `POST /api/razorpay/verify`
- `POST /api/razorpay/webhook`

## Recommended Platform Mix

- Global default: PayPal
- Optional alternative: Stripe Checkout

## Custom Analytics (Self-Hosted)

Privacy-focused, open-source website analytics. See `analytics-tracker/` directory.

1. Deploy `analytics-tracker/` to Vercel
2. Add Firebase credentials to the tracker project
3. Set `VITE_ANALYTICS_WEBSITE_ID` in `client/.env`
4. Add to `client/.env`:
   - `VITE_ANALYTICS_WEBSITE_ID=petalsandwords` (or your custom ID)
5. Deploy client — tracking starts automatically

Dashboard: `https://your-analytics-domain.vercel.app`

Features: Pageviews, unique visitors, referrers, top pages, devices, countries.
