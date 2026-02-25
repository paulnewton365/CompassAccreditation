# Conscious Compass — Assessor Accreditation Test

A password-gated accreditation test for Antenna Group's Conscious Compass assessors.

## Deploy to Vercel (5 minutes)

### Option A — Drag and drop (easiest)
1. Go to [vercel.com](https://vercel.com) and log in
2. Click **Add New → Project**
3. Click **"Import Third-Party Git Repository"** or drag this folder into the upload zone
4. Vercel auto-detects Vite. Accept defaults and click **Deploy**

### Option B — Vercel CLI
```bash
npm install -g vercel
cd compass-accreditation
vercel
```

### Option C — GitHub
1. Push this folder to a new GitHub repo
2. Connect the repo in Vercel dashboard
3. Deploy

## Local development
```bash
npm install
npm run dev
```

## Configuration

Edit `src/questions.js` to change:
- `PASS_SCORE` — pass mark (default 80%)
- `TEST_LENGTH` — questions per attempt (default 25)
- `ADMIN_PASS` — admin password (default `compass2025`)

## Features
- 64-question bank across 7 domains
- 25 randomised questions per attempt, with guaranteed domain coverage
- No mid-test answer reveal — results only shown at the end
- Incorrect questions reviewed on results page with correct answers highlighted
- Targeted study guidance by domain for failed attempts
- Admin dashboard (password-protected) showing all attempts
- Results stored in localStorage — no database required
- Fully responsive, Inter font, Compass brand palette
