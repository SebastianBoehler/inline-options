import { writeFile } from "fs/promises";

interface ProductSearchResponse {
  Products: Array<{
    Id: number;
    Code: string;
    [key: string]: unknown;
  }>;
}

interface HistoryResponse {
  data: unknown;
}

const SG_ENDPOINT = "https://www.sg-zertifikate.de/EmcWebApi/api/ProductSearch/Search";
const BF_ENDPOINT = "https://api.boerse-frankfurt.de/v1/data/quote_history_derivatives";

async function fetchProducts(pageNum = 0, pageSize = 25): Promise<ProductSearchResponse["Products"]> {
  const url = `${SG_ENDPOINT}?PageNum=${pageNum}&PageSize=${pageSize}&ProductClassificationId=8`;
  console.log("Fetching products from", url);
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

async function fetchHistory(wkn: string): Promise<HistoryResponse> {
  //TODO: dynamically adjust range to option
  //TODO: tokens in header seem wkn / product specific?!
  // client date seems to be correlated to trace id
  //TODO: switch to societe generale endpoints, not protected, same data
  // boerse frankfurt would provide more granularity, but has some fingerprinting

  // https://www.sg-zertifikate.de/EmcWebApi/api/Prices/Intraday?productId=5445209
  // https://www.sg-zertifikate.de/EmcWebApi/api/Prices/History?productId=5445209
  const url = `https://api.boerse-frankfurt.de/v1/data/quote_history_derivatives?wkn=${wkn}&from=2025-06-27T06%3A00%3A00Z&to=2025-06-27T20%3A00%3A00Z&offset=0&limit=25`;
  console.log("Fetching history from", url);
  const res = await fetch(url, {
    headers: {
      host: "api.boerse-frankfurt.de",
      accept: "application/json, text/plain, */*",
      "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
      "cache-control": "no-cache",
      "client-date": "2025-06-27T21:01:25.286Z",
      "x-client-traceid": "693a9d724c7cc577b9e42a0740634f75",
    },
    body: null,
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(`History fetch failed for ${wkn}: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as HistoryResponse;
  return json;
}

async function main() {
  try {
    console.log("Fetching products...");
    const products = await fetchProducts();
    console.log(`Fetched ${products.length} products.`);

    const sample = products.slice(0, 2);
    const histories: Record<string, HistoryResponse> = {};
    for (const p of sample) {
      console.log(`Fetching history for ${p.Code}`);
      histories[p.Code] = await fetchHistory(p.Code);
      // be polite, small delay to avoid hammering
      await new Promise((r) => setTimeout(r, 500));
    }

    // Save outputs for inspection
    await writeFile("products.json", JSON.stringify(products, null, 2));
    await writeFile("histories.json", JSON.stringify(histories, null, 2));

    console.log("Done. Saved products.json and histories.json");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
