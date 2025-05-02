import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enum for conversation status
export const conversationStatusEnum = pgEnum('conversation_status', [
  'active', 'paused', 'completed', 'failed', 'taken_over'
]);

// Enum for message sender
export const messageSenderEnum = pgEnum('message_sender', [
  'user', 'ai', 'human_agent'
]);

// Enum for external service status
export const serviceStatusEnum = pgEnum('service_status', [
  'operational', 'degraded', 'down'
]);

// External Services
export const externalServices = pgTable('external_services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  status: serviceStatusEnum('status').notNull().default('operational'),
  lastChecked: timestamp('last_checked').defaultNow(),
  details: json('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  role: text("role").default('agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Contacts table
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  identifier: text('identifier').notNull().unique(), // Phone number or other identifier
  platform: text('platform').notNull(), // WhatsApp, Telegram, etc.
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Conversations table
export const conversations = pgTable('conversations', {
  id: serial('id').primaryKey(),
  displayId: text('display_id').notNull().unique(), // Human-readable ID (e.g., C-1234)
  contactId: integer('contact_id').references(() => contacts.id).notNull(),
  status: conversationStatusEnum('status').notNull().default('active'),
  model: text('model'), // GPT-4, GPT-3.5, etc.
  tokenCount: integer('token_count').default(0),
  metadata: json('metadata'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at'),
  endedAt: timestamp('ended_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  conversationId: integer('conversation_id').references(() => conversations.id).notNull(),
  sender: messageSenderEnum('sender').notNull(),
  content: text('content').notNull(),
  tokenCount: integer('token_count').default(0),
  metadata: json('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Token usage table
export const tokenUsage = pgTable('token_usage', {
  id: serial('id').primaryKey(),
  model: text('model').notNull(), // GPT-4, GPT-3.5, etc.
  inputTokens: integer('input_tokens').default(0),
  outputTokens: integer('output_tokens').default(0),
  date: timestamp('date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Metrics table
export const metrics = pgTable('metrics', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  value: text('value').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define relationships
export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  contact: one(contacts, {
    fields: [conversations.contactId],
    references: [contacts.id]
  }),
  messages: many(messages)
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  })
}));

// Schemas for validation
export const userInsertSchema = createInsertSchema(users);
export type UserInsert = z.infer<typeof userInsertSchema>;
export type User = typeof users.$inferSelect;

export const contactInsertSchema = createInsertSchema(contacts);
export type ContactInsert = z.infer<typeof contactInsertSchema>;
export type Contact = typeof contacts.$inferSelect;

export const conversationInsertSchema = createInsertSchema(conversations);
export type ConversationInsert = z.infer<typeof conversationInsertSchema>;
export type Conversation = typeof conversations.$inferSelect & {
  userName?: string;
  userContact?: string;
  avatarText?: string;
  avatarColor?: string;
  startedTimeAgo?: string;
  lastMessagePreview?: string;
  duration?: string;
};

export const messageInsertSchema = createInsertSchema(messages);
export type MessageInsert = z.infer<typeof messageInsertSchema>;
export type Message = typeof messages.$inferSelect;

export type ConversationMessage = Message & {
  senderName?: string;
  senderInitials?: string;
  timestamp?: string;
  model?: string;
};

export const externalServiceInsertSchema = createInsertSchema(externalServices);
export type ExternalServiceInsert = z.infer<typeof externalServiceInsertSchema>;
export type ExternalService = typeof externalServices.$inferSelect;

export const tokenUsageInsertSchema = createInsertSchema(tokenUsage);
export type TokenUsageInsert = z.infer<typeof tokenUsageInsertSchema>;
export type TokenUsage = typeof tokenUsage.$inferSelect;

export const metricInsertSchema = createInsertSchema(metrics);
export type MetricInsert = z.infer<typeof metricInsertSchema>;
export type Metric = typeof metrics.$inferSelect;
