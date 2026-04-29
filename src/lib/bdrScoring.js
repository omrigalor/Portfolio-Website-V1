const DEFAULT_WEIGHTS = { fit:3, intent:2, capacity:2, access:2, timing:1 };
const DEFAULT_THRESHOLDS = { tier1:70, tier2:40, tier3:20 };
const DEFAULT_ACV = { enterprise:120000, startup:25000 };

function getWeights(config) {
  return {
    fit: config.weight_fit ?? DEFAULT_WEIGHTS.fit,
    intent: config.weight_intent ?? DEFAULT_WEIGHTS.intent,
    capacity: config.weight_capacity ?? DEFAULT_WEIGHTS.capacity,
    access: config.weight_access ?? DEFAULT_WEIGHTS.access,
    timing: config.weight_timing ?? DEFAULT_WEIGHTS.timing,
  };
}

export function computeLeadScore(lead, config = {}) {
  const w = getWeights(config);
  const t1 = config.tier1_threshold ?? DEFAULT_THRESHOLDS.tier1;
  const t2 = config.tier2_threshold ?? DEFAULT_THRESHOLDS.tier2;
  const t3 = config.tier3_threshold ?? DEFAULT_THRESHOLDS.tier3;
  const acvE = config.acv_enterprise ?? DEFAULT_ACV.enterprise;
  const acvS = config.acv_startup ?? DEFAULT_ACV.startup;

  const factors = [
    { score: lead.score_fit ?? 3, weight: w.fit },
    { score: lead.score_intent ?? 3, weight: w.intent },
    { score: lead.score_budget ?? 3, weight: w.capacity },
    { score: lead.score_decision_access ?? 3, weight: w.access },
    { score: lead.score_timeline ?? 3, weight: w.timing },
  ];

  const extra = [
    lead.score_pain ?? 3,
    lead.score_compelling_event ?? 3,
    lead.score_champion ?? 3,
    lead.score_technical_fit ?? 3,
    lead.score_strategic_value ?? 3,
  ];

  const extraAvg = extra.reduce((a,b)=>a+b,0)/extra.length;
  const baseScore = factors.reduce((s,f)=>s+f.score*f.weight,0) / factors.reduce((s,f)=>s+5*f.weight,0) * 100;
  const composite = Math.round(baseScore * 0.7 + (extraAvg/5)*100 * 0.3);

  const tier = composite >= t1 ? 'tier_1_hot' : composite >= t2 ? 'tier_2_warm' : composite >= t3 ? 'tier_3_nurture' : 'tier_4_archive';
  const routeTo = (lead.employees >= 200 || lead.industry?.match(/Finance|Pharma|Insurance|Telco/)) ? 'enterprise_ae' : 'startup_ae';
  const convBase = tier === 'tier_1_hot' ? 0.35 : tier === 'tier_2_warm' ? 0.2 : tier === 'tier_3_nurture' ? 0.08 : 0.02;
  const acv = routeTo === 'enterprise_ae' ? acvE : acvS;

  return { composite_score: composite, tier, route_to: routeTo, conversion_probability: convBase, expected_acv: acv };
}
