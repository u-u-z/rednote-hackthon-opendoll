/**
 * Backfill shapekeys for existing orders that have face images but no shapekeys.
 *
 * Usage: npx tsx cmd/backfill-shapekeys.ts
 */

import { init, orm } from "../shared/index.js";
init();
import { orders } from "../mod/dbmod/schema.js";
import { eq, isNull, and, isNotNull } from "drizzle-orm";
import { cfg } from "../shared/index.js";
import { analyzeImage } from "../lib/kigland.js";
import fs from "node:fs";
import path from "node:path";

async function main() {
  const rows = orm()
    .select({ id: orders.id, faceImage: orders.faceImage })
    .from(orders)
    .where(and(isNull(orders.shapekeys), isNotNull(orders.faceImage)))
    .all();

  console.log(`[backfill] Found ${rows.length} orders needing shapekeys`);

  for (const row of rows) {
    if (!row.faceImage) continue;

    const filename = row.faceImage.replace(/^\/api\/images\//, "");
    const filepath = path.join(cfg().dataDir, "images", filename);

    if (!fs.existsSync(filepath)) {
      console.warn(`[backfill] ${row.id}: image not found at ${filepath}, skipping`);
      continue;
    }

    try {
      console.log(`[backfill] ${row.id}: analyzing ${filename}…`);
      const imageData = fs.readFileSync(filepath);
      const blob = new Blob([imageData], { type: "image/png" });
      const feat = await analyzeImage(blob);

      orm()
        .update(orders)
        .set({
          featUuid: feat.uuid,
          shapekeys: JSON.stringify(feat.shapekeys),
        })
        .where(eq(orders.id, row.id))
        .run();

      console.log(`[backfill] ${row.id}: done — ${Object.keys(feat.shapekeys).length} shapekeys (uuid=${feat.uuid})`);
    } catch (err) {
      console.error(`[backfill] ${row.id}: failed — ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("[backfill] Done");
}

main().catch(console.error);
