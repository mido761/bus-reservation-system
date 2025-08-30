import cron from "node-cron";
import { reconcilePaymob } from "./reconcilePaymob.js";

// Run every 5 minutes
cron.schedule("*/1 * * * *", async () => {
  console.log("Running reconcile job...");
  // await reconcilePaymob();
  try {
    const response = await reconcilePaymob();
    console.log(response);
  } catch (err) {
    console.error({ Error: "Error reconciling!", message: err.message });
  }
  console.log("Finished reconcile job!");
});
