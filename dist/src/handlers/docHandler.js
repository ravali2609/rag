// src/handlers/docHandler.ts
// import PDFParse from "pdf-parse";
import mammoth from "mammoth";
import { chunkText } from "../utils/chunker.js";
import { storeDocument } from "../services/ragServices.js";
// import { retrieveRelevantChunks } from "../services/retriever.js"; // implement separately
export const saveDocument = async (c) => {
    try {
        const body = await c.req.json();
        const { title, content } = body;
        if (!title || !content)
            return c.json({ error: "Missing title or content" }, 400);
        const docId = await storeDocument(title, content);
        return c.json({ docId });
    }
    catch (err) {
        console.error("Error saving document:", err);
        return c.json({ error: "Failed to save document" }, 500);
    }
};
// export const queryHandler = async (c: Context) => {
//   try {
//     const query = c.req.query("q") || "";
//     if (!query) return c.json({ error: "Missing query" }, 400);
//     const topChunks = await retrieveRelevantChunks(query);
//     return c.json({
//       retrieved: topChunks.map((c: { chunk: string }) => c.chunk),
//     });
//   } catch (err) {
//     console.error("Error querying chunks:", err);
//     return c.json({ error: "Query failed" }, 500);
//   }
// };
// export const uploadHandler = async (c: Context) => {
//   try {
//     const formData = await c.req.formData();
//     const file = formData.get("file") as File;
//     if (!file) return c.json({ error: "Missing file" }, 400);
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     let text = "";
//     const ext = file.name.split(".").pop()?.toLowerCase();
//     if (ext === "pdf") {
//       const parsed = await PDFParse(buffer);
//       text = parsed.text ?? "";
//     } else if (ext === "docx") {
//       const parsed = await mammoth.extractRawText({ buffer });
//       text = parsed.value;
//     } else {
//       text = buffer.toString("utf-8");
//     }
//     const docId = await storeDocument(file.name, text);
//     return c.json({ docId, file: file.name });
//   } catch (err) {
//     console.error("Error uploading file:", err);
//     return c.json({ error: "File upload failed" }, 500);
//   }
// };
