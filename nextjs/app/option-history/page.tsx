"use client";
import { fetchAssets } from "../hooks/sg";
import { useEffect, useState, useRef } from "react";
import { Asset } from "../hooks/types";
import OptionHistoryOverlayChart from "../components/OptionHistoryOverlayChart";

export default function OptionHistoryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetId, setAssetId] = useState<string>("");
  const [limit, setLimit] = useState<number>(100);
  const currentDate = useRef(new Date().toISOString().split("T")[0]);
  const [calcDateFrom, setCalcDateFrom] = useState<string>(currentDate.current);
  const [calcDateTo, setCalcDateTo] = useState<string>("2025-12-31");

  useEffect(() => {
    async function loadAssets() {
      const assets = await fetchAssets();
      setAssets(assets);
      if (assets.length > 0) setAssetId(assets[0].Id.toString());
    }
    loadAssets();
  }, []);

  const isValid = assetId !== "";

  return (
    <main className="p-6 mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Option Price History Overlay</h1>
      <form
        className="flex flex-wrap gap-4 mb-8 items-end bg-gray-50 p-4 rounded-lg shadow-sm"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="flex flex-col">
          <label htmlFor="assetId" className="text-xs font-medium text-gray-700 mb-1">
            Asset
          </label>
          <select
            id="assetId"
            value={assetId}
            onChange={(e) => setAssetId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-56"
            required
          >
            <option value="" disabled>
              Select an asset
            </option>
            {assets.map((asset) => (
              <option key={asset.Id} value={asset.Id}>
                {asset.Name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label htmlFor="limit" className="text-xs font-medium text-gray-700 mb-1">
            Product Limit
          </label>
          <input
            id="limit"
            type="number"
            min={1}
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="calcDateFrom" className="text-xs font-medium text-gray-700 mb-1">
            Date From
          </label>
          <input
            id="calcDateFrom"
            type="date"
            value={calcDateFrom}
            onChange={(e) => setCalcDateFrom(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-44"
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="calcDateTo" className="text-xs font-medium text-gray-700 mb-1">
            Date To
          </label>
          <input
            id="calcDateTo"
            type="date"
            value={calcDateTo}
            onChange={(e) => setCalcDateTo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-44"
          />
        </div>
      </form>

      {isValid ? (
        <OptionHistoryOverlayChart
          assetId={assetId}
          limit={limit}
          calcDateFrom={calcDateFrom}
          calcDateTo={calcDateTo}
        />
      ) : (
        <div className="text-red-500">Please select an asset to load data.</div>
      )}
    </main>
  );
}
