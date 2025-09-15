import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  preferences: jsonb("preferences").default({}),
  goals: jsonb("goals").default({}),
  progress: jsonb("progress").default({}),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookChapters = pgTable("book_chapters", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  chapterNumber: integer("chapter_number").notNull(),
  narrative: text("narrative").notNull(),
  commentary: text("commentary"),
  figures: jsonb("figures").default([]),
  tags: jsonb("tags").default([]),
  timeSpan: text("time_span"),
  era: text("era"),
});

export const historyEvents = pgTable("history_events", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  year: integer("year").notNull(),
  era: text("era").notNull(),
  tags: jsonb("tags").default([]),
  description: text("description").notNull(),
  region: text("region"),
});

export const historyTopics = pgTable("history_topics", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  overview: text("overview").notNull(),
  timeSpan: text("time_span"),
  keyEvents: jsonb("key_events").default([]),
  tags: jsonb("tags").default([]),
});

export const practices = pgTable("practices", {
  id: varchar("id").primaryKey(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(),
  instructions: text("instructions").notNull(),
  origin: text("origin"),
  tags: jsonb("tags").default([]),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  chapterId: varchar("chapter_id").references(() => bookChapters.id),
  messages: jsonb("messages").default([]),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  chapterId: varchar("chapter_id"), // Remove foreign key constraint to allow synthetic IDs for practices
  completed: boolean("completed").default(false),
  progressPercent: integer("progress_percent").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const practiceSessions = pgTable("practice_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  practiceId: varchar("practice_id").references(() => practices.id),
  duration: integer("duration").notNull(), // seconds actually practiced
  completed: boolean("completed").default(false),
  practiceType: text("practice_type").notNull(),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas - Allow id to be provided for server-side creation with Firebase UID
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
}).extend({
  id: z.string().optional(), // Make id optional so it can be provided
});

export const insertBookChapterSchema = createInsertSchema(bookChapters);

export const insertHistoryEventSchema = createInsertSchema(historyEvents);

export const insertHistoryTopicSchema = createInsertSchema(historyTopics);

export const insertPracticeSchema = createInsertSchema(practices);

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  timestamp: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  timestamp: true,
});

export const insertPracticeSessionSchema = createInsertSchema(practiceSessions).omit({
  id: true,
  timestamp: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type BookChapter = typeof bookChapters.$inferSelect;
export type InsertBookChapter = z.infer<typeof insertBookChapterSchema>;

export type HistoryEvent = typeof historyEvents.$inferSelect;
export type InsertHistoryEvent = z.infer<typeof insertHistoryEventSchema>;

export type HistoryTopic = typeof historyTopics.$inferSelect;
export type InsertHistoryTopic = z.infer<typeof insertHistoryTopicSchema>;

export type Practice = typeof practices.$inferSelect;
export type InsertPractice = z.infer<typeof insertPracticeSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type PracticeSession = typeof practiceSessions.$inferSelect;
export type InsertPracticeSession = z.infer<typeof insertPracticeSessionSchema>;
