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
  const fairValue = Number(product.probStay) * 10;
  
  return (
    <div className="p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Detailed Metrics</h3>
      
      {/* Return Calculation Explanation */}
      <div className="bg-blue-50 p-3 border border-blue-200 mb-4">
        <h4 className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wide">Return Calculation</h4>
        <div className="space-y-1 text-xs text-blue-800">
          <div className="flex justify-between">
            <span className="font-medium">Expected Return:</span>
            <span className="font-mono text-blue-900">{product.expectedReturnPct}%</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1">
            <p><strong>Formula:</strong> (Fair Value - Offer) ÷ Offer × 100</p>
            <p><strong>Fair Value:</strong> 10 × {product.probStay} = {fairValue.toFixed(2)}</p>
            <p><strong>Expected Profit:</strong> {fairValue.toFixed(2)} - {product.Offer.toFixed(2)} = {product.expectedProfit}</p>
            <p className="text-blue-600"><strong>Interpretation:</strong> Statistical expected return considering probability of staying within barriers.</p>
          </div>
        </div>
      </div>
      
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
