/**
 * Backfill multiview images for existing orders that have face images but no multiview.
 *
 * Usage: export $(grep -v '^#' .env | xargs) && npx tsx cmd/backfill-multiview.ts
 */

import { init, orm } from "../shared/index.js";
init();
import { orders } from "../mod/dbmod/schema.js";
import { eq, isNull, and, isNotNull } from "drizzle-orm";
import { generateMultiview } from "../lib/gemini.js";

async function main() {
  const rows = orm()
    .select({
      id: orders.id,
      sessionId: orders.sessionId,
      faceImage: orders.faceImage,
    })
    .from(orders)
    .where(and(isNull(orders.multiview), isNotNull(orders.faceImage)))
    .all();

  console.log(`[backfill-mv] Found ${rows.length} orders needing multiview`);

  for (const row of rows) {
    if (!row.faceImage) continue;

    try {
      console.log(`[backfill-mv] ${row.id}: generating multiview…`);
      const result = await generateMultiview(row.sessionId, row.faceImage);

      orm()
        .update(orders)
        .set({ multiview: JSON.stringify(result) })
        .where(eq(orders.id, row.id))
        .run();

      console.log(`[backfill-mv] ${row.id}: done — front=${result.front}, left=${result.left}, back=${result.back}`);
    } catch (err) {
      console.error(`[backfill-mv] ${row.id}: failed — ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("[backfill-mv] Done");
}

main().catch(console.error);
