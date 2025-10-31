import { cors } from "hono/cors";

import envData from "./env.js";
import factory from "./factory.js";
import ragRouter from "./routes/ragRoutes.js";


const app = factory.createApp().basePath(envData.API_VERSION);

app.get("/", (c) => {
 return c.json({
  status: 200,
  success: true,
  message: "Hello, Welcome to rag implementation",
 })
});

app.use("*", cors());


app.get("/error", (c) => {
  c.status(422);
  c.var.logger.debug("Test error only visible in development");
  throw new Error("Test error");
});

app.route("/doc", ragRouter);



export default app;
