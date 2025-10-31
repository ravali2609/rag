import { index, integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";


export const files = pgTable("files", {
  id: serial("id").notNull().primaryKey(),
  name: varchar("name").notNull(),
  size: integer("size").notNull(), // stored in bytes
  mime_type: varchar("mime_type").notNull(),
  type: varchar("type").notNull(),
  path: varchar("path").notNull(),
  uploaded_at: timestamp("uploaded_at").notNull().defaultNow(),
  tags: varchar("tags").array().default([]),
  context: varchar("context", { length: 255 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
  
}, table => [
  index("fileIdx").on(table.id),
  index("fileNameIdx").on(table.name),
  index("filePathIdx").on(table.path),
]);

export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type FileTable = typeof files;
