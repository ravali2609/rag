import { pgTable, serial, integer, text, vector, timestamp } from "drizzle-orm/pg-core";
import { documents } from "./document.js";


export const chunks = pgTable("chunks", ({
  id: serial("id").primaryKey(),
  document_id:integer("document_id").notNull().references(() => documents.id),
  chunk: text("chunk").notNull(),
  embedding: vector('embedding', { dimensions: 768 }),
  created_at: timestamp("created_at").defaultNow(),
}));
