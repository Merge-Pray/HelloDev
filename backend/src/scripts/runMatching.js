import "dotenv/config";
import db from "../db/db.js";
import { runMatchingForAllUsers } from "../libs/matchingAlgorithm.js";

async function runMatchingScript() {
  try {
    console.log("manual matching!");

    await db.connect();

    const result = await runMatchingForAllUsers();

    console.log(`matches created: ${result.matchesCreated}`);
    console.log(`matches updated: ${result.matchesUpdated}`);

    await db.close();
    process.exit(0);
  } catch (error) {
    console.error("error running matching script:", error);
    db.close().catch(() => {});
    process.exit(1);
  }
}

runMatchingScript();
