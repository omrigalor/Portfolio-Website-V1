/**
 * Reprium Compatibility Scoring Engine
 * Prototype model — coefficients inspired by Reprium empirical research.
 *
 * PLACEHOLDER: When integrated with the full proprietary model, replace:
 *   - CULTURAL_DISTANCE_MATRIX with Reprium's pre-historic migratory distance matrix
 *   - ANCESTRY_FE with fitted ancestry fixed effects from the full CPS regression
 *   - CONTINENT_FE with fitted continent-pair fixed effects
 *   - AGE_FE with fitted age-pair fixed effects
 *   - EDUCATION_FE with fitted education-pair fixed effects
 */

// ─── Regression Coefficients ─────────────────────────────────────────────────
// Source: Baseline analysis, Column (3) — full fixed effects model
// Dependent variable: probability of separation within 1 year

export const SEPARATION_COEFS = {
  alpha: 0.055,   // Intercept (approximate baseline)
  beta1: -0.24,   // Cultural distance linear term
  beta2: 0.62,    // Cultural distance squared term
  optimalPsi: 0.195,
};

// Under-30 subgroup (both partners < 30)
export const SEPARATION_COEFS_YOUNG = {
  alpha: 0.080,
  beta1: -0.58,
  beta2: 2.08,
  optimalPsi: 0.140,
};

// Child Prosperity (log wages)
const PROSPERITY_COEFS = { beta1: 1.63, beta2: -4.23, optimalPsi: 0.192 };

// Child Educational Attainment
const EDUCATION_COEFS = { beta1: 2.21, beta2: -5.82, optimalPsi: 0.189 };

// Child Creativity / Cognitive Flexibility (originality)
const CREATIVITY_COEFS = { beta1: 0.11, beta2: -0.27, optimalPsi: 0.205 };

// Child Focus (total activities in a day — higher = less focused, linear)
const FOCUS_SLOPE = 2.86;

// ─── Normalization Bounds ─────────────────────────────────────────────────────
// Log-scale normalization handles the wide dynamic range of separation risk.
// Observed range: ~0.02 (optimal ψ, positive FEs) to ~0.30 (extreme ψ, young model).
const SEP_LOG_MIN = Math.log(0.020);
const SEP_LOG_MAX = Math.log(0.300);

// ─── PLACEHOLDER: Cultural Distance Matrix ───────────────────────────────────
// Values represent pre-historic migratory distance normalized to [0,1].
// Accounting for Post-1500 migration flows per Pemberton et al. (2013).
// Replace with Reprium's full proprietary distance matrix when available.
const DISTANCE_MATRIX = {
  british:          { british: 0.00, irish: 0.03, scottish: 0.02, welsh: 0.03, french: 0.07, german: 0.09, dutch: 0.08, scandinavian: 0.10, italian: 0.11, spanish: 0.12, polish: 0.13, eastern_european: 0.14, russian: 0.16, greek: 0.15, jewish: 0.18, turkish: 0.22, arab: 0.28, persian: 0.27, south_asian: 0.35, east_asian: 0.42, southeast_asian: 0.40, african: 0.48, latin_american: 0.25, native_american: 0.44 },
  irish:            { british: 0.03, irish: 0.00, scottish: 0.02, welsh: 0.03, french: 0.08, german: 0.10, dutch: 0.09, scandinavian: 0.11, italian: 0.12, spanish: 0.11, polish: 0.14, eastern_european: 0.15, russian: 0.17, greek: 0.16, jewish: 0.19, turkish: 0.23, arab: 0.29, persian: 0.28, south_asian: 0.36, east_asian: 0.43, southeast_asian: 0.41, african: 0.49, latin_american: 0.26, native_american: 0.45 },
  scottish:         { british: 0.02, irish: 0.02, scottish: 0.00, welsh: 0.02, french: 0.08, german: 0.10, dutch: 0.08, scandinavian: 0.10, italian: 0.11, spanish: 0.12, polish: 0.13, eastern_european: 0.14, russian: 0.16, greek: 0.15, jewish: 0.18, turkish: 0.22, arab: 0.28, persian: 0.27, south_asian: 0.35, east_asian: 0.42, southeast_asian: 0.40, african: 0.48, latin_american: 0.25, native_american: 0.44 },
  welsh:            { british: 0.03, irish: 0.03, scottish: 0.02, welsh: 0.00, french: 0.08, german: 0.10, dutch: 0.08, scandinavian: 0.10, italian: 0.11, spanish: 0.12, polish: 0.13, eastern_european: 0.14, russian: 0.16, greek: 0.15, jewish: 0.18, turkish: 0.22, arab: 0.28, persian: 0.27, south_asian: 0.35, east_asian: 0.42, southeast_asian: 0.40, african: 0.48, latin_american: 0.25, native_american: 0.44 },
  french:           { british: 0.07, irish: 0.08, scottish: 0.08, welsh: 0.08, french: 0.00, german: 0.06, dutch: 0.07, scandinavian: 0.09, italian: 0.07, spanish: 0.07, polish: 0.10, eastern_european: 0.11, russian: 0.14, greek: 0.12, jewish: 0.17, turkish: 0.21, arab: 0.27, persian: 0.26, south_asian: 0.35, east_asian: 0.42, southeast_asian: 0.40, african: 0.48, latin_american: 0.24, native_american: 0.44 },
  german:           { british: 0.09, irish: 0.10, scottish: 0.10, welsh: 0.10, french: 0.06, german: 0.00, dutch: 0.04, scandinavian: 0.07, italian: 0.09, spanish: 0.10, polish: 0.07, eastern_european: 0.08, russian: 0.11, greek: 0.12, jewish: 0.15, turkish: 0.19, arab: 0.26, persian: 0.25, south_asian: 0.34, east_asian: 0.41, southeast_asian: 0.39, african: 0.47, latin_american: 0.24, native_american: 0.43 },
  dutch:            { british: 0.08, irish: 0.09, scottish: 0.08, welsh: 0.08, french: 0.07, german: 0.04, dutch: 0.00, scandinavian: 0.06, italian: 0.10, spanish: 0.11, polish: 0.08, eastern_european: 0.09, russian: 0.12, greek: 0.13, jewish: 0.15, turkish: 0.19, arab: 0.26, persian: 0.25, south_asian: 0.34, east_asian: 0.41, southeast_asian: 0.39, african: 0.47, latin_american: 0.24, native_american: 0.43 },
  scandinavian:     { british: 0.10, irish: 0.11, scottish: 0.10, welsh: 0.10, french: 0.09, german: 0.07, dutch: 0.06, scandinavian: 0.00, italian: 0.12, spanish: 0.13, polish: 0.10, eastern_european: 0.11, russian: 0.12, greek: 0.14, jewish: 0.17, turkish: 0.21, arab: 0.28, persian: 0.27, south_asian: 0.36, east_asian: 0.43, southeast_asian: 0.41, african: 0.49, latin_american: 0.26, native_american: 0.45 },
  italian:          { british: 0.11, irish: 0.12, scottish: 0.11, welsh: 0.11, french: 0.07, german: 0.09, dutch: 0.10, scandinavian: 0.12, italian: 0.00, spanish: 0.06, polish: 0.11, eastern_european: 0.12, russian: 0.14, greek: 0.10, jewish: 0.16, turkish: 0.20, arab: 0.26, persian: 0.25, south_asian: 0.34, east_asian: 0.41, southeast_asian: 0.39, african: 0.47, latin_american: 0.22, native_american: 0.43 },
  spanish:          { british: 0.12, irish: 0.11, scottish: 0.12, welsh: 0.12, french: 0.07, german: 0.10, dutch: 0.11, scandinavian: 0.13, italian: 0.06, spanish: 0.00, polish: 0.13, eastern_european: 0.13, russian: 0.15, greek: 0.11, jewish: 0.17, turkish: 0.21, arab: 0.22, persian: 0.24, south_asian: 0.33, east_asian: 0.41, southeast_asian: 0.39, african: 0.47, latin_american: 0.18, native_american: 0.42 },
  polish:           { british: 0.13, irish: 0.14, scottish: 0.13, welsh: 0.13, french: 0.10, german: 0.07, dutch: 0.08, scandinavian: 0.10, italian: 0.11, spanish: 0.13, polish: 0.00, eastern_european: 0.04, russian: 0.05, greek: 0.09, jewish: 0.13, turkish: 0.18, arab: 0.25, persian: 0.24, south_asian: 0.33, east_asian: 0.40, southeast_asian: 0.38, african: 0.46, latin_american: 0.23, native_american: 0.42 },
  eastern_european: { british: 0.14, irish: 0.15, scottish: 0.14, welsh: 0.14, french: 0.11, german: 0.08, dutch: 0.09, scandinavian: 0.11, italian: 0.12, spanish: 0.13, polish: 0.04, eastern_european: 0.00, russian: 0.04, greek: 0.08, jewish: 0.12, turkish: 0.17, arab: 0.24, persian: 0.23, south_asian: 0.32, east_asian: 0.39, southeast_asian: 0.37, african: 0.45, latin_american: 0.23, native_american: 0.41 },
  russian:          { british: 0.16, irish: 0.17, scottish: 0.16, welsh: 0.16, french: 0.14, german: 0.11, dutch: 0.12, scandinavian: 0.12, italian: 0.14, spanish: 0.15, polish: 0.05, eastern_european: 0.04, russian: 0.00, greek: 0.10, jewish: 0.14, turkish: 0.16, arab: 0.23, persian: 0.20, south_asian: 0.31, east_asian: 0.38, southeast_asian: 0.36, african: 0.44, latin_american: 0.24, native_american: 0.40 },
  greek:            { british: 0.15, irish: 0.16, scottish: 0.15, welsh: 0.15, french: 0.12, german: 0.12, dutch: 0.13, scandinavian: 0.14, italian: 0.10, spanish: 0.11, polish: 0.09, eastern_european: 0.08, russian: 0.10, greek: 0.00, jewish: 0.13, turkish: 0.14, arab: 0.22, persian: 0.22, south_asian: 0.30, east_asian: 0.39, southeast_asian: 0.37, african: 0.45, latin_american: 0.22, native_american: 0.41 },
  jewish:           { british: 0.18, irish: 0.19, scottish: 0.18, welsh: 0.18, french: 0.17, german: 0.15, dutch: 0.15, scandinavian: 0.17, italian: 0.16, spanish: 0.17, polish: 0.13, eastern_european: 0.12, russian: 0.14, greek: 0.13, jewish: 0.00, turkish: 0.16, arab: 0.18, persian: 0.19, south_asian: 0.32, east_asian: 0.40, southeast_asian: 0.38, african: 0.46, latin_american: 0.24, native_american: 0.42 },
  turkish:          { british: 0.22, irish: 0.23, scottish: 0.22, welsh: 0.22, french: 0.21, german: 0.19, dutch: 0.19, scandinavian: 0.21, italian: 0.20, spanish: 0.21, polish: 0.18, eastern_european: 0.17, russian: 0.16, greek: 0.14, jewish: 0.16, turkish: 0.00, arab: 0.15, persian: 0.16, south_asian: 0.27, east_asian: 0.36, southeast_asian: 0.34, african: 0.43, latin_american: 0.24, native_american: 0.38 },
  arab:             { british: 0.28, irish: 0.29, scottish: 0.28, welsh: 0.28, french: 0.27, german: 0.26, dutch: 0.26, scandinavian: 0.28, italian: 0.26, spanish: 0.22, polish: 0.25, eastern_european: 0.24, russian: 0.23, greek: 0.22, jewish: 0.18, turkish: 0.15, arab: 0.00, persian: 0.12, south_asian: 0.23, east_asian: 0.33, southeast_asian: 0.31, african: 0.42, latin_american: 0.26, native_american: 0.36 },
  persian:          { british: 0.27, irish: 0.28, scottish: 0.27, welsh: 0.27, french: 0.26, german: 0.25, dutch: 0.25, scandinavian: 0.27, italian: 0.25, spanish: 0.24, polish: 0.24, eastern_european: 0.23, russian: 0.20, greek: 0.22, jewish: 0.19, turkish: 0.16, arab: 0.12, persian: 0.00, south_asian: 0.20, east_asian: 0.31, southeast_asian: 0.29, african: 0.43, latin_american: 0.27, native_american: 0.34 },
  south_asian:      { british: 0.35, irish: 0.36, scottish: 0.35, welsh: 0.35, french: 0.35, german: 0.34, dutch: 0.34, scandinavian: 0.36, italian: 0.34, spanish: 0.33, polish: 0.33, eastern_european: 0.32, russian: 0.31, greek: 0.30, jewish: 0.32, turkish: 0.27, arab: 0.23, persian: 0.20, south_asian: 0.00, east_asian: 0.22, southeast_asian: 0.18, african: 0.48, latin_american: 0.34, native_american: 0.26 },
  east_asian:       { british: 0.42, irish: 0.43, scottish: 0.42, welsh: 0.42, french: 0.42, german: 0.41, dutch: 0.41, scandinavian: 0.43, italian: 0.41, spanish: 0.41, polish: 0.40, eastern_european: 0.39, russian: 0.38, greek: 0.39, jewish: 0.40, turkish: 0.36, arab: 0.33, persian: 0.31, south_asian: 0.22, east_asian: 0.00, southeast_asian: 0.10, african: 0.52, latin_american: 0.38, native_american: 0.15 },
  southeast_asian:  { british: 0.40, irish: 0.41, scottish: 0.40, welsh: 0.40, french: 0.40, german: 0.39, dutch: 0.39, scandinavian: 0.41, italian: 0.39, spanish: 0.39, polish: 0.38, eastern_european: 0.37, russian: 0.36, greek: 0.37, jewish: 0.38, turkish: 0.34, arab: 0.31, persian: 0.29, south_asian: 0.18, east_asian: 0.10, southeast_asian: 0.00, african: 0.50, latin_american: 0.36, native_american: 0.12 },
  african:          { british: 0.48, irish: 0.49, scottish: 0.48, welsh: 0.48, french: 0.48, german: 0.47, dutch: 0.47, scandinavian: 0.49, italian: 0.47, spanish: 0.47, polish: 0.46, eastern_european: 0.45, russian: 0.44, greek: 0.45, jewish: 0.46, turkish: 0.43, arab: 0.42, persian: 0.43, south_asian: 0.48, east_asian: 0.52, southeast_asian: 0.50, african: 0.00, latin_american: 0.42, native_american: 0.50 },
  latin_american:   { british: 0.25, irish: 0.26, scottish: 0.25, welsh: 0.25, french: 0.24, german: 0.24, dutch: 0.24, scandinavian: 0.26, italian: 0.22, spanish: 0.18, polish: 0.23, eastern_european: 0.23, russian: 0.24, greek: 0.22, jewish: 0.24, turkish: 0.24, arab: 0.26, persian: 0.27, south_asian: 0.34, east_asian: 0.38, southeast_asian: 0.36, african: 0.42, latin_american: 0.00, native_american: 0.28 },
  native_american:  { british: 0.44, irish: 0.45, scottish: 0.44, welsh: 0.44, french: 0.44, german: 0.43, dutch: 0.43, scandinavian: 0.45, italian: 0.43, spanish: 0.42, polish: 0.42, eastern_european: 0.41, russian: 0.40, greek: 0.41, jewish: 0.42, turkish: 0.38, arab: 0.36, persian: 0.34, south_asian: 0.26, east_asian: 0.15, southeast_asian: 0.12, african: 0.50, latin_american: 0.28, native_american: 0.00 },
};

// ─── PLACEHOLDER: Fixed Effects ──────────────────────────────────────────────
// These values are simplified proxies. The full model uses fitted FE coefficients
// from the CPS regression across ~2,000 ancestry pairs and 18,187 observations.

const EDUCATION_LEVELS = ['no_hs', 'hs', 'some_college', 'college', 'masters', 'phd'];

function getEducationFE(eduA, eduB) {
  // PLACEHOLDER: Replace with fitted education-pair FE from regression
  const idxA = EDUCATION_LEVELS.indexOf(eduA);
  const idxB = EDUCATION_LEVELS.indexOf(eduB);
  const avgLevel = (idxA + idxB) / 2;
  const gap = Math.abs(idxA - idxB);
  // Higher education = lower separation risk; large gap slightly increases risk
  return -0.002 * (avgLevel / 5) + 0.0015 * (gap > 2 ? gap - 2 : 0);
}

function getAgeFE(ageA, ageB) {
  // PLACEHOLDER: Replace with fitted age-pair FE from regression
  const avgAge = (ageA + ageB) / 2;
  const gap = Math.abs(ageA - ageB);
  // Older couples slightly more stable; large age gaps slightly increase risk
  return -0.002 * Math.max(0, (avgAge - 25) / 10) + 0.003 * Math.max(0, (gap - 5) / 5);
}

function getAncestryFE(ancestry) {
  // PLACEHOLDER: Replace with fitted ancestry fixed effects from CPS regression
  // These capture all observable and unobservable factors associated with each ancestry
  // that affect separation rates (gender norms, trust, cooperation, individualism, etc.)
  const fe = {
    british: -0.0012, irish: -0.0008, scottish: -0.0010, welsh: -0.0010,
    french: -0.0005, german: -0.0015, dutch: -0.0012, scandinavian: -0.0018,
    italian: 0.0002, spanish: 0.0005, polish: -0.0010, eastern_european: -0.0008,
    russian: 0.0010, greek: 0.0008, jewish: -0.0020, turkish: 0.0015,
    arab: 0.0010, persian: 0.0008, south_asian: -0.0005, east_asian: -0.0025,
    southeast_asian: -0.0015, african: 0.0020, latin_american: 0.0015, native_american: 0.0010,
  };
  return fe[ancestry] ?? 0;
}

function getContinentFE(ancestryA, ancestryB) {
  // PLACEHOLDER: Replace with fitted continent-pair FE
  // Captures all factors associated with the ancestral continent pair
  const continent = {
    british: 'europe', irish: 'europe', scottish: 'europe', welsh: 'europe',
    french: 'europe', german: 'europe', dutch: 'europe', scandinavian: 'europe',
    italian: 'europe', spanish: 'europe', polish: 'europe', eastern_european: 'europe',
    russian: 'europe', greek: 'europe', jewish: 'middle_east',
    turkish: 'middle_east', arab: 'middle_east', persian: 'middle_east',
    south_asian: 'asia', east_asian: 'asia', southeast_asian: 'asia',
    african: 'africa', latin_american: 'americas', native_american: 'americas',
  };
  const cA = continent[ancestryA] ?? 'europe';
  const cB = continent[ancestryB] ?? 'europe';
  if (cA === cB) return -0.003;  // Same continent: slight reduction in risk
  const sameMacro = (cA === 'europe' && cB === 'middle_east') || (cA === 'middle_east' && cB === 'europe');
  return sameMacro ? -0.001 : 0.002;
}

// ─── Core Distance Computation ───────────────────────────────────────────────

/** Compute cultural distance ψ between two sets of ancestries (up to 2 each). */
export function computeCulturalDistance(ancestriesA, ancestriesB) {
  if (!ancestriesA?.length || !ancestriesB?.length) return 0.15; // Default
  let total = 0;
  let count = 0;
  for (const a of ancestriesA) {
    for (const b of ancestriesB) {
      const row = DISTANCE_MATRIX[a] ?? DISTANCE_MATRIX['british'];
      const d = row[b] ?? 0.15;
      total += d;
      count++;
    }
  }
  return count > 0 ? total / count : 0.15;
}

// ─── Relationship Synergy Score ───────────────────────────────────────────────

export function computeRelationshipScore(input) {
  const { ancestriesA, ancestriesB, ageA, ageB, eduA, eduB } = input;
  const psi = computeCulturalDistance(ancestriesA, ancestriesB);
  const psi2 = psi * psi;

  const isYoung = Math.max(ageA, ageB) < 30;
  const coefs = isYoung ? SEPARATION_COEFS_YOUNG : SEPARATION_COEFS;

  // Core quadratic effect
  const B_core = coefs.alpha + coefs.beta1 * psi + coefs.beta2 * psi2;

  // Fixed effects (placeholders for proprietary values)
  const fe_age = getAgeFE(ageA, ageB);
  const fe_edu = getEducationFE(eduA, eduB);
  const fe_anc = ancestriesA.reduce((s, a) => s + getAncestryFE(a), 0) / ancestriesA.length
               + ancestriesB.reduce((s, a) => s + getAncestryFE(a), 0) / ancestriesB.length;
  const fe_cont = getContinentFE(ancestriesA[0], ancestriesB[0]);

  const B_hat = B_core + fe_age + fe_edu + fe_anc + fe_cont;

  // Log-scale normalize to 0–100 (100 = best, 0 = worst)
  const logB = Math.log(Math.max(0.015, B_hat));
  const score = Math.round(
    Math.max(0, Math.min(100,
      100 * (1 - (logB - SEP_LOG_MIN) / (SEP_LOG_MAX - SEP_LOG_MIN))
    ))
  );

  return {
    psi,
    psi2,
    B_core,
    B_hat,
    fe_age,
    fe_edu,
    fe_anc,
    fe_cont,
    score,
    isYoung,
    coefs,
    optimalPsi: coefs.optimalPsi,
    betaPsi: coefs.beta1 * psi,
    betaPsi2: coefs.beta2 * psi2,
    alpha: coefs.alpha,
  };
}

// ─── Child Well-Being Scores ──────────────────────────────────────────────────

function childScore(coefs, psi) {
  const actual = coefs.beta1 * psi + coefs.beta2 * psi * psi;
  const peak = coefs.beta1 * coefs.optimalPsi + coefs.beta2 * coefs.optimalPsi * coefs.optimalPsi;
  return Math.round(Math.max(0, Math.min(100, 100 * (actual / peak))));
}

export function computeChildWellBeing(psi) {
  const prosperity = childScore(PROSPERITY_COEFS, psi);
  const education = childScore(EDUCATION_COEFS, psi);
  const creativity = childScore(CREATIVITY_COEFS, psi);

  // Focus decreases with distance (linear); normalized to 0–100
  const maxLackOfFocus = FOCUS_SLOPE * 0.5;
  const lackOfFocus = Math.min(FOCUS_SLOPE * psi, maxLackOfFocus);
  const focus = Math.round(Math.max(0, 100 * (1 - lackOfFocus / maxLackOfFocus)));

  const overall = Math.round((prosperity + education + creativity + focus) / 4);

  return { prosperity, education, creativity, focus, overall };
}

// ─── Spark & Cohesion ─────────────────────────────────────────────────────────

export function computeSparkCohesion(psi) {
  // Spark: increases with distance at decreasing rate (concave function)
  // s'(ψ) > 0, s''(ψ) < 0, s'(1) = 0
  const spark = Math.round(Math.min(100, 100 * Math.sqrt(psi / 0.5)));

  // Cohesion: decreases with distance at increasing rate (convex function)
  // c'(ψ) < 0, c''(ψ) < 0
  const cohesion = Math.round(Math.max(0, 100 * Math.pow(1 - psi, 1.4)));

  return { spark, cohesion };
}

// ─── Curve Data Generation ────────────────────────────────────────────────────

export function generateSeparationCurveData(isYoung = false) {
  const coefs = isYoung ? SEPARATION_COEFS_YOUNG : SEPARATION_COEFS;
  return Array.from({ length: 51 }, (_, i) => {
    const psi = i / 100;
    const risk = Math.max(0.015, coefs.alpha + coefs.beta1 * psi + coefs.beta2 * psi * psi);
    const logB = Math.log(risk);
    const synergy = Math.max(0, Math.min(100,
      100 * (1 - (logB - SEP_LOG_MIN) / (SEP_LOG_MAX - SEP_LOG_MIN))
    ));
    const spark = Math.min(100, 100 * Math.sqrt(psi / 0.5));
    const cohesion = Math.max(0, 100 * Math.pow(1 - psi, 1.4));
    return { psi: parseFloat(psi.toFixed(2)), risk: parseFloat(risk.toFixed(4)), synergy: parseFloat(synergy.toFixed(1)), spark: parseFloat(spark.toFixed(1)), cohesion: parseFloat(cohesion.toFixed(1)) };
  });
}

export function generateChildCurveData() {
  return Array.from({ length: 51 }, (_, i) => {
    const psi = i / 100;
    const pros = Math.max(0, PROSPERITY_COEFS.beta1 * psi + PROSPERITY_COEFS.beta2 * psi * psi);
    const edu  = Math.max(0, EDUCATION_COEFS.beta1 * psi + EDUCATION_COEFS.beta2 * psi * psi);
    const cre  = Math.max(0, CREATIVITY_COEFS.beta1 * psi + CREATIVITY_COEFS.beta2 * psi * psi);
    const peakPros = PROSPERITY_COEFS.beta1 * PROSPERITY_COEFS.optimalPsi + PROSPERITY_COEFS.beta2 * PROSPERITY_COEFS.optimalPsi ** 2;
    const peakEdu  = EDUCATION_COEFS.beta1 * EDUCATION_COEFS.optimalPsi + EDUCATION_COEFS.beta2 * EDUCATION_COEFS.optimalPsi ** 2;
    const peakCre  = CREATIVITY_COEFS.beta1 * CREATIVITY_COEFS.optimalPsi + CREATIVITY_COEFS.beta2 * CREATIVITY_COEFS.optimalPsi ** 2;
    return {
      psi: parseFloat(psi.toFixed(2)),
      prosperity: parseFloat(((pros / peakPros) * 100).toFixed(1)),
      education: parseFloat(((edu / peakEdu) * 100).toFixed(1)),
      creativity: parseFloat(((cre / peakCre) * 100).toFixed(1)),
    };
  });
}

// ─── Full Score Bundle ────────────────────────────────────────────────────────

export function computeFullScore(input) {
  const rel = computeRelationshipScore(input);
  const child = computeChildWellBeing(rel.psi);
  const sc = computeSparkCohesion(rel.psi);
  const overall = Math.round((rel.score * 0.6 + child.overall * 0.4));
  return { ...rel, child, sparkCohesion: sc, overall };
}
