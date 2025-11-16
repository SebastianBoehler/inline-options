"use client";

import { ScoredProduct } from "../ColumnsConfig";
import { secondaryColumns, ColumnConfig } from "../ColumnsConfig";

interface SecondaryMetricsPanelProps {
  product: ScoredProduct;
}

const resolveCellValue = (product: ScoredProduct, column: ColumnConfig) => {
  const raw = column.format
    ? column.format(product)
    : product[column.key as keyof ScoredProduct];

  if (raw === null || raw === undefined) {
    return "—";
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length === 0 ? "—" : trimmed;
  }

  return raw;
};

export default function SecondaryMetricsPanel({ product }: SecondaryMetricsPanelProps) {
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Detailed Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
        {secondaryColumns.map((column) => {
          const value = resolveCellValue(product, column);
          
          return (
            <div key={column.key} className="flex justify-between items-center py-1">
              <span className="text-gray-600 font-medium">{column.label}:</span>
              <span className={`text-gray-900 font-mono ${
                column.numeric ? "text-right" : "text-left"
              }`}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
