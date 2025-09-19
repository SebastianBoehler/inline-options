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
};

export const columnConfigs: ColumnConfig[] = [
    {
      key: "optimizedScore",
      label: "Opt Score",
      numeric: true,
      minWidth: "min-w-[88px]",
      format: (product) => product.optimizedScore.toFixed(3),
    },
    {
      key: "score",
      label: "Score",
      numeric: true,
      minWidth: "min-w-[80px]",
      format: (product) => product.score.toFixed(3),
    },
    {
      key: "optiz formula",
      label: "Opitz",
      numeric: true,
      minWidth: "min-w-[72px]",
      format: (product) => (product["optiz formula"] as number).toFixed(3),
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
    },
    {
      key: "Bid",
      label: "Bid",
      numeric: true,
      minWidth: "min-w-[72px]",
      format: (product) => product.Bid.toFixed(2),
    },
    {
      key: "Offer",
      label: "Offer",
      numeric: true,
      minWidth: "min-w-[72px]",
      format: (product) => product.Offer.toFixed(2),
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
    },
    {
      key: "potentialReturn",
      label: "Potential Return",
      numeric: true,
      minWidth: "min-w-[120px]",
      format: (product) => product.potentialReturn.toFixed(3),
    },
    {
      key: "daysUntilExpiry",
      label: "Days To Exp",
      numeric: true,
      minWidth: "min-w-[104px]",
    },
    {
      key: "daysRunning",
      label: "Days Run",
      numeric: true,
      minWidth: "min-w-[96px]",
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
    },
  ];
