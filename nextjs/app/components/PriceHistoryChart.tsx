"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ExtendedProduct } from "../hooks/types";
import { fetchHistory } from "../hooks/sg";
import Spinner from "../components/ui/Spinner";

interface PriceHistoryChartProps {
  product: ExtendedProduct;
}

interface ChartPoint {
  date: string;
  price: number;
  bid: number;
  ask: number;
}

export default function PriceHistoryChart({ product }: PriceHistoryChartProps) {
  const [data, setData] = useState<ChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hidden, setHidden] = useState<{ [key: string]: boolean }>({ price: false, bid: false });

  const handleLegendClick = (o: any) => {
    const { dataKey } = o;
    setHidden((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  useEffect(() => {
    async function loadHistory() {
      try {
        setIsLoading(true);
        const res = await fetchHistory(product.Id);
        const chartData = res.map((item) => ({
          date: item.Date.split("T")[0],
          price: item.UnderlyingPrice,
          bid: item.Bid,
          ask: item.Ask,
        }));
        console.log(chartData);
        setData(chartData);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadHistory();
  }, [product.Id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="w-full h-64 p-4 h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <Legend onClick={handleLegendClick} />
          <XAxis dataKey="date" hide />
          <YAxis
            yAxisId="left"
            domain={[
              Math.min(
                product.LowerBarrierInlineWarrant * 0.9,
                ...data.map((d) => d.price)
              ),
              Math.max(
                product.UpperBarrierInlineWarrant * 1.1,
                ...data.map((d) => d.price)
              ),
            ]}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip formatter={(value: number) => value.toFixed(2)} labelFormatter={(label) => label} />
          <ReferenceLine
            y={product.LowerBarrierInlineWarrant}
            yAxisId="left"
            stroke="red"
            strokeDasharray="3 3"
            label={{ value: "Lower Barrier", position: "insideTopLeft", fontSize: 10 }}
          />
          <ReferenceLine
            y={product.UpperBarrierInlineWarrant}
            yAxisId="left"
            stroke="green"
            strokeDasharray="3 3"
            label={{ value: "Upper Barrier", position: "insideTopLeft", fontSize: 10 }}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="price"
            name="Underlying Price"
            stroke="#8884d8"
            dot={false}
            strokeWidth={2}
            hide={hidden.price}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="bid"
            name="Bid Price"
            stroke="#ff7300"
            dot={false}
            strokeWidth={2}
            hide={hidden.bid}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="ask"
            name="Ask Price"
            stroke="#00ff00"
            dot={false}
            strokeWidth={2}
            hide={hidden.ask}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
