"use client";
import { fetchAssets, getCachedAssets } from "./hooks/sg";
import ProductTable from "./ProductTable";
import { useEffect, useRef, useState } from "react";
import useDebounce from "./hooks/useDebounce";
import { Asset } from "./hooks/types";
import { addDays } from "date-fns";
import Container from "./components/ui/Container";
import Card from "./components/ui/Card";
import Field from "./components/ui/Field";
import Input from "./components/ui/Input";
import Select from "./components/ui/Select";

export default function Home() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [limit, setLimit] = useState(500);
  const [offset, setOffset] = useState(1);
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
      const assets = await getCachedAssets();
      console.log(assets);
      setAssets(assets);
    }
    getAssets();
  }, []);

  return (
    <main>
      <Container className="py-6">
        <h1 className="text-xl font-semibold mb-4">Dashboard</h1>
        <Card className="mb-6 p-4">
          <form className="grid grid-cols-2 md:grid-cols-5 gap-4" onSubmit={(e) => e.preventDefault()}>
            <Field label="Limit" htmlFor="limit">
              <Input
                id="limit"
                type="number"
                min={1}
                step={5}
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
              />
            </Field>
            <Field label="Offset" htmlFor="offset">
              <Input
                id="offset"
                type="number"
                min={1}
                value={offset}
                onChange={(e) => setOffset(Number(e.target.value))}
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
            <Field label="Asset" htmlFor="assetId">
              <Select
                id="assetId"
                value={assetId ?? ""}
                onChange={(e) => setAssetId(e.target.value.toString())}
              >
                <option value="">Select an asset</option>
                {assets.map((asset) => (
                  <option key={asset.Id} value={asset.Id}>
                    {asset.Name}
                  </option>
                ))}
              </Select>
            </Field>
          </form>
        </Card>

        <ProductTable
          limit={debouncedLimit}
          offset={debouncedOffset}
          calcDateFrom={debouncedCalcDateFrom}
          calcDateTo={debouncedCalcDateTo}
          assetId={debouncedAssetId}
        />
      </Container>
    </main>
  );
}
