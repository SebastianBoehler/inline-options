"use client";

import React, { useEffect, useState, useMemo } from "react";
import { extendedProducts } from "./hooks/sg";
import { ExtendedProduct } from "./hooks/types";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import BarrierVisualization from "./components/BarrierVisualization";
import ProductInfoPanel from "./components/ProductInfoPanel";

type SortKey = keyof ExtendedProduct;

const columns: SortKey[] = [
  "Isin",
  "AssetName",
  "diffToLower",
  "diffToUpper",
  "Bid",
  "Offer",
  "spread",
  "rangePercent",
  "potentialReturn",
  "daysUntilExpiry",
  "daysRunning",
];

export default function ProductTable() {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    async function getProducts() {
      const products = await extendedProducts(1);
      setProducts(products);
      setIsLoading(false);
    }
    getProducts();
  }, []);

  const sortedProducts = useMemo(() => {
    let sortableProducts = [...products];
    if (sortConfig !== null) {
      sortableProducts.sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableProducts;
  }, [products, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: "ascending" | "descending" = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

const getSortIndicator = (key: SortKey) => {
  if (!sortConfig || sortConfig.key !== key) {
    return null;
  }
  return sortConfig.direction === "ascending" ? (
    <ChevronUpIcon className="ml-1 w-4 h-4 text-gray-400 inline align-middle" />
  ) : (
    <ChevronDownIcon className="ml-1 w-4 h-4 text-gray-400 inline align-middle" />
  );
};

  return (
    <div className="mx-auto w-full h-screen overflow-y-auto overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort(column)}
              >
                <span className="flex items-center gap-1">
                  {column}
                  {getSortIndicator(column)}
                </span>
              </th>
            ))}
            <th scope="col" className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
              Link
            </th>
            <th scope="col" className="sticky top-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expand
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading && (
            <tr>
              <td colSpan={columns.length} className="h-10">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                </div>
              </td>
            </tr>
          )}
          {sortedProducts.map((product, index) => (
            <React.Fragment key={index}>
              <tr 
                className={`cursor-pointer transition-colors duration-150 ${
                  hoveredRow === index || expandedRow === index 
                    ? 'bg-blue-50' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                onMouseEnter={() => setHoveredRow(index)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                  >
                    {product[column] as string}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  <Link 
                    href={`https://www.sg-zertifikate.de/product-details/${product.Code}`} 
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.Code}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {expandedRow === index ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </td>
              </tr>
              {expandedRow === index && (
                <tr>
                  <td colSpan={columns.length + 2} className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                      <BarrierVisualization product={product} />
                      <ProductInfoPanel product={product} />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
