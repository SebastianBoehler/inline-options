"use client";

import { ExtendedProduct } from "../hooks/types";
import Link from "next/link";

interface ProductInfoPanelProps {
  product: ExtendedProduct;
}

export default function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  return (
    <div className="p-4 bg-white border-r border-gray-200">
      <div className="w-full">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
          Product Information
        </h3>
        
        {/* Trading Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trading Data */}
            <div className="bg-gray-50 p-3 border border-gray-200 w-full">
              <h4 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">Trading Data</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500 text-xs">Bid</div>
                  <div className="font-mono font-medium text-gray-900">{product.Bid.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Offer</div>
                  <div className="font-mono font-medium text-gray-900">{product.Offer.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Spread</div>
                  <div className="font-mono font-medium text-gray-900">{product.spread}</div>
                </div>
                <div>
                  <div className="text-gray-500 text-xs">Currency</div>
                  <div className="font-mono font-medium text-gray-900">{product.Currency}</div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 p-3 border border-gray-200 w-full">
              <h4 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">Product Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">ISIN:</span>
                  <span className="font-mono text-gray-900">{product.Isin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Code:</span>
                  <span className="font-mono text-gray-900">{product.Code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Exchange:</span>
                  <span className="font-mono text-gray-900">{product.ExchangeCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="bg-gray-50 p-3 border border-gray-200 w-full">
            <h4 className="text-xs font-medium text-gray-700 mb-3 uppercase tracking-wide">Indicators</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 text-xs">Volatility</div>
                <div className="font-mono font-medium text-gray-900">{product.volatility}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">Bollinger Width</div>
                <div className="font-mono font-medium text-gray-900">{product.bollingerWidth}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs">VaR 95%</div>
                <div className="font-mono font-medium text-gray-900">{product.var95}</div>
              </div>
            </div>
          </div>

          {/* Return Explanation */}
          <div className="bg-blue-50 p-3 border border-blue-200 w-full">
            <h4 className="text-xs font-medium text-blue-700 mb-3 uppercase tracking-wide">Return Calculation</h4>
            <div className="space-y-2 text-xs text-blue-800">
              <div className="flex justify-between">
                <span className="font-medium">Expected Return:</span>
                <span className="font-mono text-blue-900">{product.expectedReturnPct}%</span>
              </div>
              <div className="text-xs text-blue-700 mt-2 space-y-1">
                <p><strong>Formula:</strong> (Fair Value - Offer Price) ÷ Offer Price × 100</p>
                <p><strong>Fair Value:</strong> 10 × {product.probStay} = {(Number(product.probStay) * 10).toFixed(2)}</p>
                <p><strong>Expected Profit:</strong> {(Number(product.probStay) * 10).toFixed(2)} - {product.Offer.toFixed(2)} = {product.expectedProfit}</p>
                <p className="mt-2 text-blue-600"><strong>Interpretation:</strong> Statistical expected return considering probability of staying within barriers.</p>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2 mt-4">
            {product.IsSecondaryMarket && (
              <span className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium bg-gray-100 text-gray-700">
                Secondary Market
              </span>
            )}
            {product.IsSiat && (
              <span className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium bg-gray-100 text-gray-700">
                SIAT
              </span>
            )}
            {product.EsgEligible && (
              <span className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium bg-gray-100 text-gray-700">
                ESG Eligible
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
