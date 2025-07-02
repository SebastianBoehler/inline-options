"use client";

import { ExtendedProduct } from "../hooks/types";
import Link from "next/link";

interface ProductInfoPanelProps {
  product: ExtendedProduct;
}

export default function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  return (
    <div className="p-6 bg-white border-l border-gray-200">
      <div className="w-full max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Information
        </h3>
        
        {/* Trading Information */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trading Data */}
            <div className="bg-gray-50 p-4 rounded-lg w-full">
              <h4 className="font-medium text-gray-700 mb-3">Trading Data</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-gray-500">Bid</div>
                  <div className="font-bold text-green-600">{product.Bid.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Offer</div>
                  <div className="font-bold text-red-600">{product.Offer.toFixed(4)}</div>
                </div>
                <div>
                  <div className="text-gray-500">Spread</div>
                  <div className="font-bold">{product.spread}</div>
                </div>
                <div>
                  <div className="text-gray-500">Currency</div>
                  <div className="font-bold">{product.Currency}</div>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="bg-gray-50 p-4 rounded-lg w-full">
              <h4 className="font-medium text-gray-700 mb-3">Product Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ISIN:</span>
                  <span className="font-medium">{product.Isin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Code:</span>
                  <span className="font-medium">{product.Code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Exchange:</span>
                  <span className="font-medium">{product.ExchangeCode}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Indicators */}
          <div className="bg-gray-50 p-4 rounded-lg w-full">
            <h4 className="font-medium text-gray-700 mb-3">Indicators</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Volatility</div>
                <div className="font-bold">{product.volatility}</div>
              </div>
              <div>
                <div className="text-gray-500">Bollinger Width</div>
                <div className="font-bold">{product.bollingerWidth}</div>
              </div>
              <div>
                <div className="text-gray-500">VaR 95%</div>
                <div className="font-bold">{product.var95}</div>
              </div>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2 mt-4">
            {product.IsSecondaryMarket && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Secondary Market
              </span>
            )}
            {product.IsSiat && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                SIAT
              </span>
            )}
            {product.EsgEligible && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ESG Eligible
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
