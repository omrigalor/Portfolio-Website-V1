// Runs N simulations for a single lead, sampling ACV and conversion probability
// with realistic variance to produce a distribution of expected revenue outcomes.
// Returns the 5th/95th percentile range and a histogram for the chart.
export function singleLeadMonteCarlo(lead, N = 1000) {
  const outcomes = [];
  for (let i = 0; i < N; i++) {
    // ACV varies ±40% — accounts for discount, scope changes, or upsell
    const acv = lead.expected_acv * (0.6 + Math.random() * 0.8);
    // Conversion probability varies ±10 percentage points — deal uncertainty
    const conv = Math.max(0, Math.min(1, lead.conversion_probability + (Math.random() - 0.5) * 0.2));
    outcomes.push(Math.round(acv * conv));
  }
  outcomes.sort((a, b) => a - b);

  const mean = Math.round(outcomes.reduce((a, b) => a + b, 0) / N);
  const p5  = outcomes[Math.floor(N * 0.05)];
  const p95 = outcomes[Math.floor(N * 0.95)];

  // Bucket outcomes into 14 bins for the histogram bars
  const min = outcomes[0], max = outcomes[N - 1];
  const step = Math.max(1, Math.round((max - min) / 14));
  const histogram = [];
  for (let v = min; v <= max; v += step) {
    const count = outcomes.filter(o => o >= v && o < v + step).length;
    histogram.push({ x: Math.round((v + step / 2) / 1000), count });
  }

  return { mean, p5, p95, histogram };
}

// Runs N portfolio-level simulations across all leads simultaneously.
// Each simulation independently samples every lead's outcome and sums them —
// producing a realistic confidence interval for total pipeline value.
export function portfolioMonteCarlo(leads, N = 2000) {
  if (!leads.length) return { mean: 0, p5: 0, p95: 0, histogram: [] };

  const totals = [];
  for (let i = 0; i < N; i++) {
    let total = 0;
    for (const l of leads) {
      const acv = (l.expected_acv || 25000) * (0.6 + Math.random() * 0.8);
      const conv = Math.max(0, Math.min(1, (l.conversion_probability || 0.1) + (Math.random() - 0.5) * 0.15));
      total += acv * conv;
    }
    totals.push(Math.round(total));
  }
  totals.sort((a, b) => a - b);

  const mean = Math.round(totals.reduce((a, b) => a + b, 0) / N);
  const p5  = totals[Math.floor(N * 0.05)];
  const p95 = totals[Math.floor(N * 0.95)];

  const min = totals[0], max = totals[N - 1];
  const step = Math.max(1, Math.round((max - min) / 16));
  const histogram = [];
  for (let v = min; v <= max; v += step) {
    const count = totals.filter(t => t >= v && t < v + step).length;
    histogram.push({ x: Math.round((v + step / 2) / 1000), count, isP5: (v + step / 2) < p5, isP95: (v + step / 2) > p95 });
  }

  return { mean, p5, p95, histogram };
}

// Formats a euro value for display — €120K, €1.2M, etc.
export function fmtEur(n) {
  if (!n) return '€0';
  if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `€${(n / 1000).toFixed(0)}K`;
  return `€${n}`;
}
