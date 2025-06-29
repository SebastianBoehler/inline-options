"use server";
//bc of cors has to be server side
import { ProductSearchResponse, HistoryItem, ExtendedProduct, Asset } from "./types";
import { unstable_cache } from "next/cache";
import { chunk } from "lodash";
import { differenceInDays } from "date-fns";
import { StandardDeviation, BollingerBands } from "@debut/indicators";

const SG_API_ENDPOINT = "https://www.sg-zertifikate.de/EmcWebApi/api";

export async function fetchAssetTypes(): Promise<any> {
  const url = `${SG_API_ENDPOINT}/ProductSearch/AssetTypes`;
  const res = await fetch(url, {
    headers: {
      host: "www.sg-zertifikate.de",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Asset type fetch failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json;
}

export async function fetchAssets(productClass = "8"): Promise<Asset[]> {
  const url = `${SG_API_ENDPOINT}/ProductSearch/Assets?productClassificationId=${productClass}`;
  const res = await fetch(url, {
    headers: {
      host: "www.sg-zertifikate.de",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Asset fetch failed: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json as Asset[];
}

export async function fetchProducts(
  pageNum = 0,
  pageSize = 100,
  calcDateFrom = "2025-07-25",
  calcDateTo = "2025-12-19",
  assetId?: string
): Promise<ProductSearchResponse["Products"]> {
  const obj: Record<string, string> = {
    ProductClassificationId: "8",
  };
  if (pageNum) obj["PageNum"] = pageNum.toString();
  if (pageSize) obj["PageSize"] = pageSize.toString();
  if (calcDateFrom) obj["CalcDateFrom"] = calcDateFrom;
  if (calcDateTo) obj["CalcDateTo"] = calcDateTo;
  if (assetId) obj["AssetId"] = assetId;

  const params = new URLSearchParams(obj);

  const url = `${SG_API_ENDPOINT}/ProductSearch/Search?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      host: "www.sg-zertifikate.de",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Product fetch failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as ProductSearchResponse;
  return json.Products;
}

export async function fetchProductByCode(productCode: string): Promise<ProductSearchResponse["Products"][number]> {
  const url = `${SG_API_ENDPOINT}/Products?code=${productCode}`;
  const res = await fetch(url, {
    headers: {
      host: "www.sg-zertifikate.de",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Product fetch failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as ProductSearchResponse["Products"][number];
  return json;
}

export async function fetchHistory(productId: number): Promise<HistoryItem[]> {
  const url = `${SG_API_ENDPOINT}/Prices/History?productId=${productId}`;
  const res = await fetch(url, {
    headers: {
      host: "www.sg-zertifikate.de",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`History fetch failed for product ${productId}: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  return json;
}

export async function fetchProductIntradayPrices(productId: number): Promise<HistoryItem[]> {
  const url = `${SG_API_ENDPOINT}/Prices/Intraday?productId=${productId}`;
  const res = await fetch(url, {
    headers: {
      host: "www.sg-zertifikate.de",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Intraday prices fetch failed for product ${productId}: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  //console.log("Intraday prices for product", json.length);
  return json;
}

function calcVolatility(history: HistoryItem[], period = 20) {
  if (history.length < period + 1) {
    return { volatility: 0, bollingerWidth: 0 };
  }
  const returns: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const prev = history[i - 1].UnderlyingPrice;
    const curr = history[i].UnderlyingPrice;
    returns.push(Math.log(curr / prev));
  }
  const slice = returns.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const sd = new StandardDeviation(period);
  let sdVal = 0;
  slice.forEach((r) => {
    sdVal = sd.nextValue(r, mean);
  });
  const annVol = sdVal * Math.sqrt(252);

  const bb = new BollingerBands(period, 2);
  let bands: { lower: number; middle: number; upper: number } | undefined;
  history
    .slice(-period)
    .forEach((h) => {
      const res = bb.nextValue(h.UnderlyingPrice);
      if (res) bands = res;
    });
  const width = bands ? (bands.upper - bands.lower) / bands.middle : 0;
  return { volatility: annVol, bollingerWidth: width };
}

export interface ExtendedProductParams {
  limit: number;
  offset: number;
  calcDateFrom?: string;
  calcDateTo?: string;
  assetId?: string;
}

export async function extendedProducts({ limit, offset, calcDateFrom, calcDateTo, assetId }: ExtendedProductParams): Promise<ExtendedProduct[]> {
  const fetchedProducts = [];
  let isFinished = false;
  let pageNum = offset;
  const pageSize = 25;
  while (!isFinished) {
    const products = await fetchProducts(pageNum, pageSize, calcDateFrom, calcDateTo, assetId);
    console.log(products.length, pageNum);
    fetchedProducts.push(...products);
    if (products.length < 25 || fetchedProducts.length >= limit) {
      isFinished = true;
    }
    pageNum++;
  }
  //using lodash put into chunks and add underlying price from latest intraday price
  const chunkedProducts = chunk(fetchedProducts, 20);
  for (const chunk of chunkedProducts) {
    const prices = await Promise.all(chunk.map((p) => fetchProductIntradayPrices(p.Id)));
    const histories = await Promise.all(chunk.map((p) => fetchHistory(p.Id).catch(() => [] as HistoryItem[])));
    chunk.forEach((p, i) => {
      if (prices[i].length < 1) {
        console.log("No prices for product", p.Code);
        // @ts-ignore
        p.underlyingPrice = 0;
      } else {
        // @ts-ignore
        p.underlyingPrice = prices[i][prices[i].length - 1].UnderlyingPrice;
      }

      const { volatility, bollingerWidth } = calcVolatility(histories[i]);
      // @ts-ignore
      p.volatility = volatility;
      // @ts-ignore
      p.bollingerWidth = bollingerWidth;
    });
  }

  const extendedProducts = fetchedProducts.map((p) => {
    const rangePercent = (p.UpperBarrierInlineWarrant - p.LowerBarrierInlineWarrant) / p.LowerBarrierInlineWarrant;
    const spread = (p.Offer - p.Bid) / 10;
    const potentialReturn = ((10 - p.Bid) / p.Bid) * 100;
    // % differences to upper and lower barrier
    // @ts-ignore
    const diffToUpper = (p.UpperBarrierInlineWarrant / p.underlyingPrice - 1) * 100;
    // @ts-ignore
    const diffToLower = 1 - (p.LowerBarrierInlineWarrant / p.underlyingPrice) * 100;
    return {
      ...p,
      spread: spread.toFixed(2),
      daysUntilExpiry: differenceInDays(new Date(p.MaturityDate), new Date()),
      daysRunning: differenceInDays(new Date(), new Date(p.IssueDate)),
      rangePercent: rangePercent.toFixed(2),
      potentialReturn,
      diffToUpper: diffToUpper.toFixed(2),
      diffToLower: diffToLower.toFixed(2),
      volatility: Number((p as any).volatility ?? 0).toFixed(4),
      bollingerWidth: Number((p as any).bollingerWidth ?? 0).toFixed(4),
    } as ExtendedProduct;
  });
  //sort by lowest days until expiry and biggest range
  extendedProducts.sort((a, b) => {
    if (a.daysUntilExpiry < b.daysUntilExpiry) return -1;
    if (a.daysUntilExpiry > b.daysUntilExpiry) return 1;
    if (Number(a.rangePercent) < Number(b.rangePercent)) return -1;
    if (Number(a.rangePercent) > Number(b.rangePercent)) return 1;
    return 0;
  });
  console.log(extendedProducts[0]);
  return extendedProducts;
}

// export const getCachedExtendedProducts = unstable_cache(async (limit?: number, offset?: number) => extendedProducts(limit, offset), [], {
//   tags: ["products"],
//   revalidate: 60 * 60, //1H
// });
