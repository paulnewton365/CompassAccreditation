# Conscious Compass — Assessor Accreditation

A gated accreditation test for Antenna Group team members to become certified Conscious Compass assessors. Pass mark is 80%. Passing issues a Fully Conscious badge and qualifies the assessor to conduct client assessments.

Current version: **v1.2.3**

---

## Stack

- **React / Vite** — frontend
- **Tailwind CSS** — styling
- **Supabase** — results and user storage (same project as main Compass app)
- **Vercel** — deployment

---

## Deployment

### Option A — GitHub + Vercel (recommended)
1. Push this folder to a GitHub repo
2. Connect the repo in the Vercel dashboard
3. Add environment variables (see below)
4. Deploy — Vercel auto-detects Vite

### Option B — Vercel CLI
```bash
npm install -g vercel
cd CompassAccreditation-main
vercel
```

---

## Environment variables

Add these to the Vercel project settings before deploying:

```
VITE_SUPABASE_URL=https://zkordpfxdekmubtjsbkr.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_P-_HmV08lkcn61j5WYuhtQ_yJw_UxfD
```

These are safe to expose client-side. Security is enforced through Supabase Row Level Security.

---

## Supabase setup

Run `accreditation_schema.sql` once in the Supabase SQL Editor (Conscious Compass App project) to create the required tables:

- `accreditation_results` — stores every completed attempt with score, answers, time, and pass/fail
- `accreditation_users` — stores registered users (upserted on email)

---

## Local development

```bash
npm install
npm run dev
```

Create a `.env.local` file with the environment variables above.

---

## Configuration

All core settings live in `src/questions.js`:

| Constant | Default | Description |
|---|---|---|
| `PASS_SCORE` | `80` | Pass mark percentage |
| `TEST_LENGTH` | `25` | Questions per attempt |
| `ADMIN_PASS` | `compass2025` | Admin dashboard password |
| `MAX_DAILY_ATTEMPTS` | `2` | Max attempts per user per day |
| `ALLOWED_EMAILS` | see file | Whitelist of permitted email addresses |

---

## Question bank

115 questions across 7 domains. Each test draws 25 questions with guaranteed minimum coverage per domain.

| Domain | Questions | Min per test |
|---|---|---|
| What is a Conscious Brand | 19 | 3 |
| Identifying Conscious Brands | 24 | 3 |
| Using the Tool | 17 | 3 |
| How Scores Are Calculated | 17 | 3 |
| Interpreting Scores & Maturity | 13 | 3 |
| The Assessor's Role | 22 | 3 |
| Actioning Insights | 17 | 3 |

---

## Features

- 115-question bank, 25 randomised questions per attempt with guaranteed domain coverage
- Email whitelist — only permitted Antenna email addresses can access the test
- Max 2 attempts per day per user
- No mid-test answer reveal — results shown at end only
- Pass result: Fully Conscious badge issued with congratulations screen
- Fail result: incorrect questions reviewed with correct answers highlighted and domain-level study guidance
- PDF download of full results (score, domain breakdown, incorrect questions, badge on pass)
- Admin dashboard — password-protected, shows all attempts with View and Delete per result
- Admin View — full score breakdown and incorrect question review per user, with PDF export
- Results stored in Supabase — persistent across sessions, accessible in admin
- Fully responsive, Inter font, Conscious Compass brand palette
- Version number displayed on cover screen

---

## Version history

| Version | Summary |
|---|---|
| v1.0.0 | Initial build — localStorage, 90 questions |
| v1.0.4 | Supabase integration, UI refinements, version number on cover |
| v1.0.5 | Admin View overlay, Assessment Complete button, PDF download |
| v1.0.6 | Fully Conscious badge on pass result screen |
| v1.0.7 | Three question corrections (ac9, i14, a13) |
| v1.0.8 | Badge included in PDF download |
| v1.0.9 | Question correction: a3 (rescore language) |
| v1.1.0 | Question correction: i20 (Glassdoor/REFLECTIVE distractors) |
| v1.1.1 | Question corrections: a16 (SENTIENT rescore), i7 (B2B platform context) |
| v1.1.2 | Question correction: i4 (VISIONARY distractors) |
| v1.1.3 | Question corrections: a3, a10, c8, a16 — removed all manual adjustment language; strengthened conscious brand definition |
| v1.2.0 | Added 14 new questions (ASSESSOR +5, TOOL +3, SCORING +2, ACTION +4); all domain minimums raised to 3; total bank 129 questions |
| v1.2.1 | Replaced a21 — earned media definition question with strategic case for earned media |
| v1.2.2 | Added andrew.mcnamara and yonah.rosen to allowed emails |
| v1.2.3 | Updated t2 to reflect five Setup fields including Assessor Context; fixed c6 distractor D (SENTIENT B2B weighting) |
