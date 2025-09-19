export interface ScoreWeights {
  wR: number;
  wD: number;
  wB: number;
  wV: number;
  wT: number;
}

/**
 * Calculates the custom Eigener score based on provided metrics.
 * "Opitz formula"
 * Formula:
 * 0.42 * potentialReturn * (10 - offer) + 0.34 / bollingerWidth + 0.16 / var95
 */
export function calculateEigenerScore(potentialReturn: number, offer: number, bollingerWidth: number | string, var95: number | string): number {
  const bw = Number(bollingerWidth) || 0;
  const v95 = Number(var95) || 0;
  const termReturn = 0.42 * potentialReturn * (10 - offer);
  const termBw = bw !== 0 ? 0.34 / bw : 0;
  const termV = v95 !== 0 ? 0.16 / v95 : 0;
  return termReturn + termBw + termV;
}

export function addScoreColumn<
  T extends {
    potentialReturn: number;
    Offer: number;
    bollingerWidth: string | number;
    var95: string | number;
    diffToLower: string | number;
    diffToUpper: string | number;
    daysUntilExpiry: number;
    probStay: string | number;
    expectedReturnPct: string | number;
    sigmaDistanceLower: string | number;
    sigmaDistanceUpper: string | number;
  }
>(rows: T[], weights: ScoreWeights = { wR: 0.25, wD: 0.2, wB: 0.15, wV: 0.15, wT: 0.25 }): (T & { score: number; optimizedScore: number; "optiz formula": number })[] {
  if (!rows.length) return [];

  const safeNumber = (value: string | number) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  };

  const getD = (r: T) => Math.min(Number(r.diffToLower), Number(r.diffToUpper));

  const mins = {
    R: Math.min(...rows.map((r) => r.potentialReturn)),
    B: Math.min(...rows.map((r) => Number(r.bollingerWidth))),
    V: Math.min(...rows.map((r) => Number(r.var95))),
    D: Math.min(...rows.map(getD)),
    T: Math.min(...rows.map((r) => r.daysUntilExpiry)),
    Prob: Math.min(...rows.map((r) => safeNumber(r.probStay))),
    ER: Math.min(...rows.map((r) => safeNumber(r.expectedReturnPct))),
    Sigma: Math.min(
      ...rows.map((r) => {
        const lower = safeNumber(r.sigmaDistanceLower);
        const upper = safeNumber(r.sigmaDistanceUpper);
        return Math.min(lower, upper);
      })
    ),
  };
  const maxs = {
    R: Math.max(...rows.map((r) => r.potentialReturn)),
    B: Math.max(...rows.map((r) => Number(r.bollingerWidth))),
    V: Math.max(...rows.map((r) => Number(r.var95))),
    D: Math.max(...rows.map(getD)),
    T: Math.max(...rows.map((r) => r.daysUntilExpiry)),
    P: Math.max(...rows.map((r) => r.Offer)),
    Prob: Math.max(...rows.map((r) => safeNumber(r.probStay))),
    ER: Math.max(...rows.map((r) => safeNumber(r.expectedReturnPct))),
    Sigma: Math.max(
      ...rows.map((r) => {
        const lower = safeNumber(r.sigmaDistanceLower);
        const upper = safeNumber(r.sigmaDistanceUpper);
        return Math.min(lower, upper);
      })
    ),
  };

  const mm = (x: number, min: number, max: number) => (max === min ? 0.5 : (x - min) / (max - min));

  return rows.map((r) => {
    const Rp = mm(r.potentialReturn, mins.R, maxs.R);
    const Bp = mm(Number(r.bollingerWidth), mins.B, maxs.B);
    const Vp = mm(Number(r.var95), mins.V, maxs.V);
    const Dval = getD(r);
    const Dp = mm(Dval, mins.D, maxs.D);
    const Tp = mm(r.daysUntilExpiry, mins.T, maxs.T);
    const Prob = mm(safeNumber(r.probStay), mins.Prob, maxs.Prob);
    const ExpRet = mm(safeNumber(r.expectedReturnPct), mins.ER, maxs.ER);
    const sigmaBase = Math.min(safeNumber(r.sigmaDistanceLower), safeNumber(r.sigmaDistanceUpper));
    const Sigma = mm(sigmaBase, mins.Sigma, maxs.Sigma);

    const Pfactor = 1 - r.Offer / maxs.P;

    const s = weights.wR * Rp * Pfactor + weights.wD * Dp + weights.wB * (1 - Bp) + weights.wV * (1 - Vp) + weights.wT * Tp;

    const eigener = calculateEigenerScore(r.potentialReturn, r.Offer, r.bollingerWidth, r.var95);

    const optimized = 0.45 * Prob + 0.3 * ExpRet + 0.15 * Sigma + 0.1 * (1 - Vp);

    return { ...r, score: s, optimizedScore: optimized, ["optiz formula"]: eigener };
  });
}
