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

// Essential columns for hedge fund-style minimal view
export const essentialColumns: ColumnConfig[] = [
  {
    key: "optimizedScore",
    label: "Score",
    numeric: true,
    minWidth: "min-w-[80px]",
    format: (product) => product.optimizedScore.toFixed(3),
    sortValue: (product) => product.optimizedScore,
  },
  {
    key: "AssetName",
    label: "Asset",
    minWidth: "min-w-[120px]",
  },
  {
    key: "expectedReturnPct",
    label: "Return",
    numeric: true,
    minWidth: "min-w-[80px]",
    format: (product) => {
      const value = parseNumber(product.expectedReturnPct);
      return value === null ? "—" : `${value.toFixed(1)}%`;
    },
    sortValue: (product) => parseNumber(product.expectedReturnPct),
  },
  {
    key: "Bid",
    label: "Bid",
    numeric: true,
    minWidth: "min-w-[70px]",
    format: (product) => product.Bid.toFixed(2),
    sortValue: (product) => product.Bid,
  },
  {
    key: "Offer",
    label: "Offer",
    numeric: true,
    minWidth: "min-w-[70px]",
    format: (product) => product.Offer.toFixed(2),
    sortValue: (product) => product.Offer,
  },
  {
    key: "daysUntilExpiry",
    label: "DTE",
    numeric: true,
    minWidth: "min-w-[60px]",
    sortValue: (product) => product.daysUntilExpiry,
  },
];

// Secondary columns for expandable details
export const secondaryColumns: ColumnConfig[] = [
  {
    key: "score",
    label: "Raw Score",
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
    key: "blackScholesPrice",
    label: "Black Scholes",
    numeric: true,
    minWidth: "min-w-[110px]",
    format: (product) => {
      const value = parseNumber(product.blackScholesPrice);
      return value === null ? "—" : value.toFixed(2);
    },
    sortValue: (product) => parseNumber(product.blackScholesPrice),
  },
  {
    key: "blackScholesSignal",
    label: "BS Signal",
    minWidth: "min-w-[96px]",
    format: (product) => product.blackScholesSignal,
    sortValue: (product) => {
      const order: Record<string, number> = { Buy: 2, Fair: 1, Sell: 0 };
      const value = product.blackScholesSignal;
      return order[value] ?? 1;
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
    label: "Days Left",
    numeric: true,
    minWidth: "min-w-[96px]",
    sortValue: (product) => product.daysUntilExpiry,
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

export const columnConfigs: ColumnConfig[] = [...essentialColumns, ...secondaryColumns];
