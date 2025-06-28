import { ProductSearchResponse, HistoryItem } from "./types";

const SG_API_ENDPOINT = "https://www.sg-zertifikate.de/EmcWebApi/api";

export async function fetchProducts(pageNum = 0, pageSize = 100): Promise<ProductSearchResponse["Products"]> {
  const params = new URLSearchParams({
    PageNum: pageNum.toString(),
    PageSize: pageSize.toString(),
    ProductClassificationId: "8",
    CalcDateFrom: "2025-07-25",
    CalcDateTo: "2025-12-19",
  });
  const url = `${SG_API_ENDPOINT}/ProductSearch/Search?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Product fetch failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as ProductSearchResponse;
  return json.Products;
}

export async function fetchHistory(productId: number): Promise<HistoryItem[]> {
  const url = `${SG_API_ENDPOINT}/Prices/History?productId=${productId}`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`History fetch failed for product ${productId}: ${res.status} ${res.statusText}`);
  }
  const json = await res.json();
  console.log(json.length);
  return json;
}
