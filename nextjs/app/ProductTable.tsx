"use client";

import React, { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import { extendedProducts } from "./hooks/sg";
import { ExtendedProduct } from "./hooks/types";
import { addScoreColumn } from "@/lib/scorer";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import BarrierVisualization from "./components/BarrierVisualization";
import ProductInfoPanel from "./components/ProductInfoPanel";
import PriceHistoryChart from "./components/PriceHistoryChart";
import Card from "./components/ui/Card";
import Spinner from "./components/ui/Spinner";
import Button from "./components/ui/Button";

type SortKey = keyof ExtendedProduct | "score" | "optiz formula";

type ScoredProduct = ExtendedProduct & { score: number; "optiz formula": number };

const columns: SortKey[] = [
  "score",
  "optiz formula",
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
  "volatility",
  "bollingerWidth",
  "var95",
];

interface ProductTableProps {
  limit?: number;
  offset?: number;
  calcDateFrom?: string;
  calcDateTo?: string;
  assetId?: string;
}

export default function ProductTable({ limit = 10, offset = 0, calcDateFrom, calcDateTo, assetId }: ProductTableProps) {
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  useEffect(() => {
    async function getProducts() {
      setIsLoading(true);
      setExpandedRow(null);
      setProducts([]);
      const products = await extendedProducts({ limit, offset, calcDateFrom, calcDateTo, assetId });
      setProducts(products);
      console.log(products);
      setIsLoading(false);
    }
    getProducts();
  }, [limit, offset, calcDateFrom, calcDateTo, assetId]);

  const scoredProducts: ScoredProduct[] = useMemo(() => addScoreColumn(products), [products]);

  const sortedProducts: ScoredProduct[] = useMemo(() => {
    let sortableProducts = [...scoredProducts];
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
  }, [scoredProducts, sortConfig]);

  const downloadExcel = () => {
    const rows = sortedProducts.map((p) => {
      const row: Record<string, string | number> = {};
      columns.forEach((c) => {
        if (c === "score") {
          row[c] = p.score.toFixed(3);
        } else if (c === "optiz formula") {
          row[c] = (p["optiz formula"] as number).toFixed(3);
        } else {
          row[c] = (p as any)[c];
        }
      });
      row["Code"] = p.Code;
      return row;
    });
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Products");
    XLSX.writeFile(workbook, "products.xlsx");
  };

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
    <div className="w-full">
      <div className="flex items-center justify-end mb-3">
        <Button variant="secondary" size="sm" onClick={downloadExcel}>
          Download Excel
        </Button>
      </div>
      <Card className="overflow-hidden">
      <div className="h-[70vh] overflow-x-auto">
      <table className="min-w-full text-sm text-gray-900 [font-variant-numeric:tabular-nums]">
        <thead className="bg-white sticky top-0 z-10 border-b">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="sticky top-0 z-10 bg-white px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                onClick={() => requestSort(column)}
              >
                <span className="flex items-center gap-1">
                  {column}
                  {getSortIndicator(column)}
                </span>
              </th>
            ))}
            <th scope="col" className="sticky top-0 z-10 bg-white px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
              Link
            </th>
            <th scope="col" className="sticky top-0 z-10 bg-white px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expand
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading && (
            <tr>
              <td colSpan={columns.length} className="h-10">
                <div className="flex items-center justify-center py-4"><Spinner /></div>
              </td>
            </tr>
          )}
          {sortedProducts.map((product, index) => (
            <React.Fragment key={index}>
              <tr
                className={`cursor-pointer transition-colors duration-150 odd:bg-white even:bg-gray-50 ${
                  expandedRow === index 
                    ? 'bg-blue-50' 
                    : 'hover:bg-gray-100'
                } ${product.Offer === 0 ? 'bg-rose-50' : ''}`}
                onClick={() => setExpandedRow(expandedRow === index ? null : index)}
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-6 py-3 whitespace-nowrap font-medium"
                  >
                    {column === 'score'
                      ? product.score.toFixed(3)
                      : column === 'optiz formula'
                        ? (product["optiz formula"] as number).toFixed(3)
                        : (product[column] as string)}
                  </td>
                ))}
                <td className="px-6 py-3 whitespace-nowrap font-medium text-blue-600">
                  <Link 
                    href={`https://www.sg-zertifikate.de/product-details/${product.Code}`} 
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.Code}
                  </Link>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-gray-500">
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x">
                      <BarrierVisualization product={product} />
                      <ProductInfoPanel product={product} />
                      <PriceHistoryChart product={product} />
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      </div>
      </Card>
    </div>
  );
}
