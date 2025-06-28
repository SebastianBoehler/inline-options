import { writeFile } from "fs/promises";
import { differenceInDays } from "date-fns";
import { fetchProducts, fetchHistory } from "./sg";
import yahooFinance from "yahoo-finance2";

async function main() {
  try {
    console.log("Fetching products...");
    const products = await fetchProducts();
    console.log(`Fetched ${products.length} products.`);

    const histories: Record<string, any[]> = {};
    for (const p of products) {
      console.log(`Fetching history for ${p.Code}`);
      histories[p.Code] = await fetchHistory(p.Id);

      //analytics
      // based on latest underlying price calc distance to barrier
      const latest = histories[p.Code][histories[p.Code].length - 1];
      p.distanceToUpperBarrier = p.UpperBarrierInlineWarrant - latest.UnderlyingPrice;
      p.distanceToLowerBarrier = p.LowerBarrierInlineWarrant - latest.UnderlyingPrice;
      const today = new Date();
      const maturityDate = new Date(p.MaturityDate);
      const issueDate = new Date(p.IssueDate);

      p.spread = (latest.Ask - latest.Bid) / 10;
      p.daysUntilExpiry = differenceInDays(maturityDate, today);
      p.daysRunning = differenceInDays(today, issueDate);
      p.duration = differenceInDays(maturityDate, issueDate);
      // range percentage
      p.rangePercentage = (p.UpperBarrierInlineWarrant - p.LowerBarrierInlineWarrant) / p.UpperBarrierInlineWarrant;
      // is price in upper percentage? above 9
      p.isInUpperPercentage = p.Offer > 9;
    }

    // Save products with less than 20 days left, sorted by lowest price
    const productsToSave = products
      .filter((p) => p.daysUntilExpiry! < 50)
      // @ts-ignore
      .sort((a, b) => b.rangePercentage! - a.rangePercentage!);
    await writeFile("products.json", JSON.stringify(productsToSave, null, 2));

    console.log("Done. Saved products.json and histories.json");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
