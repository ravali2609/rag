// src/services/ragServices.ts
import { GoogleGenAI } from "@google/genai";
import { aiConfig } from "../config/appConfig.js";
import { documents } from "../database/schemas/document.js";
import db from "../database/client.js";
import { chunks } from "../database/schemas/chunk.js";
import { chunkText } from "../utils/chunker.js";
import { sql } from "drizzle-orm";
const genai = new GoogleGenAI({ apiKey: aiConfig.geminiKey });
export const generateEmbedding = async (text) => {
    try {
        const response = await genai.models.embedContent({
            model: 'models/text-embedding-004',
            contents: [text],
        });
        const responses = JSON.parse(JSON.stringify(response));
        return responses.embeddings[0].values;
    }
    catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
};
export async function storeDocument(title, content) {
    const chunked = chunkText(content, 200);
    const [doc] = await db
        .insert(documents)
        .values({ title, content })
        .returning({ id: documents.id });
    for (const c of chunked) {
        const emb = await generateEmbedding(c);
        if (!emb || emb.length === 0) {
            console.warn("Skipping chunk after failed retries:", c);
            continue;
        }
        const numericEmb = emb.map((v) => Number(v));
        const vectorLiteral = `[${numericEmb.join(",")}]`;
        await db.insert(chunks).values({
            document_id: doc.id,
            chunk: c,
            embedding: sql `${vectorLiteral}`,
        });
    }
    return doc.id;
}
// Hono handler
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
