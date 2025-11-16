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
    <div className="p-4 bg-white border-r border-gray-200">
      <div className="w-full">
        <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide flex items-center gap-2">
          {product.AssetName}
          <span className={`inline-flex items-center px-2 py-1 border text-xs font-medium ${
            currentPrice > lowerBarrier && currentPrice < upperBarrier
              ? 'border-gray-700 bg-gray-100 text-gray-900'
              : 'border-red-700 bg-red-100 text-red-900'
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
            <div className="font-medium text-xs text-gray-600 uppercase tracking-wide">Lower Barrier</div>
            <div className="text-lg font-mono font-medium text-gray-900">{lowerBarrier.toFixed(2)}</div>
            <div className="text-gray-500 text-xs">({diffToLowerPercent > 0 ? '+' : ''}{diffToLowerPercent.toFixed(1)}%)</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-xs text-gray-600 uppercase tracking-wide">Current Price</div>
            <div className="text-lg font-mono font-medium text-gray-900">{currentPrice.toFixed(2)}</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-xs text-gray-600 uppercase tracking-wide">Upper Barrier</div>
            <div className="text-lg font-mono font-medium text-gray-900">{upperBarrier.toFixed(2)}</div>
            <div className="text-gray-500 text-xs">({diffToUpperPercent > 0 ? '+' : ''}{diffToUpperPercent.toFixed(1)}%)</div>
          </div>
        </div>

        {/* Visual Barrier Representation */}
        <div className="relative">
          {/* Barrier Range Bar */}
          <div className="relative h-8 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 border border-gray-400">
            {/* Current Price Indicator */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-gray-900 transform -translate-x-0.5"
              style={{ left: `${Math.max(0, Math.min(100, currentPosition))}%` }}
            >
              {/* Price Label */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 whitespace-nowrap">
                {currentPrice.toFixed(2)}
              </div>
            </div>
          </div>
          
          {/* Barrier Labels */}
          <div className="flex justify-between mt-2 text-xs text-gray-600">
            <span className="font-mono">
              {lowerBarrier.toFixed(2)} ({diffToLowerPercent.toFixed(1)}%)
            </span>
            <span className="font-mono">
              {upperBarrier.toFixed(2)} ({diffToUpperPercent.toFixed(1)}%)
            </span>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-3 border border-gray-200">
            <div className="font-medium text-gray-700 text-xs uppercase tracking-wide">Range</div>
            <div className="text-lg font-mono font-medium text-gray-900">{(+product.rangePercent * 100).toFixed(2)}%</div>
          </div>
          <div className="bg-gray-50 p-3 border border-gray-200">
            <div className="font-medium text-gray-700 text-xs uppercase tracking-wide">Potential Return</div>
            <div className="text-lg font-mono font-medium text-gray-900">{product.potentialReturn.toFixed(2)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
