// src/handlers/docHandler.ts

import type { Context } from "hono";
import { generateAnswer, retrieveRelevantChunks, storeDocument } from "../services/ragServices.js";
import mammoth from "mammoth";
import { parse } from "csv-parse/sync";
import { PDFParse } from 'pdf-parse';



export const saveText = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { title, content } = body;

    if (!title || !content) return c.json({ error: "Missing title or content" }, 400);

    const docId = await storeDocument(title, content);

    return c.json({ docId });
  } catch (err) {
    console.error("Error saving document:", err);
    return c.json({ error: "Failed to save document" }, 500);
  }
};

export const queryHandler = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { prompt } = body;
    if (!prompt) return c.json({ error: "Missing query" }, 400);

    const retrived = await retrieveRelevantChunks(prompt);

    const answer = await generateAnswer(prompt, retrived);

    return c.json({
      question: prompt,
      answer
    });
  } catch (err) {
    console.error("Error querying chunks:", err);
    return c.json({ error: "Query failed" }, 500);
  }
}

// your DB insert function

export const syncFileDataToText = async (c: Context) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;
    if (!file) return c.json({ error: "Missing file" }, 400);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileType = file.name.split(".").pop()?.toLowerCase();

    let text = "";

    switch (fileType) {
      case "pdf":
        const pdfData =  new PDFParse(buffer);
        text = pdfData?.text ?? "";
        break;

      case "docx":
        const docData = await mammoth.extractRawText({ buffer });
        text = docData.value;
        break;

      case "csv":
        const csvData = parse(buffer.toString("utf-8"), {
          relax_column_count: true,
          skip_empty_lines: true
        });
        text = csvData.flat().join(" ");
        break;


      case "txt":
        text = buffer.toString("utf-8");
        break;

      default:
        text = buffer.toString("utf-8");
        break;
    }

    const data = await storeDocument(file.name, text);

    return c.json({
      success: true,
      message: `File '${file.name}' uploaded and processed successfully.`,
      data,
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    return c.json({ error: "Failed to upload file" }, 500);
  }
};
