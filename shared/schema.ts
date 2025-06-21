import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  boolean,
  integer,
  decimal,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role").default("educator").notNull(), // educator, student, admin
  subscriptionTier: varchar("subscription_tier").default("free").notNull(), // free, pro, premium
  razorpayCustomerId: varchar("razorpay_customer_id"),
  razorpaySubscriptionId: varchar("razorpay_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Tutors created by educators
export const tutors = pgTable("tutors", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  subject: varchar("subject").notNull(),
  description: text("description"),
  creatorId: varchar("creator_id").notNull().references(() => users.id),
  isPublic: boolean("is_public").default(false),
  isActive: boolean("is_active").default(true),
  password: varchar("password"), // for password-protected access
  avatarStyle: varchar("avatar_style").default("default"),
  voiceSettings: jsonb("voice_settings"),
  branding: jsonb("branding"), // custom colors, logo, etc.
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Content uploaded to train tutors
export const tutorContent = pgTable("tutor_content", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => tutors.id),
  fileName: varchar("file_name").notNull(),
  fileType: varchar("file_type").notNull(), // pdf, docx, txt, youtube, etc.
  fileSize: integer("file_size"),
  content: text("content"), // processed text content
  metadata: jsonb("metadata"), // additional file info
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

// Chat sessions between students and tutors
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => tutors.id),
  studentId: varchar("student_id"), // null for anonymous users
  sessionToken: varchar("session_token").notNull().unique(), // for anonymous access
  startedAt: timestamp("started_at").defaultNow(),
  lastActiveAt: timestamp("last_active_at").defaultNow(),
  messageCount: integer("message_count").default(0),
  duration: integer("duration").default(0), // in seconds
});

// Individual chat messages
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => chatSessions.id),
  role: varchar("role").notNull(), // user, assistant
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  metadata: jsonb("metadata"), // voice settings, emotion, etc.
});

// Analytics for educators
export const tutorAnalytics = pgTable("tutor_analytics", {
  id: serial("id").primaryKey(),
  tutorId: integer("tutor_id").notNull().references(() => tutors.id),
  date: timestamp("date").notNull(),
  totalSessions: integer("total_sessions").default(0),
  totalMessages: integer("total_messages").default(0),
  avgSessionDuration: decimal("avg_session_duration").default("0"),
  uniqueStudents: integer("unique_students").default(0),
  popularQuestions: jsonb("popular_questions"),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tutors: many(tutors),
}));

export const tutorsRelations = relations(tutors, ({ one, many }) => ({
  creator: one(users, {
    fields: [tutors.creatorId],
    references: [users.id],
  }),
  content: many(tutorContent),
  sessions: many(chatSessions),
  analytics: many(tutorAnalytics),
}));

export const tutorContentRelations = relations(tutorContent, ({ one }) => ({
  tutor: one(tutors, {
    fields: [tutorContent.tutorId],
    references: [tutors.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  tutor: one(tutors, {
    fields: [chatSessions.tutorId],
    references: [tutors.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const tutorAnalyticsRelations = relations(tutorAnalytics, ({ one }) => ({
  tutor: one(tutors, {
    fields: [tutorAnalytics.tutorId],
    references: [tutors.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertTutorSchema = createInsertSchema(tutors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTutorContentSchema = createInsertSchema(tutorContent).omit({
  id: true,
  uploadedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  startedAt: true,
  lastActiveAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

// Types
export type UpsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTutor = z.infer<typeof insertTutorSchema>;
export type Tutor = typeof tutors.$inferSelect;
export type InsertTutorContent = z.infer<typeof insertTutorContentSchema>;
export type TutorContent = typeof tutorContent.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type TutorAnalytics = typeof tutorAnalytics.$inferSelect;
