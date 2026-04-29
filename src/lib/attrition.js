/**
 * Reprium Employee Attrition Scoring Engine
 *
 * Empirical basis:
 *   Attrition (NLSY 1979 longitudinal, n=629):
 *     attrition_rate = 0.0535 + 0.0340·ψ  (linear positive; higher parental distance → more job-switching)
 *
 *   Earnings potential (Child WB paper, main.tex col 3):
 *     log_wages = 0.79·ψ − 1.89·ψ²  (inverted-U, ψ*=0.208)
 *
 *   Education (Child WB paper, education.tex col 3):
 *     ed_attain = 2.21·ψ − 5.82·ψ²  (inverted-U, ψ*=0.190)
 *
 *   Focus (Child WB paper, focus.tex col 3):
 *     total_activities = 2.86·ψ  (linear positive = more scattered; lower is better for retention)
 *
 * Composite retention score:
 *   Combines earnings potential, education, and focus into 0–100 score.
 *   Peaks at ψ* ≈ 0.19 — intermediate parental cultural diversity.
 */

import { computeCulturalDistance, ISO_TO_GROUP } from './scoring.js';

// ─── Coefficients ──────────────────────────────────────────────────────────────

const ATTRITION_COEFS = {
  alpha: 0.0535,
  beta1: 0.0340,
  beta2: 0.0005,  // essentially linear from NLSY regression
};

const WAGES_COEFS     = { beta1:  0.79, beta2: -1.89, optPsi: 0.208 };
const EDUCATION_COEFS = { beta1:  2.21, beta2: -5.82, optPsi: 0.190 };
const FOCUS_SLOPE     = 2.86;  // linear: higher psi → more scattered → more attrition

// ─── Normalization bounds ─────────────────────────────────────────────────────

const ATTRITION_MIN = 0.050;   // lowest observed attrition rate (best)
const ATTRITION_MAX = 0.080;   // highest observed

function normalize(val, lo, hi, invert = false) {
  const frac = Math.max(0, Math.min(1, (val - lo) / (hi - lo)));
  return Math.round(100 * (invert ? 1 - frac : frac));
}

// ─── Core computation ─────────────────────────────────────────────────────────

export function computeAttritionScore(input) {
  const { parent1, parent2, age = 30, seniority = 'mid' } = input;

  const psi  = computeCulturalDistance([parent1], [parent2]);
  const psi2 = psi * psi;

  // Raw attrition rate (NLSY)
  const attrition_rate = ATTRITION_COEFS.alpha + ATTRITION_COEFS.beta1 * psi + ATTRITION_COEFS.beta2 * psi2;

  // Earnings potential (relative to peak)
  const wages_raw  = WAGES_COEFS.beta1 * psi + WAGES_COEFS.beta2 * psi2;
  const wages_peak = WAGES_COEFS.beta1 * WAGES_COEFS.optPsi + WAGES_COEFS.beta2 * WAGES_COEFS.optPsi ** 2;
  const wages_score = Math.max(0, Math.min(100, 100 * wages_raw / wages_peak));

  // Education attainment (relative to peak)
  const ed_raw   = EDUCATION_COEFS.beta1 * psi + EDUCATION_COEFS.beta2 * psi2;
  const ed_peak  = EDUCATION_COEFS.beta1 * EDUCATION_COEFS.optPsi + EDUCATION_COEFS.beta2 * EDUCATION_COEFS.optPsi ** 2;
  const ed_score = Math.max(0, Math.min(100, 100 * ed_raw / ed_peak));

  // Focus score: inversely proportional to total_activities (lower activities = more focused)
  const focus_raw   = FOCUS_SLOPE * psi;
  const focus_max   = FOCUS_SLOPE * 0.50;
  const focus_score = Math.max(0, Math.min(100, 100 * (1 - focus_raw / focus_max)));

  // Attrition score (lower attrition = higher score)
  const attrition_score = normalize(attrition_rate, ATTRITION_MIN, ATTRITION_MAX, true);

  // Composite retention score
  const retention_score = Math.round(
    0.35 * attrition_score +
    0.35 * wages_score     +
    0.15 * ed_score        +
    0.15 * focus_score
  );

  // Expected tenure (years) — inverse of annual attrition rate
  const expected_tenure = Math.round(Math.max(1, Math.min(20, 1 / attrition_rate)));

  // Seniority adjustment
  const seniority_adj = seniority === 'senior' ? -5 : seniority === 'junior' ? +8 : 0;

  return {
    psi, psi2,
    attrition_rate,
    attrition_score,
    wages_score,
    ed_score,
    focus_score,
    retention_score: Math.max(0, Math.min(100, retention_score + seniority_adj)),
    expected_tenure,
    optPsi: 0.19,
  };
}

// ─── Curve data ───────────────────────────────────────────────────────────────

export function generateAttritionCurve() {
  return Array.from({ length: 51 }, (_, i) => {
    const psi   = i / 100;
    const psi2  = psi * psi;

    const attrition_rate = ATTRITION_COEFS.alpha + ATTRITION_COEFS.beta1 * psi;
    const attrition_score = normalize(attrition_rate, ATTRITION_MIN, ATTRITION_MAX, true);

    const wages_raw   = WAGES_COEFS.beta1 * psi + WAGES_COEFS.beta2 * psi2;
    const wages_peak  = WAGES_COEFS.beta1 * WAGES_COEFS.optPsi + WAGES_COEFS.beta2 * WAGES_COEFS.optPsi ** 2;
    const wages_score = Math.max(0, Math.min(100, 100 * wages_raw / wages_peak));

    const focus_score = Math.max(0, Math.min(100, 100 * (1 - (FOCUS_SLOPE * psi) / (FOCUS_SLOPE * 0.50))));

    const retention = Math.round(0.35 * attrition_score + 0.35 * wages_score + 0.30 * focus_score);

    return {
      psi: parseFloat(psi.toFixed(2)),
      retention: Math.max(0, Math.min(100, retention)),
      attrition: parseFloat((attrition_rate * 100).toFixed(2)),
      earnings:  parseFloat(wages_score.toFixed(1)),
      focus:     parseFloat(focus_score.toFixed(1)),
    };
  });
}
