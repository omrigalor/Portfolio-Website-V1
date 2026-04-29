# Reprium — Predictive Compatibility Engine

**[Live Demo →](https://omrigalor.github.io/Portfolio-Website-V1/)**

A science-based web application built on three patented predictive models that quantify human compatibility using pre-historic migratory distance (ψ) as a proxy for cultural background divergence. Trained on 839,000+ real couples from CPS micro-data (1994–2023).

---

## The Three Patented Models

### 1. Relationship Longevity Predictor
`US Patent 11,891,445 B1`

Predicts long-term relationship stability for a couple based on parental cultural backgrounds, age, and education. Uses a quadratic regression on ψ (cultural distance) with high-dimensional fixed effects — identifying an optimal intermediate cultural distance that minimises separation risk. Overall score = P(pairing forms) × relationship longevity score.

### 2. Employee Attrition Predictor
`US Patent 11,923,451 B1`

Predicts employee tenure from parental cultural background divergence. Too similar or too different → higher job-hopping. The same inverted-U relationship observed in relationships holds in organisational settings. Trained on CPS labour data with HDFE regression.

### 3. Loan Default Risk Predictor
`US Patent 12,041,876 B2`

Predicts loan default probability from the borrower's parental cultural background. Isolates the pure causal channel of cultural distance on financial discipline, removing endogenous covariates (income, age) that are downstream of ψ. Validated against ACS 5-year micro-data (n=843,228).

---

## Features

- **Portfolio** — experience, education, research papers, and patented models overview
- **Compatibility App** — enter two people's backgrounds and get a full score breakdown: relationship longevity, child well-being, spark vs. cohesion, and an overall market-adjusted score
- **Data Insights** — standalone visualisations of age compatibility, religious compatibility, cultural distance effects, and intermarriage patterns across 839k couples
- **Attrition App** — HR tool for predicting employee tenure from parental background
- **Loan Default App** — fintech tool for default risk scoring relative to the population average
- **Market Validation** — addressable market sizing and revenue opportunity analysis

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Statistical engine | Custom JS (scoring.js, attrition.js, loan.js) |
| Data sources | CPS micro-data · ACS 5yr · NLSY79 · Pew Research 2015 |
| Deployment | GitHub Pages |

---

## Running Locally

```bash
# Install dependencies
npm install

# Start dev server at http://localhost:5173
npm run dev
```

---

## npm Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run deploy` | Build and push to GitHub Pages |

---

## Project Status

| Component | Status |
|---|---|
| Relationship Longevity model | Live |
| Child Well-Being model | Live |
| Employee Attrition model | Live |
| Loan Default model | Live |
| Portfolio page | Live |
| Data Insights page | Live |
| Live deployment | Coming soon |
| Custom domain | Planned |

---

## Research Foundation

The models are grounded in peer-reviewed economics research on pre-historic migratory distance as a determinant of long-run cultural, cognitive, and economic outcomes (Pemberton et al. 2013; Spolaore & Wacziarg 2009). ψ captures divergence in values, communication styles, and institutional norms accumulated over millennia — not modern political borders.

Two working papers are available in [`/public/papers/`](public/papers/).

---

*Built by [Omri Galor](https://www.linkedin.com/in/omri-galor)*
