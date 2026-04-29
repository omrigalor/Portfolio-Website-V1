# Omri Galor — Portfolio & Research Platform

**[Live → omrigalor.com](https://omrigalor.com)**

A full-stack portfolio and interactive research platform showcasing three patented predictive models and an AI-powered venture capital analysis agent. Statistical engine built from scratch in JavaScript; trained on 839,000+ real-world data points.

---

## Patented Models

### 1. Relationship Longevity Predictor
`US Patent 11,847,293 B2`

Predicts long-term relationship stability from parental cultural backgrounds, age, and education. Uses quadratic regression on ψ (pre-historic migratory distance) with high-dimensional fixed effects — identifying an optimal intermediate cultural distance that minimises separation risk.

### 2. Employee Attrition Predictor
`US Patent 11,923,451 B1`

Predicts employee tenure from parental cultural background divergence. The same inverted-U relationship observed in relationships holds in organisational settings. Trained on CPS labour micro-data with HDFE regression.

### 3. Loan Default Risk Predictor
`US Patent 12,041,876 B2`

Predicts loan default probability from the borrower's parental cultural background divergence. Isolates the causal channel of cultural distance on financial discipline, removing endogenous covariates downstream of ψ. Validated against ACS 5-year micro-data (n=843,228).

---

## Financial Agents

### Venture Capital Agent
AI-powered portfolio ranking agent. Enter any company names — the agent calls Claude (Anthropic) to research each one and estimate 12 investment factors, then runs:
- **Monte Carlo simulation** — 2,000 iterations with Gaussian noise (σ=10) per factor
- **Random Forest** — 10 trees with bootstrapped factor subsets
- **4-quadrant scatter plot** — Market Opportunity vs. Execution Quality
- **Ranked output** — composite MC + RF score with P10–P90 confidence intervals

---

## App Features

| Feature | Description |
|---|---|
| **Portfolio** | Patents, research papers, résumé |
| **Compatibility App** | Relationship longevity + child well-being score for any two backgrounds |
| **Auto Demo** | Animated walkthrough of the compatibility engine |
| **Data Insights** | Visualisations of age, religion, and cultural distance effects across 839k couples |
| **Attrition App** | HR tool — predicts employee tenure from parental background |
| **Loan Default App** | FinTech tool — default risk score vs. population average |
| **Market Validation** | TAM analysis and revenue opportunity sizing |
| **VC Agent** | AI-powered portfolio research, Monte Carlo + Random Forest ranking |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 8 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Statistical engine | Custom JS — `scoring.js`, `attrition.js`, `loan.js` |
| AI research | Anthropic Claude API (claude-haiku) |
| Data sources | CPS micro-data · ACS 5yr · NLSY79 · Pew Research 2015 |
| Deployment | GitHub Pages · Custom domain |

---

## Running Locally

```bash
npm install
npm run dev       # http://localhost:5173
```

| Script | Description |
|---|---|
| `npm run dev` | Local dev server |
| `npm run build` | Production build → `dist/` |
| `npm run deploy` | Build + push to GitHub Pages |

---

## Research Foundation

Models are grounded in peer-reviewed economics research on pre-historic migratory distance as a determinant of long-run cultural, cognitive, and economic outcomes (Pemberton et al. 2013; Spolaore & Wacziarg 2009). ψ captures divergence in values, communication styles, and institutional norms accumulated over millennia — not modern political borders.

Working papers available in [`/public/papers/`](public/papers/).

---

*Built by [Omri Galor](https://www.linkedin.com/in/omri-galor)*
