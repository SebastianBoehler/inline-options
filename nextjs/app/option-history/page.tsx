"use client";
import { fetchAssets } from "../hooks/sg";
import { useEffect, useState, useRef } from "react";
import useDebounce from "../hooks/useDebounce";
import { Asset } from "../hooks/types";
import OptionHistoryOverlayChart from "../components/OptionHistoryOverlayChart";
import Container from "../components/ui/Container";
import Card from "../components/ui/Card";
import Field from "../components/ui/Field";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

export default function OptionHistoryPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetId, setAssetId] = useState<string>("");
  const [limit, setLimit] = useState<number>(100);
  const currentDate = useRef(new Date().toISOString().split("T")[0]);
  const [calcDateFrom, setCalcDateFrom] = useState<string>(currentDate.current);
  const [calcDateTo, setCalcDateTo] = useState<string>("2025-12-31");

  const debouncedAssetId = useDebounce(assetId);
  const debouncedLimit = useDebounce(limit);
  const debouncedCalcDateFrom = useDebounce(calcDateFrom);
  const debouncedCalcDateTo = useDebounce(calcDateTo);

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
    <main>
      <Container className="py-6">
        <h1 className="text-xl font-semibold mb-4">Option Price History</h1>
        <Card className="mb-6 p-4">
          <form className="grid grid-cols-2 md:grid-cols-4 gap-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Asset" htmlFor="assetId">
              <Select
                id="assetId"
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
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
              </Select>
            </Field>
            <Field label="Product Limit" htmlFor="limit">
              <Input
                id="limit"
                type="number"
                min={1}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              />
            </Field>
            <Field label="Date From" htmlFor="calcDateFrom">
              <Input
                id="calcDateFrom"
                type="date"
                value={calcDateFrom}
                onChange={(e) => setCalcDateFrom(e.target.value)}
              />
            </Field>
            <Field label="Date To" htmlFor="calcDateTo">
              <Input
                id="calcDateTo"
                type="date"
                value={calcDateTo}
                onChange={(e) => setCalcDateTo(e.target.value)}
              />
            </Field>
          </form>
        </Card>

        {isValid ? (
          <Card className="p-4">
            <OptionHistoryOverlayChart
              assetId={debouncedAssetId}
              limit={debouncedLimit}
              calcDateFrom={debouncedCalcDateFrom}
              calcDateTo={debouncedCalcDateTo}
            />
          </Card>
        ) : (
          <div className="text-rose-600">Please select an asset to load data.</div>
        )}
      </Container>
    </main>
  );
}
