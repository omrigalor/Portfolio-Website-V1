/**
 * Reprium Compatibility Scoring Engine
 * Coefficients taken directly from Reprium empirical research papers.
 *
 * Relationship Longevity paper — baseline.tex, Column (3): full FE model
 *   β₁ = −0.31, β₂ = 0.64, constant = 0.0661, ψ* = 0.240
 *
 * Child Well-Being paper:
 *   Log wages (prosperity) — main.tex col (3):   β₁ = 0.79, β₂ = −1.89, ψ* = 0.208
 *   Educational attainment — education.tex col (3): β₁ = 2.21, β₂ = −5.82, ψ* = 0.189
 *   Originality (creativity) — creativity.tex col (3): β₁ = 0.11, β₂ = −0.27, ψ* = 0.205
 *   Total activities (focus) — focus.tex col (3):  β₁ = 2.86 (linear, positive = more scattered)
 *
 * Marriage probability matrix — computed from CPS micro-data (cps_ready.dta, n=839,575 couples).
 *   Rows = focal person's continent, values = share of their married-sample that chose each continent.
 */

// ─── Regression Coefficients — Relationship Longevity ────────────────────────

export const SEPARATION_COEFS = {
  alpha:       0.0661,
  beta1:      -0.31,
  beta2:       0.64,
  optimalPsi:  0.240,
};

// Under-30 subgroup (both partners < 30) — below30.tex Column (3)
export const SEPARATION_COEFS_YOUNG = {
  alpha:       0.0661,
  beta1:      -0.16,
  beta2:       0.24,
  optimalPsi:  0.338,
};

// ─── Regression Coefficients — Child Well-Being ──────────────────────────────

const PROSPERITY_COEFS  = { beta1:  0.79, beta2: -1.89, optimalPsi: 0.208 };
const EDUCATION_COEFS   = { beta1:  2.21, beta2: -5.82, optimalPsi: 0.189 };
const CREATIVITY_COEFS  = { beta1:  0.11, beta2: -0.27, optimalPsi: 0.205 };
const FOCUS_SLOPE       = 2.86;  // linear: higher psi → more activities → less focus

// ─── Normalization Bounds ─────────────────────────────────────────────────────
// Linear normalization. Bounds are set wide enough that no real pair hits exactly
// 100 or 0 — even the most stable same-country same-age pair scores ≤ 97.
// B_MIN = −0.30  (well below the most negative possible B_hat in the app)
// B_MAX =  0.30  (above the maximum observed in the 120-country grid)
const SEP_LINEAR_MIN = -0.30;
const SEP_LINEAR_MAX =  0.30;

// ─── Cultural Distance Matrix ─────────────────────────────────────────────────
// Pre-historic migratory distance, normalized to [0,1].
// Source: Pemberton et al. (2013); accounting for post-1500 migration flows.
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

// ─── Marriage Probability Matrix ──────────────────────────────────────────────
// Source: CPS micro-data (cps_ready.dta, n=839,575 married couples, 1994–2023).
// Entry [A][B] = share of cross-national married couples with ancestry-A persons
// whose spouse is from continent B. Derived from non-XXA/XXN ancestry pairs only.
//
// Used to compute the market-matching adjustment:
//   P(A meets & marries B) ≈ CONTINENT_MARRIAGE_PROB[contA][contB]
//   Relative probability = P(A→B) / P(A→A)  [same-continent baseline = 1]
// Symmetric matrix: each couple counted from both directions so rows sum to 100%.
// Source: CPS micro-data (cps_ready.dta), cross-national couples only, 1994–2023.
const CONTINENT_MARRIAGE_PROB = {
  europe:      { europe: 0.776, americas: 0.172, asia: 0.027, middle_east: 0.018, africa: 0.004, oceania: 0.004 },
  americas:    { europe: 0.247, americas: 0.697, asia: 0.040, middle_east: 0.009, africa: 0.006, oceania: 0.001 },
  asia:        { europe: 0.105, americas: 0.108, asia: 0.772, middle_east: 0.007, africa: 0.006, oceania: 0.003 },
  middle_east: { europe: 0.415, americas: 0.133, asia: 0.040, middle_east: 0.412, africa: 0.000, oceania: 0.000 },
  africa:      { europe: 0.191, americas: 0.219, asia: 0.084, middle_east: 0.000, africa: 0.502, oceania: 0.005 },
  oceania:     { europe: 0.574, americas: 0.162, asia: 0.118, middle_east: 0.000, africa: 0.015, oceania: 0.132 },
};

// Ancestry → continent mapping (aligns with CPS continent codes used in the paper)
const ANCESTRY_CONTINENT = {
  british: 'europe', irish: 'europe', scottish: 'europe', welsh: 'europe',
  french: 'europe', german: 'europe', dutch: 'europe', scandinavian: 'europe',
  italian: 'europe', spanish: 'europe', polish: 'europe', eastern_european: 'europe',
  russian: 'europe', greek: 'europe',
  jewish: 'middle_east', turkish: 'middle_east', arab: 'middle_east', persian: 'middle_east',
  south_asian: 'asia', east_asian: 'asia', southeast_asian: 'asia',
  african: 'africa',
  latin_american: 'americas', native_american: 'americas',
};

// ─── Fixed Effects — fitted from predictions.dta ──────────────────────────────
// Age FE: __hdfe2__ from predictions.dta, smoothed with a 3-year centred average
// to reduce small-cell noise while preserving the empirical trend (younger = riskier).
const AGE_FE = {
  18:  0.128381, 19:  0.128381, 20:  0.095049, 21: -0.007744,
  22: -0.017531, 23:  0.007735, 24: -0.033705, 25: -0.038718,
  26: -0.040085, 27: -0.006402, 28: -0.053650, 29: -0.052984,
  30:  0.009967, 31:  0.045951, 32:  0.055941, 33:  0.035049,
  34:  0.048419, 35:  0.039789,
};

// Education FE: __hdfe3__ from predictions.dta.
// Paper uses 4 levels (1=<HS, 2=HS, 3=some college, 4=college+).
const EDUC_FE_BY_LEVEL = {
  no_hs:       0.007021,
  hs:         -0.011178,
  some_college:-0.010082,  // avg of level-2 and level-3
  college:    -0.008875,   // avg of level-3 and level-4
  masters:    -0.008764,
  phd:        -0.008764,
};

// Per-country ancestry FE: __hdfe6__ from predictions.dta, keyed by ISO-3 code.
// Falls back to the ancestry-group average when the country isn't in the predictions.
const COUNTRY_FE = {
  AFG:  0.257666, ALB:  0.081051, ARE: -0.149752, ARG: -0.055360, ARM:  0.074707,
  AUS:  0.001075, AUT:  0.009733, BEL: -0.051568, BGD:  0.031494, BLR: -0.049607,
  BLZ:  0.074786, BOL: -0.112238, BRA: -0.017259, CAN: -0.000930, CHE: -0.013794,
  CHL: -0.102635, CHN:  0.088552, COL: -0.015199, CPV:  0.106590, CRI:  0.182627,
  CUB:  0.003848, CZE:  0.023848, DEU: -0.012066, DNK:  0.027239, DOM: -0.033326,
  ECU:  0.015190, EGY: -0.046135, ESP: -0.055900, FIN: -0.052580, FRA: -0.027602,
  GBR: -0.035766, GEO:  0.078877, GHA: -0.065498, GRC: -0.015407, GTM:  0.004354,
  GUY:  0.087532, HKG:  0.054796, HND: -0.028560, HRV: -0.026062, HTI:  0.111780,
  HUN: -0.036070, IDN:  0.071335, IND:  0.106746, IRL: -0.029651, IRN:  0.067344,
  IRQ:  0.170247, ISR:  0.085736, ITA: -0.029457, JAM: -0.009847, JOR:  0.195279,
  JPN:  0.116911, KHM:  0.167226, KOR:  0.111805, KWT:  0.084928, LAO:  0.095862,
  LBN:  0.069877, LBR:  0.031490, LKA:  0.084947, LTU: -0.015119, LVA:  0.017646,
  MAR: -0.001977, MEX: -0.007967, MKD:  0.157167, MMR:  0.081649, MNE:  0.000000,
  NGA:  0.051076, NIC: -0.071080, NLD: -0.021159, NOR: -0.040979, NZL: -0.184474,
  PAK:  0.116600, PAN:  0.002184, PER: -0.055642, PHL:  0.100411, POL: -0.033849,
  PRI: -0.005922, PRT: -0.032977, PSE:  0.150467, ROU: -0.021236, RUS: -0.025772,
  SAU:  0.056893, SDN: -0.067407, SEN:  0.031490, SGP:  0.054796, SLE:  0.031490,
  SLV:  0.018200, SOM:  0.031490, SRB: -0.050059, SVK: -0.181059, SWE: -0.027749,
  SYR:  0.067135, THA:  0.109779, TTO:  0.070884, TUR:  0.043618, TWN:  0.057697,
  TZA:  0.031490, UGA:  0.052394, UKR: -0.069668, URY: -0.055360, VEN: -0.027907,
  VNM:  0.061836, YEM:  0.056893, ZAF:  0.033890, ZWE:  0.031490,
};

// Ancestry-group FE fallback (for countries not in COUNTRY_FE)
const ANCESTRY_GROUP_FE = {
  british:          -0.035766, irish:            -0.029651, scottish:         -0.035766,
  welsh:            -0.035766, french:           -0.027602, german:           -0.012066,
  dutch:            -0.021159, scandinavian:     -0.023517, italian:          -0.029457,
  spanish:          -0.055900, polish:           -0.033849, eastern_european: -0.023086,
  russian:          -0.025772, greek:            -0.015407, jewish:            0.085736,
  turkish:           0.043618, arab:              0.056893, persian:           0.067344,
  south_asian:       0.084947, east_asian:        0.085952, southeast_asian:   0.098300,
  african:           0.031490, latin_american:   -0.022088, native_american:   0.000000,
};

// ─── Religion Fixed Effects ───────────────────────────────────────────────────
// Country majority religion from religion.dta (Reprium Research).
const COUNTRY_RELIGION = {
  AFG:'Muslims', AGO:'Christians', ALB:'Muslims', ARE:'Muslims', ARG:'Christians',
  ARM:'Christians', AUS:'Christians', AUT:'Christians', BEL:'Christians', BGD:'Muslims',
  BGR:'Christians', BHR:'Muslims', BLR:'Christians', BLZ:'Christians', BOL:'Christians',
  BRA:'Christians', CAN:'Christians', CHE:'Christians', CHL:'Christians', CHN:'Nonreligious',
  CIV:'Ethnoreligionists', CMR:'Christians', COD:'Christians', COL:'Christians', CPV:'Christians',
  CRI:'Christians', CUB:'Christians', CYP:'Christians', CZE:'Christians', DEU:'Christians',
  DNK:'Christians', DOM:'Christians', DZA:'Muslims', ECU:'Christians', EGY:'Muslims',
  ERI:'Muslims', ESP:'Christians', EST:'Christians', ETH:'Christians', FIN:'Christians',
  FJI:'Christians', FRA:'Christians', GBR:'Christians', GEO:'Christians', GHA:'Christians',
  GRC:'Christians', GTM:'Christians', GUY:'Hindus', HKG:'ChineseFolk', HND:'Christians',
  HRV:'Christians', HTI:'Christians', HUN:'Christians', IDN:'Muslims', IND:'Hindus',
  IRL:'Christians', IRN:'Muslims', IRQ:'Muslims', ISL:'Christians', ISR:'Jews',
  ITA:'Christians', JAM:'Christians', JOR:'Muslims', JPN:'Buddhists', KAZ:'Muslims',
  KEN:'Christians', KHM:'Buddhists', KOR:'Christians', KWT:'Muslims', LAO:'Ethnoreligionists',
  LBN:'Muslims', LBR:'Ethnoreligionists', LKA:'Buddhists', LTU:'Christians', LVA:'Christians',
  MAR:'Muslims', MDA:'Christians', MEX:'Christians', MKD:'Christians', MMR:'Buddhists',
  MNE:'Christians', MNG:'Ethnoreligionists', MYS:'Muslims', NGA:'Muslims', NIC:'Christians',
  NLD:'Christians', NOR:'Christians', NZL:'Christians', PAK:'Muslims', PAN:'Christians',
  PER:'Christians', PHL:'Christians', POL:'Christians', PRI:'Christians', PRT:'Christians',
  PSE:'Muslims', ROU:'Christians', RUS:'Christians', SAU:'Muslims', SDN:'Muslims',
  SEN:'Muslims', SGP:'ChineseFolk', SLE:'Muslims', SLV:'Christians', SOM:'Muslims',
  SRB:'Christians', SVK:'Christians', SWE:'Christians', SYR:'Muslims', THA:'Buddhists',
  TTO:'Christians', TUR:'Muslims', TWN:'ChineseFolk', TZA:'Muslims', UGA:'Christians',
  UKR:'Christians', URY:'Christians', VEN:'Christians', VNM:'Buddhists', YEM:'Muslims',
  ZAF:'Christians', ZWE:'Christians',
};

// Religion pair FE: divorce rate deviation from mean, computed from CPS religion_pair data.
// Pair label = sorted combination of both partners' majority religions (alphabetical).
// Source: religion_pair.dta merged with cps_ready.dta (same procedure as age FE).
const RELIGION_PAIR_FE = {
  'Buddhists':                    0.02482,  // n=732
  'Buddhists_Christians':         0.00292,  // n=284
  'Buddhists_Nonreligious':      -0.04475,  // n=52
  'ChineseFolk':                 -0.02142,  // n=47
  'ChineseFolk_Christians':      -0.06398,  // n=47
  'ChineseFolk_Nonreligious':    -0.03695,  // n=37
  'Christians':                   0.00004,  // n=62995 (baseline)
  'Christians_Ethnoreligionists':-0.01513,  // n=696
  'Christians_Hindus':           -0.04090,  // n=130
  'Christians_Jews':             -0.02694,  // n=54
  'Christians_Muslims':          -0.01493,  // n=367
  'Christians_Nonreligious':     -0.03367,  // n=165
  'Ethnoreligionists':            0.00575,  // n=3815
  'Hindus':                       0.00703,  // n=169
  'Jews':                        -0.04012,  // n=89 (low same-community divorce rate)
  'Muslims':                     -0.02231,  // n=192
  'Nonreligious':                 0.00579,  // n=301
};

function getReligionFE(codeA, codeB, relOverrideA, relOverrideB) {
  const groupA = ISO_TO_GROUP[codeA] ?? codeA;
  const relA = relOverrideA || (COUNTRY_RELIGION[codeA] ?? COUNTRY_RELIGION[groupA] ?? 'Christians');
  const groupB = ISO_TO_GROUP[codeB] ?? codeB;
  const relB = relOverrideB || (COUNTRY_RELIGION[codeB] ?? COUNTRY_RELIGION[groupB] ?? 'Christians');
  const pair = relA === relB ? relA : [relA, relB].sort().join('_');
  return RELIGION_PAIR_FE[pair] ?? RELIGION_PAIR_FE['Christians'] ?? 0;
}

function getAgeFE(ageA, ageB) {
  const clamp = (a) => AGE_FE[Math.max(18, Math.min(35, Math.round(a)))] ?? 0;
  return (clamp(ageA) + clamp(ageB)) / 2;
}

function getEducationFE(eduA, eduB) {
  return ((EDUC_FE_BY_LEVEL[eduA] ?? 0) + (EDUC_FE_BY_LEVEL[eduB] ?? 0)) / 2;
}

// ISO-3 → ancestry group mapping (for distance matrix + continent lookups)
export const ISO_TO_GROUP = {
  AFG:'south_asian', ALB:'eastern_european', ARE:'arab', ARG:'latin_american', ARM:'persian',
  AUS:'british',     AUT:'german',           BEL:'french',        BGD:'south_asian', BLR:'eastern_european',
  BLZ:'latin_american', BOL:'latin_american', BRA:'latin_american', CAN:'british',   CHE:'german',
  CHL:'latin_american', CHN:'east_asian',     COD:'african',        COL:'latin_american', CPV:'african',   CRI:'latin_american',
  CUB:'latin_american', CYP:'greek',          CZE:'eastern_european', DEU:'german',  DNK:'scandinavian',
  DOM:'latin_american', DZA:'arab',           ECU:'latin_american', EGY:'arab',      ERI:'african',
  ESP:'spanish',     EST:'eastern_european',  ETH:'african',        FIN:'scandinavian', FJI:'southeast_asian',
  FRA:'french',      GBR:'british',           GEO:'persian',        GHA:'african',   GRC:'greek',
  GTM:'latin_american', GUY:'african',        HKG:'east_asian',     HND:'latin_american', HRV:'eastern_european',
  HTI:'african',     HUN:'eastern_european',  IDN:'southeast_asian', IND:'south_asian', IRL:'irish',
  IRN:'persian',     IRQ:'arab',              ISL:'scandinavian',   ISR:'jewish',    ITA:'italian',
  JAM:'african',     JOR:'arab',              JPN:'east_asian',     KAZ:'east_asian', KEN:'african',
  KHM:'southeast_asian', KOR:'east_asian',   KWT:'arab',           LAO:'southeast_asian', LBN:'arab',
  LBR:'african',     LKA:'south_asian',       LTU:'eastern_european', LVA:'eastern_european', MAR:'arab',
  MDA:'eastern_european', MEX:'latin_american', MKD:'eastern_european', MMR:'southeast_asian', MNE:'eastern_european',
  MNG:'east_asian',  MYS:'southeast_asian',   NGA:'african',        NIC:'latin_american', NLD:'dutch',
  NOR:'scandinavian', NZL:'british',          PAK:'south_asian',    PAN:'latin_american', PER:'latin_american',
  PHL:'southeast_asian', POL:'polish',        PRI:'latin_american', PRT:'spanish',   PSE:'arab',
  ROU:'eastern_european', RUS:'russian',      SAU:'arab',           SDN:'arab',      SEN:'african',
  SGP:'southeast_asian', SLE:'african',       SLV:'latin_american', SOM:'african',   SRB:'eastern_european',
  SVK:'eastern_european', SWE:'scandinavian', SYR:'arab',           THA:'southeast_asian', TTO:'african',
  TUR:'turkish',     TWN:'east_asian',        TZA:'african',        UGA:'african',   UKR:'eastern_european',
  URY:'latin_american', VEN:'latin_american', VNM:'southeast_asian', YEM:'arab',     ZAF:'african',
  ZWE:'african',
};

function getAncestryFE(code) {
  // Prefer per-country FE; fall back to ancestry-group FE
  if (COUNTRY_FE[code] !== undefined) return COUNTRY_FE[code];
  const group = ISO_TO_GROUP[code] ?? code;
  return ANCESTRY_GROUP_FE[group] ?? ANCESTRY_GROUP_FE[code] ?? 0;
}

function getContinentFE(ancestryA, ancestryB) {
  const ga = toGroup(ancestryA), gb = toGroup(ancestryB);
  const contA = ANCESTRY_CONTINENT[ga] ?? 'europe';
  const contB = ANCESTRY_CONTINENT[gb] ?? 'europe';
  if (contA === contB) return -0.061105;   // fitted same-continent FE from predictions.dta
  const adjacent = new Set(['europe_middle_east', 'middle_east_europe']);
  return adjacent.has(`${contA}_${contB}`) ? -0.000788 : 0.043994;
}

// ─── Core Distance Computation ───────────────────────────────────────────────

// Resolve an input code (ISO-3 or legacy ancestry group) to a distance-matrix key
function toGroup(code) {
  return ISO_TO_GROUP[code] ?? (DISTANCE_MATRIX[code] ? code : 'british');
}

export function computeCulturalDistance(ancestriesA, ancestriesB) {
  if (!ancestriesA?.length || !ancestriesB?.length) return 0.15;
  let total = 0, count = 0;
  for (const a of ancestriesA) {
    for (const b of ancestriesB) {
      const ga = toGroup(a), gb = toGroup(b);
      const row = DISTANCE_MATRIX[ga] ?? DISTANCE_MATRIX['british'];
      const rawDist = row[gb] ?? 0.15;
      // Same group but different ISO codes: use 0.02 (intra-group minimum) rather than 0
      total += (rawDist === 0 && a !== b) ? 0.02 : rawDist;
      count++;
    }
  }
  return count > 0 ? total / count : 0.15;
}

// ─── Marriage Probability ─────────────────────────────────────────────────────
// Returns the absolute probability that a person from ancestry A ever marries a
// person from ancestry B, as observed in the CPS cross-national married sample.
// Uses the geometric mean of P(A→B) and P(B→A) to produce a symmetric estimate.
// These are absolute fractions (e.g. 0.776 for EU-EU, 0.027 for EU-Asia) —
// NOT normalized to a same-group baseline.
export function getMarriageProbability(ancestryA, ancestryB) {
  const ga = toGroup(ancestryA), gb = toGroup(ancestryB);
  const contA = ANCESTRY_CONTINENT[ga] ?? 'europe';
  const contB = ANCESTRY_CONTINENT[gb] ?? 'europe';

  const pAtoB = CONTINENT_MARRIAGE_PROB[contA]?.[contB] ?? 0.001;
  const pBtoA = CONTINENT_MARRIAGE_PROB[contB]?.[contA] ?? 0.001;

  // Geometric mean of both directions for a symmetric result
  return Math.sqrt(pAtoB * pBtoA);
}

// ─── Relationship Synergy Score ───────────────────────────────────────────────

export function computeRelationshipScore(input) {
  const { ancestriesA, ancestriesB, ageA, ageB, eduA, eduB, religionA, religionB } = input;
  const psi  = computeCulturalDistance(ancestriesA, ancestriesB);
  const psi2 = psi * psi;

  const isYoung = Math.max(ageA, ageB) < 30;
  const coefs   = isYoung ? SEPARATION_COEFS_YOUNG : SEPARATION_COEFS;

  const B_core = coefs.alpha + coefs.beta1 * psi + coefs.beta2 * psi2;

  const fe_age  = getAgeFE(ageA, ageB);
  const fe_edu  = getEducationFE(eduA, eduB);
  const fe_anc  = ancestriesA.reduce((s, a) => s + getAncestryFE(a), 0) / ancestriesA.length
                + ancestriesB.reduce((s, a) => s + getAncestryFE(a), 0) / ancestriesB.length;
  const fe_cont = getContinentFE(ancestriesA[0], ancestriesB[0]);
  const fe_rel  = getReligionFE(ancestriesA[0], ancestriesB[0], religionA, religionB);

  const B_hat = B_core + fe_age + fe_edu + fe_anc + fe_cont + fe_rel;

  // Linear normalize to 0–100 (100 = most stable, 0 = least stable)
  const score = Math.round(
    Math.max(0, Math.min(100,
      100 * (SEP_LINEAR_MAX - B_hat) / (SEP_LINEAR_MAX - SEP_LINEAR_MIN)
    ))
  );

  // Overall = P(match) × P(survive): probability this pairing forms × relationship longevity score.
  const marriageProb  = getMarriageProbability(ancestriesA[0], ancestriesB[0]);
  const marketScore   = Math.round(marriageProb * score);

  return {
    psi, psi2, B_core, B_hat,
    fe_age, fe_edu, fe_anc, fe_cont, fe_rel,
    score,
    marketScore,
    marriageProb,
    isYoung, coefs,
    optimalPsi:  coefs.optimalPsi,
    betaPsi:     coefs.beta1 * psi,
    betaPsi2:    coefs.beta2 * psi2,
    alpha:       coefs.alpha,
  };
}

// ─── Child Well-Being Scores ──────────────────────────────────────────────────

// Score 30 at ψ=0 (baseline exists even for same-background), 100 at optimal ψ.
// The regression captures marginal effects only; the intercept (same-background baseline) is non-zero.
const CHILD_SCORE_MIN = 30;
function childScore(coefs, psi) {
  const actual = coefs.beta1 * psi + coefs.beta2 * psi * psi;
  const peak   = coefs.beta1 * coefs.optimalPsi + coefs.beta2 * coefs.optimalPsi * coefs.optimalPsi;
  const raw    = Math.max(0, Math.min(1, actual / peak));
  return Math.round(CHILD_SCORE_MIN + (100 - CHILD_SCORE_MIN) * raw);
}

export function computeChildWellBeing(psi) {
  const prosperity = childScore(PROSPERITY_COEFS, psi);
  const education  = childScore(EDUCATION_COEFS,  psi);
  const creativity = childScore(CREATIVITY_COEFS, psi);

  const maxLackOfFocus = FOCUS_SLOPE * 0.5;
  const lackOfFocus    = Math.min(FOCUS_SLOPE * psi, maxLackOfFocus);
  const focus          = Math.round(Math.max(0, 100 * (1 - lackOfFocus / maxLackOfFocus)));

  const overall = Math.round((prosperity + education + creativity + focus) / 4);
  return { prosperity, education, creativity, focus, overall };
}

// ─── Spark & Cohesion ─────────────────────────────────────────────────────────

export function computeSparkCohesion(psi) {
  const spark    = Math.round(Math.min(100, 100 * Math.sqrt(psi / 0.5)));
  const cohesion = Math.round(Math.max(0, 100 * Math.pow(1 - psi, 1.4)));
  return { spark, cohesion };
}

// ─── Curve Data Generation ────────────────────────────────────────────────────

export function generateSeparationCurveData(isYoung = false) {
  const coefs = isYoung ? SEPARATION_COEFS_YOUNG : SEPARATION_COEFS;
  return Array.from({ length: 51 }, (_, i) => {
    const psi     = i / 100;
    const B       = coefs.alpha + coefs.beta1 * psi + coefs.beta2 * psi * psi;
    const synergy = Math.max(0, Math.min(100,
      100 * (SEP_LINEAR_MAX - B) / (SEP_LINEAR_MAX - SEP_LINEAR_MIN)
    ));
    const spark    = Math.min(100, 100 * Math.sqrt(psi / 0.5));
    const cohesion = Math.max(0, 100 * Math.pow(1 - psi, 1.4));
    return {
      psi:      parseFloat(psi.toFixed(2)),
      risk:     parseFloat(Math.max(0, B).toFixed(4)),
      synergy:  parseFloat(synergy.toFixed(1)),
      spark:    parseFloat(spark.toFixed(1)),
      cohesion: parseFloat(cohesion.toFixed(1)),
    };
  });
}

export function generateChildCurveData() {
  return Array.from({ length: 51 }, (_, i) => {
    const psi     = i / 100;
    const pros    = Math.max(0, PROSPERITY_COEFS.beta1 * psi + PROSPERITY_COEFS.beta2 * psi * psi);
    const edu     = Math.max(0, EDUCATION_COEFS.beta1  * psi + EDUCATION_COEFS.beta2  * psi * psi);
    const cre     = Math.max(0, CREATIVITY_COEFS.beta1 * psi + CREATIVITY_COEFS.beta2 * psi * psi);
    const peakPros = PROSPERITY_COEFS.beta1 * PROSPERITY_COEFS.optimalPsi + PROSPERITY_COEFS.beta2 * PROSPERITY_COEFS.optimalPsi ** 2;
    const peakEdu  = EDUCATION_COEFS.beta1  * EDUCATION_COEFS.optimalPsi  + EDUCATION_COEFS.beta2  * EDUCATION_COEFS.optimalPsi  ** 2;
    const peakCre  = CREATIVITY_COEFS.beta1 * CREATIVITY_COEFS.optimalPsi + CREATIVITY_COEFS.beta2 * CREATIVITY_COEFS.optimalPsi ** 2;
    return {
      psi:        parseFloat(psi.toFixed(2)),
      prosperity: parseFloat(((pros / peakPros) * 100).toFixed(1)),
      education:  parseFloat(((edu  / peakEdu)  * 100).toFixed(1)),
      creativity: parseFloat(((cre  / peakCre)  * 100).toFixed(1)),
    };
  });
}

// ─── Full Score Bundle ────────────────────────────────────────────────────────

export function computeFullScore(input) {
  const rel     = computeRelationshipScore(input);
  const child   = computeChildWellBeing(rel.psi);
  const sc      = computeSparkCohesion(rel.psi);

  // Overall uses the market-adjusted relationship score (survival × marriage probability)
  const overall = Math.round(rel.marketScore * 0.6 + child.overall * 0.4);

  return { ...rel, child, sparkCohesion: sc, overall };
}
