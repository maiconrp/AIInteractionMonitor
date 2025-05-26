// File: server/storage.ts

// Import ALL necessary functions and types from mockDatabase.ts
import {
  getDashboardMetrics,
  getExternalServices,
  refreshExternalServices,
  getConversationStats,
  getTokenUsage,
  getConversations,
  getConversationById,
  getConversationByIdWithContact,
  getConversationMessages,
  addConversationMessage,
  updateConversationStatus,
  getContactById,
  // Types that might be needed by consumers of `storage` IF they do specific typing,
  // otherwise, the function return types are usually inferred correctly.
  type GetConversationsOptions,
  type GetConversationsResult,
  type ConversationWithContact,
  type MockMessage,
  type Conversation,
  type ServiceStatus,
  type DashboardMetrics,
  type TokenUsage,
  type MockContact
} from './mockDatabase';

// Define the storage object by directly assigning the imported functions
export const storage = {
  getDashboardMetrics,
  getExternalServices,
  refreshExternalServices,
  getConversationStats,
  getTokenUsage,
  getConversations,
  getConversationById,
  getConversationByIdWithContact,
  getConversationMessages,
  addConversationMessage,
  updateConversationStatus,
  getContactById,
};

// For clarity, you can also re-export the types if other modules importing `storage` need them.
// This is optional if routes.ts relies purely on inference from the function calls.
export type {
    GetConversationsOptions,
    GetConversationsResult,
    ConversationWithContact,
    MockMessage,
    Conversation,
    ServiceStatus,
    DashboardMetrics,
    TokenUsage,
    MockContact
};