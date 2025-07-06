"use server";
//bc of cors has to be server side
import { ProductSearchResponse, HistoryItem, ExtendedProduct, Asset } from "./types";
import { unstable_cache } from "next/cache";
import { chunk } from "lodash";
import { differenceInDays, differenceInMinutes } from "date-fns";
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

export const getCachedAssets = unstable_cache(fetchAssets, ["assets"], {
  tags: ["assets"],
  revalidate: 60 * 60 * 24,
});

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
    console.error(`Product fetch failed: ${res.status} ${res.statusText}`);
    return [];
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

function calcMetrics(history: HistoryItem[], period = 20, confidence = 0.95) {
  if (history.length < period + 1) {
    return { volatility: 0, bollingerWidth: 0, var95: 0 };
  }
  const underlyingReturns: number[] = [];
  const optionReturns: number[] = [];
  for (let i = 1; i < history.length; i++) {
    const prevUnderlying = history[i - 1].UnderlyingPrice;
    const currUnderlying = history[i].UnderlyingPrice;
    underlyingReturns.push(Math.log(currUnderlying / prevUnderlying));

    const prevBid = history[i - 1].Bid;
    const currBid = history[i].Bid;
    optionReturns.push(Math.log(currBid / prevBid));
  }
  const slice = underlyingReturns.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;
  const sd = new StandardDeviation(period);
  let sdVal = 0;
  slice.forEach((r) => {
    sdVal = sd.nextValue(r, mean);
  });
  const annVol = sdVal * Math.sqrt(252);

  const bb = new BollingerBands(period, 2);
  let bands: { lower: number; middle: number; upper: number } | undefined;
  history.slice(-period).forEach((h) => {
    const res = bb.nextValue(h.UnderlyingPrice);
    if (res) bands = res;
  });
  const width = bands ? (bands.upper - bands.lower) / bands.middle : 0;

  const returnsSlice = optionReturns.slice(-period).sort((a, b) => a - b);
  const idx = Math.floor((1 - confidence) * returnsSlice.length);
  const varReturn = returnsSlice[idx] ?? 0;
  const lastBid = history[history.length - 1].Bid;
  const var95 = -varReturn * lastBid;

  return { volatility: annVol, bollingerWidth: width, var95 };
}

export interface ExtendedProductParams {
  limit: number;
  offset: number;
  calcDateFrom?: string;
  calcDateTo?: string;
  assetId?: string;
}

const priceCache = new Map<string, { price: number; timestamp: Date }>();
export const getUnderylingPrice = async (product: ProductSearchResponse["Products"][number]): Promise<number> => {
  const cached = priceCache.get(product.AssetRic);
  if (cached) {
    const diff = differenceInMinutes(new Date(), cached.timestamp);
    if (diff < 30) return cached.price;
  }
  const intradayPrice = await fetchProductIntradayPrices(product.Id)
    .then((prices) => prices[prices.length - 1].UnderlyingPrice)
    .catch(() => null);

  if (intradayPrice) {
    priceCache.set(product.AssetRic, { price: intradayPrice, timestamp: new Date() });
    return intradayPrice;
  }

  const history = await fetchHistory(product.Id)
    .then((prices) => prices[prices.length - 1].UnderlyingPrice)
    .catch(() => null);

  if (history) {
    priceCache.set(product.AssetRic, { price: history, timestamp: new Date() });
    return history;
  }

  return 0;
};

export async function extendedProducts({ limit, offset, calcDateFrom, calcDateTo, assetId }: ExtendedProductParams): Promise<ExtendedProduct[]> {
  const fetchedProducts = [];
  let isFinished = false;
  let pageNum = offset;
  const pageSize = 25;
  while (!isFinished) {
    const products = await fetchProducts(pageNum, pageSize, calcDateFrom, calcDateTo, assetId);
    console.log(products.length, pageNum);
    fetchedProducts.push(...products);
    if (products.length < pageSize || fetchedProducts.length >= limit) {
      isFinished = true;
    }
    pageNum++;
  }
  for (const product of fetchedProducts) {
    const price = await getUnderylingPrice(product);
    // @ts-ignore
    product.underlyingPrice = price;
  }
  //using lodash put into chunks and add underlying price from latest intraday price
  const chunkedProducts = chunk(fetchedProducts, 20);
  for (const chunk of chunkedProducts) {
    const histories = await Promise.allSettled(chunk.map((p) => fetchHistory(p.Id)));
    chunk.forEach((p, i) => {
      if (histories[i].status === "rejected") {
        return;
      }
      const { volatility, bollingerWidth, var95 } = calcMetrics(histories[i].value);
      // @ts-ignore
      p.volatility = volatility;
      // @ts-ignore
      p.bollingerWidth = bollingerWidth;
      // @ts-ignore
      p.var95 = var95;
    });
  }

  const extendedProducts = fetchedProducts.map((p) => {
    const rangePercent = (p.UpperBarrierInlineWarrant - p.LowerBarrierInlineWarrant) / p.LowerBarrierInlineWarrant;
    const spread = (p.Offer - p.Bid) / 10;
    const potentialReturn = ((10 - p.Offer) / p.Offer) * 100;
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
      var95: Number((p as any).var95 ?? 0).toFixed(4),
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
