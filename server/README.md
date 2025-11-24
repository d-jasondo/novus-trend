# Twitter Dashboard Backend (local dev)

This small backend provides:

- OAuth2 login with Twitter (routes: `/auth/login`, `/auth/callback`).
- Tweet posting (`POST /tweets/post`) and scheduling (`POST /tweets/schedule`).
- A simple AI generate stub at `POST /tweets/generate` (replace with real Gemini integration).

Setup
1. Copy `.env.example` to `.env` and fill your credentials (do not commit `.env`).
2. Install dependencies:

```powershell
cd server
npm install
```

3. Start the server:

```powershell
npm start
```

Endpoints (dev)
- GET /auth/login -> Redirects to Twitter authorization URL.
- GET /auth/callback -> Twitter redirects here after auth; shows a small success page.
- POST /tweets/post { text, accessToken } -> Posts immediately using provided access token.
- POST /tweets/schedule { text, accessToken, when } -> Schedule a tweet for ISO datetime `when`.
- GET /tweets/scheduled -> List scheduled tweets (from `data/scheduled.json`).
- POST /tweets/generate { prompt } -> Returns a simple AI suggestion (stub).

Notes
- This skeleton stores scheduled tweets in `server/data/scheduled.json` and tokens in memory for demo. Replace with a database in production.
- Implement proper secure token storage, refresh token handling, and CSRF/state verification for production use.
