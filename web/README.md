# Savings Growth Planner — web app

The Next.js frontend for the Savings Growth Planner. See the
[repository README](../README.md) for the project overview, methodology, and
deployment instructions.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # Vitest unit tests
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run build      # production build
npm run e2e        # Playwright smoke test (builds and serves automatically)
```

Deployed on Vercel with root directory `web`. No environment variables are
required — there are no secrets or server-side data sources, and all
calculations run client-side.
