import { Hono } from "hono";
import { saveDocument } from "../handlers/docHandler.js";
// import { queryHandler, uploadDoc } from "../handlers/docHandler.js";
const ragRouter = new Hono();
ragRouter.post("/", saveDocument);
// ragRouter.post("/upload", uploadDoc);
// ragRouter.get("/query", queryHandler);
export default ragRouter;
