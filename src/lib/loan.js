/**
 * Reprium Loan Default Risk Scoring Engine
 *
 * Empirical basis (ACS 5yr 2010 micro-data, n=843,228):
 *   P(low income — default proxy) = 0.2540 − 0.4339·ψ + 1.7396·ψ²
 *   Optimal ψ* = 0.125  (minimum default risk at intermediate parental diversity)
 *
 *   Log income = 10.233 + 1.785·ψ − 6.293·ψ²
 *   Optimal ψ* = 0.142  (maximum income at intermediate parental diversity)
 *
 * Income and other individual-level variables (DTI, age, gender) are deliberately
 * excluded from the output: they are either endogenous to ψ (income), or introduce
 * unobserved confounders we cannot fully control. The output is the pure causal
 * channel: how parental cultural distance shifts baseline default probability,
 * after controlling for the fixed effects already absorbed by the regression.
 */

import { computeCulturalDistance } from './scoring.js';

const DEFAULT_COEFS = {
  alpha:  0.2540,
  beta1: -0.4339,
  beta2:  1.7396,
  optPsi: 0.125,
};

const INCOME_COEFS = {
  alpha:  10.233,
  beta1:   1.785,
  beta2:  -6.293,
  optPsi: 0.142,
};

// Population average: P(default) at mean parental ψ ≈ 0.15 in ACS sample
const PSI_POPULATION_MEAN = 0.15;
export const AVERAGE_DEFAULT = (() => {
  const p = PSI_POPULATION_MEAN;
  return DEFAULT_COEFS.alpha + DEFAULT_COEFS.beta1 * p + DEFAULT_COEFS.beta2 * p * p;
})(); // ≈ 0.228

export function computeLoanScore({ parent1, parent2 }) {
  const psi  = computeCulturalDistance([parent1], [parent2]);
  const psi2 = psi * psi;

  const pDefault = Math.max(0.05, Math.min(0.60,
    DEFAULT_COEFS.alpha + DEFAULT_COEFS.beta1 * psi + DEFAULT_COEFS.beta2 * psi2
  ));

  // Delta vs population average (positive = worse than average, negative = better)
  const deltaVsAvg = pDefault - AVERAGE_DEFAULT;

  const creditScore = Math.round(100 * (1 - pDefault / 0.60));

  const riskTier =
    pDefault < 0.10 ? 'Low Risk'      :
    pDefault < 0.20 ? 'Moderate Risk' :
    pDefault < 0.35 ? 'Elevated Risk' : 'High Risk';

  const riskColor =
    pDefault < 0.10 ? '#22c55e' :
    pDefault < 0.20 ? '#f59e0b' :
    pDefault < 0.35 ? '#fb923c' : '#C41E3A';

  return {
    psi,
    pDefault,
    deltaVsAvg,
    creditScore,
    riskTier,
    riskColor,
    optPsi: DEFAULT_COEFS.optPsi,
  };
}

export function generateLoanCurve() {
  return Array.from({ length: 51 }, (_, i) => {
    const psi  = i / 100;
    const psi2 = psi * psi;

    const pDefault = Math.max(0.05, Math.min(0.60,
      DEFAULT_COEFS.alpha + DEFAULT_COEFS.beta1 * psi + DEFAULT_COEFS.beta2 * psi2
    ));

    const lnIncome = INCOME_COEFS.alpha + INCOME_COEFS.beta1 * psi + INCOME_COEFS.beta2 * psi2;

    return {
      psi:     parseFloat(psi.toFixed(2)),
      default: parseFloat((pDefault * 100).toFixed(1)),
      income:  Math.round(Math.exp(lnIncome)),
      safety:  Math.round(100 * (1 - pDefault / 0.60)),
    };
  });
}
