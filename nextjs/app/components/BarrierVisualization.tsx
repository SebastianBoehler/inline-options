"use client";

import { ExtendedProduct } from "../hooks/types";

interface BarrierVisualizationProps {
  product: ExtendedProduct;
}

export default function BarrierVisualization({ product }: BarrierVisualizationProps) {
  const lowerBarrier = product.LowerBarrierInlineWarrant;
  const upperBarrier = product.UpperBarrierInlineWarrant;
  const currentPrice = product.underlyingPrice;
  
  // Calculate the range and position
  const range = upperBarrier - lowerBarrier;
  const currentPosition = ((currentPrice - lowerBarrier) / range) * 100;
  
  // Parse percentage differences (remove % sign and convert to number)
  const diffToLowerPercent = parseFloat(product.diffToLower.replace('%', ''));
  const diffToUpperPercent = parseFloat(product.diffToUpper.replace('%', ''));

  return (
    <div className="p-6 border-gray-200">
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          Barrier Analysis - {product.AssetName}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            currentPrice > lowerBarrier && currentPrice < upperBarrier
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {currentPrice > lowerBarrier && currentPrice < upperBarrier
              ? 'Within Barriers'
              : 'Outside Barriers'
            }
          </span>
        </h3>
        
        {/* Price Information */}
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="text-center">
            <div className="font-medium">Lower Barrier</div>
            <div className="text-lg font-bold">{lowerBarrier.toFixed(2)}</div>
            <div className="text-gray-500">({diffToLowerPercent > 0 ? '+' : ''}{diffToLowerPercent.toFixed(1)}%)</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Current Price</div>
            <div className="text-lg font-bold">{currentPrice.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="font-medium">Upper Barrier</div>
            <div className="text-lg font-bold">{upperBarrier.toFixed(2)}</div>
            <div className="text-gray-500">({diffToUpperPercent > 0 ? '+' : ''}{diffToUpperPercent.toFixed(1)}%)</div>
          </div>
        </div>

        {/* Visual Barrier Representation */}
        <div className="relative">
          {/* Barrier Range Bar */}
          <div className="relative h-8 bg-gradient-to-r from-red-200 via-green-200 to-red-200 rounded-lg border-2 border-gray-300">
            {/* Current Price Indicator */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-blue-600 rounded-full transform -translate-x-0.5"
              style={{ left: `${Math.max(0, Math.min(100, currentPosition))}%` }}
            >
              {/* Price Label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {currentPrice.toFixed(2)}
              </div>
            </div>
          </div>
          
          {/* Barrier Labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span className="font-medium">
              {lowerBarrier.toFixed(2)} ({diffToLowerPercent.toFixed(1)}%)
            </span>
            <span className="font-medium">
              {upperBarrier.toFixed(2)} ({diffToUpperPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-3 rounded-lg border">
            <div className="font-medium text-gray-700">Range</div>
            <div className="text-lg font-bold">{(+product.rangePercent * 100).toFixed(2)}%</div>
          </div>
          <div className="bg-white p-3 rounded-lg border">
            <div className="font-medium text-gray-700">Potential Return</div>
            <div className="text-lg font-bold text-green-600">{product.potentialReturn}</div>
          </div>
        </div>


      </div>
    </div>
  );
}
