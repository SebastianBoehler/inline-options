"use client";

import { ExtendedProduct } from "../hooks/types";
import Link from "next/link";

interface ProductInfoPanelProps {
  product: ExtendedProduct;
}

export default function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  return (
    <div className="p-6 bg-white border-l border-gray-200">
      <div className="max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Product Information
        </h3>
        
        {/* Trading Information */}
        <div className="space-y-4">
          <div className="flex flex-row gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
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
            <div className="bg-gray-50 p-4 rounded-lg min-w-[200px]">
              <h4 className="font-medium text-gray-700 mb-3">Product Details</h4>
              <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ISIN:</span>
                <span>{product.Isin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Code:</span>
                <span>{product.Code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Exchange:</span>
                <span>{product.ExchangeCode}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
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
            </div>
          </div>
          </div>

          {/* External Links */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-3">Links</h4>
            <div className="space-y-2">
              <Link 
                href={`https://www.sg-zertifikate.de/product-details/${product.Code}`}
                target="_blank"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md transition-colors duration-200 text-sm font-medium"
              >
                View on SG Zertifikate →
              </Link>
              
              {product.BrokerLinks && (
                <Link 
                  href={product.BrokerLinks}
                  target="_blank"
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white text-center py-2 px-4 rounded-md transition-colors duration-200 text-sm font-medium"
                >
                  Broker Links →
                </Link>
              )}
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex flex-wrap gap-2">
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
