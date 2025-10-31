import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
export const documents = pgTable("documents", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    created_at: timestamp("created_at").defaultNow(),
});
