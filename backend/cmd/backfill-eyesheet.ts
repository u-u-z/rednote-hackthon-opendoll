/**
 * Backfill eyesheet images for existing orders that have face images but no eyesheet.
 *
 * Usage: export $(grep -v '^#' .env | xargs) && npx tsx cmd/backfill-eyesheet.ts
 */

import { init, orm } from "../shared/index.js";
init();
import { orders } from "../mod/dbmod/schema.js";
import { eq, isNull, and, isNotNull } from "drizzle-orm";
import { generateEyesheet } from "../lib/eyesheet.js";

async function main() {
  const rows = orm()
    .select({
      id: orders.id,
      sessionId: orders.sessionId,
      faceImage: orders.faceImage,
    })
    .from(orders)
    .where(and(isNull(orders.eyesheet), isNotNull(orders.faceImage)))
    .all();

  console.log(`[backfill-eye] Found ${rows.length} orders needing eyesheet`);

  for (const row of rows) {
    if (!row.faceImage) continue;

    try {
      console.log(`[backfill-eye] ${row.id}: generating eyesheet…`);
      const result = await generateEyesheet(row.sessionId, row.faceImage);

      orm()
        .update(orders)
        .set({ eyesheet: JSON.stringify(result) })
        .where(eq(orders.id, row.id))
        .run();

      console.log(`[backfill-eye] ${row.id}: done — eyes=${result.eyes}, iris=${result.iris}, eyelash=${result.eyelash}`);
    } catch (err) {
      console.error(`[backfill-eye] ${row.id}: failed — ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("[backfill-eye] Done");
}

main().catch(console.error);
