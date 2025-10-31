import { Hono } from "hono";
import { queryHandler, saveText, syncFileDataToText } from "../handlers/ragHandler.js";
// import { queryHandler, uploadDoc } from "../handlers/docHandler.js";

const ragRouter = new Hono();

ragRouter.post("/",saveText);
ragRouter.post("/rag",queryHandler);
ragRouter.post("/upload",syncFileDataToText);

// ragRouter.post("/upload", uploadDoc);
// ragRouter.get("/query", queryHandler);

export default ragRouter