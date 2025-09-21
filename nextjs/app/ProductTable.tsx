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
import { ColumnConfig, columnConfigs, ScoredProduct, SortKey } from "./ColumnsConfig";

const columnConfigMap = new Map<SortKey, ColumnConfig>(
  columnConfigs.map((column) => [column.key, column])
);

const normalizeSortValue = (
  product: ScoredProduct,
  column: ColumnConfig
): number | string | null => {
  if (column.sortValue) {
    return column.sortValue(product);
  }

  const raw = product[column.key as keyof ScoredProduct] as unknown;

  if (raw === null || raw === undefined) {
    return null;
  }

  if (column.numeric) {
    const numericValue =
      typeof raw === "number"
        ? raw
        : Number(String(raw).replace(/%$/, ""));
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length === 0 ? null : trimmed;
  }

  return raw as number | string | null;
};

const compareValues = (
  aValue: number | string | null,
  bValue: number | string | null,
  direction: "ascending" | "descending"
) => {
  const multiplier = direction === "ascending" ? 1 : -1;
  const aIsNull = aValue === null || aValue === undefined;
  const bIsNull = bValue === null || bValue === undefined;

  if (aIsNull && bIsNull) {
    return 0;
  }

  if (aIsNull) {
    return 1 * multiplier;
  }

  if (bIsNull) {
    return -1 * multiplier;
  }

  if (typeof aValue === "number" && typeof bValue === "number") {
    if (aValue === bValue) {
      return 0;
    }
    return (aValue < bValue ? -1 : 1) * multiplier;
  }

  const comparison = String(aValue).localeCompare(String(bValue), undefined, {
    numeric: true,
    sensitivity: "base",
  });

  return comparison * multiplier;
};

const resolveCellValue = (
  product: ScoredProduct,
  column: ColumnConfig
): any => {
  const raw = column.format
    ? column.format(product)
    : product[column.key];

  if (raw === null || raw === undefined) {
    return "—";
  }

  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length === 0 ? "—" : trimmed;
  }

  return raw;
};

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
        const column = columnConfigMap.get(sortConfig.key);
        if (!column) {
          return 0;
        }

        const aValue = normalizeSortValue(a, column);
        const bValue = normalizeSortValue(b, column);

        return compareValues(aValue, bValue, sortConfig.direction);
      });
    }
    return sortableProducts;
  }, [scoredProducts, sortConfig]);

  const downloadExcel = () => {
    const rows = sortedProducts.map((product) => {
      const row: Record<string, string | number> = {};
      columnConfigs.forEach((column) => {
        const value = resolveCellValue(product, column);
        row[column.label] = value;
      });
      row["Code"] = product.Code;
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
      <div className="h-[70vh] overflow-auto">
      <table className="w-full table-auto text-xs text-gray-900 leading-5 [font-variant-numeric:tabular-nums]">
        <thead className="bg-white sticky top-0 z-10 border-b">
          <tr>
            {columnConfigs.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`sticky top-0 z-10 bg-white px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-700 ${
                  column.minWidth ?? "min-w-[80px]"
                }`}
                onClick={() => requestSort(column.key)}
              >
                <span className="flex items-center gap-1">
                  {column.label}
                  {getSortIndicator(column.key)}
                </span>
              </th>
            ))}
            <th scope="col" className="sticky top-0 z-10 bg-white px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Link
            </th>
            <th scope="col" className="sticky top-0 z-10 bg-white px-3 py-2 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Expand
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {isLoading && (
            <tr>
              <td colSpan={columnConfigs.length + 2} className="h-12">
                <div className="flex items-center justify-center py-4"><Spinner /></div>
              </td>
            </tr>
          )}
          {sortedProducts.map((product, index) => (
            <React.Fragment key={index}>
              <tr
                className={`cursor-pointer transition-colors duration-150 odd:bg-white even:bg-gray-50 ${
                  expandedRow === index ? 'bg-blue-50' : 'hover:bg-gray-100'
                } ${product.Offer === 0 ? 'bg-rose-50' : ''}`}
                onClick={() => setExpandedRow(expandedRow === index ? null : index)}
              >
                {columnConfigs.map((column) => {
                  const value = resolveCellValue(product, column);

                  return (
                    <td
                      key={column.key}
                      className={`px-3 py-2 font-medium ${
                        column.numeric ? "text-right" : "text-left"
                      } ${column.key === "AssetName" ? "whitespace-normal" : "whitespace-nowrap"}`}
                    >
                      {value}
                    </td>
                  );
                })}
                <td className="px-3 py-2 whitespace-nowrap font-medium text-blue-600">
                  <Link
                    href={`https://www.sg-zertifikate.de/product-details/${product.Code}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.Code}
                  </Link>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-gray-500">
                  {expandedRow === index ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />
                  )}
                </td>
              </tr>
              {expandedRow === index && (
                <tr>
                  <td colSpan={columnConfigs.length + 2} className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x">
                      <BarrierVisualization product={product}/>
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
