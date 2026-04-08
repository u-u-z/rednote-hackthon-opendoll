import "dotenv/config";
import { serve } from "@hono/node-server";
import { init, cfg } from "../../shared/index.js";
import { createApp } from "../../svc/index.js";

init();

const app = createApp();
const port = cfg().port;

serve({ fetch: app.fetch, port }, () => {
  console.log(`[opendoll] http://localhost:${port}`);
});
