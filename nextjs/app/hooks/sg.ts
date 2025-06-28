"use server";
//bc of cors has to be server side
import { ProductSearchResponse, HistoryItem, ExtendedProduct } from "./types";
import { unstable_cache } from "next/cache";
import { chunk } from "lodash";
import { differenceInDays } from "date-fns";

const SG_API_ENDPOINT = "https://www.sg-zertifikate.de/EmcWebApi/api";

export async function fetchProducts(pageNum = 0, pageSize = 100): Promise<ProductSearchResponse["Products"]> {
  const params = new URLSearchParams({
    PageNum: pageNum.toString(),
    PageSize: pageSize.toString(),
    ProductClassificationId: "8",
    CalcDateFrom: "2025-07-25",
    CalcDateTo: "2025-12-19",
    AssetId: "-4", // Oil Brent Futures
  });
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
  console.log("Intraday prices for product", json.length);
  return json;
}

export async function extendedProducts(limit: number = 100, offset: number = 0): Promise<ExtendedProduct[]> {
  const fetchedProducts = [];
  let isFinished = false;
  let pageNum = offset;
  while (!isFinished) {
    const products = await fetchProducts(pageNum);
    //console.log(products.length, pageNum);
    fetchedProducts.push(...products);
    if (products.length < 100 || pageNum > limit) {
      isFinished = true;
    }
    pageNum++;
  }
  //using lodash put into chunks and add underlying price from latest intraday price
  const chunkedProducts = chunk(fetchedProducts, 20);
  for (const chunk of chunkedProducts) {
    const prices = await Promise.all(chunk.map((p) => fetchProductIntradayPrices(p.Id)));
    chunk.forEach((p, i) => {
      if (prices[i].length < 1) {
        console.log("No prices for product", p.Code);
        // @ts-ignore
        p.underlyingPrice = 0;
        return;
      }
      // @ts-ignore
      p.underlyingPrice = prices[i][prices[i].length - 1].UnderlyingPrice;
    });
  }

  const extendedProducts = fetchedProducts.map((p) => {
    const rangePercent = (p.UpperBarrierInlineWarrant - p.LowerBarrierInlineWarrant) / p.LowerBarrierInlineWarrant;
    const spread = (p.Offer - p.Bid) / 10;
    const potentialReturn = ((10 - p.Bid) / p.Bid) * 100;
    // % differences to upper and lower barrier
    // @ts-ignore
    const diffToUpper = ((p.UpperBarrierInlineWarrant - p.underlyingPrice) / p.UpperBarrierInlineWarrant) * 100;
    // @ts-ignore
    const diffToLower = ((p.LowerBarrierInlineWarrant - p.underlyingPrice) / p.LowerBarrierInlineWarrant) * 100;
    return {
      ...p,
      spread: spread.toFixed(2),
      daysUntilExpiry: differenceInDays(new Date(p.MaturityDate), new Date()),
      daysRunning: differenceInDays(new Date(), new Date(p.IssueDate)),
      rangePercent: rangePercent.toFixed(2),
      potentialReturn: potentialReturn.toFixed(2) + "%",
      diffToUpper: diffToUpper.toFixed(2),
      diffToLower: diffToLower.toFixed(2),
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

export const getCachedExtendedProducts = unstable_cache(async (limit?: number, offset?: number) => extendedProducts(limit, offset), [], {
  tags: ["products"],
  revalidate: 60 * 60, //1H
});
