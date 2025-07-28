export interface ScoreWeights {
  wR: number;
  wD: number;
  wB: number;
  wV: number;
  wT: number;
}

export function addScoreColumn<T extends { potentialReturn: number; Offer: number; bollingerWidth: string | number; var95: string | number; diffToLower: string | number; diffToUpper: string | number; daysUntilExpiry: number; }>(
  rows: T[],
  weights: ScoreWeights = { wR: 0.25, wD: 0.2, wB: 0.15, wV: 0.15, wT: 0.25 }
): (T & { score: number })[] {
  if (!rows.length) return [];

  const getD = (r: T) => Math.min(Number(r.diffToLower), Number(r.diffToUpper));

  const mins = {
    R: Math.min(...rows.map(r => r.potentialReturn)),
    B: Math.min(...rows.map(r => Number(r.bollingerWidth))),
    V: Math.min(...rows.map(r => Number(r.var95))),
    D: Math.min(...rows.map(getD)),
    T: Math.min(...rows.map(r => r.daysUntilExpiry)),
  };
  const maxs = {
    R: Math.max(...rows.map(r => r.potentialReturn)),
    B: Math.max(...rows.map(r => Number(r.bollingerWidth))),
    V: Math.max(...rows.map(r => Number(r.var95))),
    D: Math.max(...rows.map(getD)),
    T: Math.max(...rows.map(r => r.daysUntilExpiry)),
    P: Math.max(...rows.map(r => r.Offer)),
  };

  const mm = (x: number, min: number, max: number) => (max === min ? 0.5 : (x - min) / (max - min));

  return rows.map(r => {
    const Rp = mm(r.potentialReturn, mins.R, maxs.R);
    const Bp = mm(Number(r.bollingerWidth), mins.B, maxs.B);
    const Vp = mm(Number(r.var95), mins.V, maxs.V);
    const Dval = getD(r);
    const Dp = mm(Dval, mins.D, maxs.D);
    const Tp = mm(r.daysUntilExpiry, mins.T, maxs.T);

    const Pfactor = 1 - r.Offer / maxs.P;

    const s = weights.wR * Rp * Pfactor +
              weights.wD * Dp +
              weights.wB * (1 - Bp) +
              weights.wV * (1 - Vp) +
              weights.wT * Tp;

    return { ...r, score: s };
  });
}
