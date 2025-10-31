// src/services/ragServices.ts
import { GoogleGenAI } from "@google/genai";
import { aiConfig } from "../config/appConfig.js";
import { documents } from "../database/schemas/document.js";
import { chunks } from "../database/schemas/chunk.js";
import db from "../database/client.js";
import { chunkText } from "../utils/chunker.js";
import { sql } from "drizzle-orm";

const genai = new GoogleGenAI({ apiKey: aiConfig.geminiKey });

export const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const response = await genai.models.embedContent({
      model: "models/text-embedding-004",
      contents: [text],
    });

    const embeddings = response.embeddings?.[0]?.values;
    if (!embeddings) {
      throw new Error("No embeddings returned from API");
    }

    return embeddings;
  } catch (error) {
    console.error(" Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
};

export async function storeDocument(title: string, content: string): Promise<number> {
  const chunked = chunkText(content, 200);

  const [doc] = await db
    .insert(documents)
    .values({ title, content })
    .returning({ id: documents.id });

  for (const c of chunked) {
    try {
      const emb = await generateEmbedding(c);
      const vectorLiteral = `[${emb.map((v) => Number(v)).join(",")}]`;

      await db.insert(chunks).values({
        document_id: doc.id,
        chunk: c,
        embedding: sql`${vectorLiteral}::vector`,
      });
    } catch {
      console.warn("Skipping chunk due to embedding error:", c);
    }
  }

  return doc.id;
}

export const retrieveRelevantChunks = async (query: string, topK = 3) => {
  const emb = await generateEmbedding(query);
  const vectorLiteral = `[${emb.map((v) => Number(v)).join(",")}]`;

  const topChunks = await db
    .select({
      chunk: chunks.chunk,
      similarity: sql`1 - (embedding <=> ${vectorLiteral}::vector)`,
    })
    .from(chunks)
    .orderBy(sql`embedding <=> ${vectorLiteral}::vector`)
    .limit(topK);

  return topChunks.map((c) => ({
    chunk: c.chunk,
    similarity: Number(c.similarity),
  }));
};

export async function generateAnswer(prompt: string, retrievedChunks: any[]) {
  const contextText = retrievedChunks.map((c) => c.chunk).join("\n\n---\n\n");

  const systemPrompt = `
You are an expert assistant using a Retrieval-Augmented Generation (RAG) system.
Use the retrieved context below to answer clearly and accurately and give short answers only
If the context is not sufficient, say "I don't have enough information."

Context:
${contextText}

Question: ${prompt}
Answer:
`;

  const result = await genai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: systemPrompt,
  });

  const answer =
    result.candidates?.[0]?.content?.parts?.[0]?.text ??
    "No answer generated.";

  return answer.trim();
}
