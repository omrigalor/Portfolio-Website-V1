export const tierLabel = t => ({ tier_1_hot:'Tier 1 — Hot', tier_2_warm:'Tier 2 — Warm', tier_3_nurture:'Tier 3 — Nurture', tier_4_archive:'Tier 4 — Archive' }[t] || t);
export const tierClass = t => ({ tier_1_hot:'bdr-tier-1', tier_2_warm:'bdr-tier-2', tier_3_nurture:'bdr-tier-3', tier_4_archive:'bdr-tier-4' }[t] || '');
export const sourceLabel = s => ({ inbound_web:'Inbound Web', inbound_referral:'Referral', inbound_event:'Event', outbound_cold:'Outbound Cold', outbound_sequence:'Sequence', partner:'Partner' }[s] || s);
export const statusLabel = s => ({ new:'New', qualifying:'Qualifying', qualified:'Qualified', handed_off:'Handed Off', nurture:'Nurture', archived:'Archived' }[s] || s);
export const fmtEur = n => { if (!n) return '€0'; if (n >= 1000000) return `€${(n/1000000).toFixed(1)}M`; if (n >= 1000) return `€${(n/1000).toFixed(0)}K`; return `€${n}`; };
export const fmtPct = n => `${(n*100).toFixed(1)}%`;
export const scoreColor = s => s >= 80 ? '#4ade80' : s >= 60 ? '#fb923c' : s >= 35 ? '#a5b4fc' : '#94a3b8';
export const channelLabel = c => ({ email:'Email', linkedin:'LinkedIn', call:'Call', event:'Event', other:'Other' }[c] || c);
export const outboundTierLabel = t => ({ tier_a:'Tier A — Regulated Enterprise', tier_b:'Tier B — Switcher / AI-Native', tier_c:'Tier C — Growth Startup' }[t] || t);
