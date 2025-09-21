import { ExtendedProduct } from "./hooks/types";

const parseNumber = (
    value: string | number | null | undefined
  ): number | null => {
    if (value === null || value === undefined) {
      return null;
    }
    const num = typeof value === "number" ? value : Number(value);
    return Number.isFinite(num) ? num : null;
  };

export type SortKey =
  | keyof ExtendedProduct
  | "score"
  | "optiz formula"
  | "optimizedScore";

export type ScoredProduct = ExtendedProduct & {
  score: number;
  optimizedScore: number;
  "optiz formula": number;
};

export type ColumnConfig = {
  key: SortKey;
  label: string;
  numeric?: boolean;
  minWidth?: string;
  format?: (product: ScoredProduct) => string | number;
  sortValue?: (product: ScoredProduct) => number | string | null;
};

export const columnConfigs: ColumnConfig[] = [
    {
      key: "optimizedScore",
      label: "Opt Score",
      numeric: true,
      minWidth: "min-w-[88px]",
      format: (product) => product.optimizedScore.toFixed(3),
      sortValue: (product) => product.optimizedScore,
    },
    {
      key: "score",
      label: "Score",
      numeric: true,
      minWidth: "min-w-[80px]",
      format: (product) => product.score.toFixed(3),
      sortValue: (product) => product.score,
    },
    {
      key: "optiz formula",
      label: "Opitz",
      numeric: true,
      minWidth: "min-w-[72px]",
      format: (product) => (product["optiz formula"] as number).toFixed(3),
      sortValue: (product) => product["optiz formula"] as number,
    },
    {
      key: "probStay",
      label: "Prob Stay",
      numeric: true,
      minWidth: "min-w-[96px]",
      format: (product) => {
        const value = parseNumber(product.probStay);
        return value === null ? "—" : `${(value * 100).toFixed(1)}%`;
      },
      sortValue: (product) => parseNumber(product.probStay),
    },
    {
      key: "expectedReturnPct",
      label: "Exp Return",
      numeric: true,
      minWidth: "min-w-[100px]",
      format: (product) => {
        const value = parseNumber(product.expectedReturnPct);
        return value === null ? "—" : `${value.toFixed(1)}%`;
      },
      sortValue: (product) => parseNumber(product.expectedReturnPct),
    },
    {
      key: "expectedProfit",
      label: "Exp Profit",
      numeric: true,
      minWidth: "min-w-[90px]",
      format: (product) => {
        const value = parseNumber(product.expectedProfit);
        return value === null ? "—" : value.toFixed(2);
      },
      sortValue: (product) => parseNumber(product.expectedProfit),
    },
    {
      key: "sigmaDistanceLower",
      label: "Sigma ↓",
      numeric: true,
      minWidth: "min-w-[88px]",
      format: (product) => {
        const value = parseNumber(product.sigmaDistanceLower);
        return value === null ? "—" : value.toFixed(2);
      },
      sortValue: (product) => parseNumber(product.sigmaDistanceLower),
    },
    {
      key: "sigmaDistanceUpper",
      label: "Sigma ↑",
      numeric: true,
      minWidth: "min-w-[88px]",
      format: (product) => {
        const value = parseNumber(product.sigmaDistanceUpper);
        return value === null ? "—" : value.toFixed(2);
      },
      sortValue: (product) => parseNumber(product.sigmaDistanceUpper),
    },
    { key: "Isin", label: "ISIN", minWidth: "min-w-[120px]" },
    { key: "AssetName", label: "Asset", minWidth: "min-w-[100px]" },
    {
      key: "diffToLower",
      label: "Diff ↓",
      numeric: true,
      minWidth: "min-w-[88px]",
      format: (product) => {
        const value = parseNumber(product.diffToLower);
        return value === null ? "—" : `${value.toFixed(2)}%`;
      },
      sortValue: (product) => parseNumber(product.diffToLower),
    },
    {
      key: "diffToUpper",
      label: "Diff ↑",
      numeric: true,
      minWidth: "min-w-[88px]",
      format: (product) => {
        const value = parseNumber(product.diffToUpper);
        return value === null ? "—" : `${value.toFixed(2)}%`;
      },
      sortValue: (product) => parseNumber(product.diffToUpper),
    },
    {
      key: "Bid",
      label: "Bid",
      numeric: true,
      minWidth: "min-w-[72px]",
      format: (product) => product.Bid.toFixed(2),
      sortValue: (product) => product.Bid,
    },
    {
      key: "Offer",
      label: "Offer",
      numeric: true,
      minWidth: "min-w-[72px]",
      format: (product) => product.Offer.toFixed(2),
      sortValue: (product) => product.Offer,
    },
    {
      key: "spread",
      label: "Spread",
      numeric: true,
      minWidth: "min-w-[80px]",
      format: (product) => {
        const value = parseNumber(product.spread);
        return value === null ? "—" : value.toFixed(2);
      },
      sortValue: (product) => parseNumber(product.spread),
    },
    {
      key: "rangePercent",
      label: "Range %",
      numeric: true,
      minWidth: "min-w-[92px]",
      format: (product) => {
        const value = parseNumber(product.rangePercent);
        return value === null ? "—" : `${value.toFixed(2)}%`;
      },
      sortValue: (product) => parseNumber(product.rangePercent),
    },
    {
      key: "potentialReturn",
      label: "Potential Return",
      numeric: true,
      minWidth: "min-w-[120px]",
      format: (product) => product.potentialReturn.toFixed(3),
      sortValue: (product) => product.potentialReturn,
    },
    {
      key: "daysUntilExpiry",
      label: "Days To Exp",
      numeric: true,
      minWidth: "min-w-[104px]",
      sortValue: (product) => product.daysUntilExpiry,
    },
    {
      key: "daysRunning",
      label: "Days Run",
      numeric: true,
      minWidth: "min-w-[96px]",
      sortValue: (product) => product.daysRunning,
    },
    {
      key: "volatility",
      label: "Volatility",
      numeric: true,
      minWidth: "min-w-[96px]",
      format: (product) => {
        const value = parseNumber(product.volatility);
        return value === null ? "—" : value.toFixed(4);
      },
      sortValue: (product) => parseNumber(product.volatility),
    },
    {
      key: "bollingerWidth",
      label: "Boll Width",
      numeric: true,
      minWidth: "min-w-[106px]",
      format: (product) => {
        const value = parseNumber(product.bollingerWidth);
        return value === null ? "—" : value.toFixed(4);
      },
      sortValue: (product) => parseNumber(product.bollingerWidth),
    },
    {
      key: "var95",
      label: "VaR 95%",
      numeric: true,
      minWidth: "min-w-[92px]",
      format: (product) => {
        const value = parseNumber(product.var95);
        return value === null ? "—" : value.toFixed(4);
      },
      sortValue: (product) => parseNumber(product.var95),
    },
  ];
