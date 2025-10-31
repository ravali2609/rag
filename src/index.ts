import { serve } from "@hono/node-server";

import app from "./app.js";
import envData from "./env.js";
import { storeDocument } from "./services/ragServices.js";

const port = envData.PORT;

serve({
  fetch: app.fetch,
  port,
}, () => {
  // eslint-disable-next-line no-console
  console.log(`Listening on http://localhost:${port}/${envData.API_VERSION}`);
});





