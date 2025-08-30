"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { extendedProducts } from "../hooks/sg";
import { ExtendedProduct, HistoryItem } from "../hooks/types";
import { fetchHistory } from "../hooks/sg";
import Spinner from "../components/ui/Spinner";

interface OptionHistoryOverlayChartProps {
  assetId: string;
  limit: number;
  calcDateFrom: string;
  calcDateTo: string;
}

type ChartPoint = {
  date: string;
  avg: number;
  [key: string]: number | string;
};

export default function OptionHistoryOverlayChart({
  assetId,
  limit,
  calcDateFrom,
  calcDateTo,
}: OptionHistoryOverlayChartProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [productCodes, setProductCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<{ [key: string]: boolean }>({ avg: false });

  const toggleSeries = (o: any) => {
    const { dataKey } = o;
    setHiddenSeries((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  useEffect(() => {
    async function load() {
      if (!assetId) return;
      try {
        setIsLoading(true);
        setError(null);
        const products: ExtendedProduct[] = await extendedProducts({
          limit,
          offset: 0,
          calcDateFrom,
          calcDateTo,
          assetId,
        });
        setProductCodes(products.map((p) => p.Code));
        const histories: HistoryItem[][] = await Promise.all(
          products.map((p) => fetchHistory(p.Id).catch(() => [] as HistoryItem[]))
        );
        // Aggregate by date
        const dateMap: Record<string, { sum: number; count: number; [key: string]: number }> = {};
        histories.forEach((hist, idx) => {
          const code = products[idx].Code;
          hist.forEach((item) => {
            const date = item.Date.split("T")[0];
            if (!dateMap[date]) {
              dateMap[date] = { sum: 0, count: 0 } as any;
            }
            dateMap[date].sum += item.Bid;
            dateMap[date].count += 1;
            dateMap[date][code] = item.Bid;
          });
        });
        const chartData: ChartPoint[] = Object.entries(dateMap)
          .map(([date, obj]) => ({
            date,
            avg: obj.sum / obj.count,
            ...obj,
          }))
          .sort((a, b) => (a.date < b.date ? -1 : 1));
        setData(chartData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [assetId, limit, calcDateFrom, calcDateTo]);

  if (!assetId) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
  ];

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <Legend onClick={toggleSeries} />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tickFormatter={(v) => v.toFixed(2)} domain={[0, 10]} />
          <Tooltip formatter={(v: number) => v.toFixed(2)} labelFormatter={(l) => l} />
          <Line
            type="monotone"
            dataKey="avg"
            name="Average Bid"
            stroke="#000000"
            strokeWidth={3}
            dot={false}
            hide={hiddenSeries["avg"]}
          />
          {productCodes.map((code, idx) => (
            <Line
              key={code}
              type="monotone"
              dataKey={code}
              name={code}
              stroke={colors[idx % colors.length]}
              strokeWidth={1}
              dot={false}
              hide={hiddenSeries[code]}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
