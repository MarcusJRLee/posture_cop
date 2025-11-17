# Posture Cop 🧘‍♂️

Real-time posture monitoring using **MediaPipe** in the browser.

## Features

- 100% client-side (no server, no video upload)
- Real-time neck & spine tracking
- Posture score (0–100)
- Visual + audio alerts
- Vercel-ready, $0/month to start

## Deploy in 1 Click

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/MarcusJRLee/posture_cop)

## Local Dev

```bash
npm install
npm run dev
```

## Setup

```bash
# Created using.
npx create-next-app@latest posture_cop \
  --typescript \
  --eslint \
  --tailwind \
  --app \
  --src-dir \
  --turbo \
  --import-alias "@/*"


# Installed dependencies.
npm i @vercel/speed-insights @vercel/analytics

# Install MediaPipe: mediapipe.dev
# https://www.npmjs.com/package/@mediapipe/tasks-vision
npm i @mediapipe/tasks-vision

# Vercel CLI (optional but handy).
npm i -g vercel

# Add a lint-staged + Husky pre-commit hook:
npm i -D husky lint-staged
npx husky init
echo "npx lint-staged" > .husky/pre-commit

# Testing (Jest + React Testing Library + Playwright).
npm i -D jest ts-jest @testing-library/react @testing-library/jest-dom playwright
npm i --save-dev jest-environment-jsdom

# Check that your Node version is ≥ 20 (Vercel uses the latest LTS).
node -v

# Check that your TypeScript compiles.
npx tsc

# Run a dev server.
npm run dev

# Other npm commands (see pacakge.json for complete list).
npm run build
npm run start
npm run lint
```

Supabase setup:

```bash
# Test it works.
npx supabase --help

# Login (one-time).
npx supabase login

# Link your project (replace YOUR_PROJECT_REF with your Supabase project ref, e.g., abcdef123456).
npx supabase link --project-ref YOUR_PROJECT_REF

# Generate types (outputs to stdout – redirect to a file).
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > src/types/supabase.ts
```

## Learn More

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
