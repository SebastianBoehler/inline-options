"use client";
import { fetchAssets } from "./hooks/sg";
import ProductTable from "./ProductTable";
import { useEffect, useRef, useState } from "react";
import useDebounce from "./hooks/useDebounce";
import { Asset } from "./hooks/types";
import { addDays } from "date-fns";

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [limit, setLimit] = useState(25);
  const [offset, setOffset] = useState(0);
  const currentDate = useRef(new Date().toISOString().split('T')[0]);
  const [calcDateFrom, setCalcDateFrom] = useState(currentDate.current);
  const [calcDateTo, setCalcDateTo] = useState(addDays(new Date(), 30).toISOString().split('T')[0]);
  const [assetId, setAssetId] = useState<string | undefined>(undefined); // "-4"

  const debouncedLimit = useDebounce(limit);
  const debouncedOffset = useDebounce(offset);
  const debouncedCalcDateFrom = useDebounce(calcDateFrom);
  const debouncedCalcDateTo = useDebounce(calcDateTo);
  const debouncedAssetId = useDebounce(assetId);

  useEffect(() => {
    async function getAssets() {
      const assets = await fetchAssets();
      console.log(assets);
      setAssets(assets);
    }
    getAssets();
  }, []);

  return (
    <main className="p-6 mx-auto">
      <form
        className="flex flex-wrap gap-4 mb-8 items-end bg-gray-50 p-4 rounded-lg shadow-sm"
        onSubmit={e => e.preventDefault()}
      >
        <div className="flex flex-col">
          <label htmlFor="limit" className="text-xs font-medium text-gray-700 mb-1">Limit</label>
          <input
            id="limit"
            type="number"
            min={1}
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-28"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="offset" className="text-xs font-medium text-gray-700 mb-1">Offset</label>
          <input
            id="offset"
            type="number"
            min={0}
            value={offset}
            onChange={e => setOffset(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-28"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="calcDateFrom" className="text-xs font-medium text-gray-700 mb-1">Date From</label>
          <input
            id="calcDateFrom"
            type="date"
            value={calcDateFrom}
            onChange={e => setCalcDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-44"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="calcDateTo" className="text-xs font-medium text-gray-700 mb-1">Date To</label>
          <input
            id="calcDateTo"
            type="date"
            value={calcDateTo}
            onChange={e => setCalcDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-44"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="assetId" className="text-xs font-medium text-gray-700 mb-1">Asset ID</label>
          <select
            id="assetId"
            value={assetId}
            onChange={e => setAssetId(e.target.value.toString())}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-28"
          >
            <option value="">Select an asset</option>
            {assets.map(asset => (
              <option key={asset.Id} value={asset.Id}>
                {asset.Name}
              </option>
            ))}
          </select>
        </div>
      </form>
      <ProductTable
        limit={debouncedLimit}
        offset={debouncedOffset}
        calcDateFrom={debouncedCalcDateFrom}
        calcDateTo={debouncedCalcDateTo}
        assetId={debouncedAssetId}
      />
    </main>
  );
}

