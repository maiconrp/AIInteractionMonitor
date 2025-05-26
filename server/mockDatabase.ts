// File: server/mockDatabase.ts
import { conversationStatusEnum, type Conversation as SchemaConversation } from "@shared/schema";

// --- Local Types that should be EXPORTED if storage.ts needs them ---
export interface ServiceStatus {
  name: string;
  status: "operational" | "degraded" | "outage" | string;
  lastCheck: Date;
}

export interface DashboardMetrics {
  openConversations: number;
  pausedConversations: number;
  closedConversations: number;
  averageResponseTime: string;
  totalMessages: number;
}

export interface TokenUsageServiceBreakdown {
  service: string;
  tokensUsed: number;
}

export interface TokenUsage {
  total: number;
  used: number;
  limit: number;
  breakdown: TokenUsageServiceBreakdown[];
}

export type Conversation = SchemaConversation; // Use the imported type directly

export interface MockContact {
  id: number;
  name: string;
  email: string;
}

export interface MockMessage {
  id: string;
  conversationId: number;
  sender: 'human_agent' | 'ai_agent' | 'contact';
  content: string;
  createdAt: Date; // This was missing in one of your error messages for MockMessage
}

export interface ConversationWithContact extends Conversation {
  contact?: MockContact;
}

// --- Options and Result types for getConversations (EXPORTED) ---
export interface GetConversationsOptions {
  includeContact?: boolean;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface GetConversationsResult {
  conversations: Array<Conversation | ConversationWithContact>;
  total: number;
  totalPages: number;
  currentPage: number;
}

// --- Mock Data (Variables - not exported directly, accessed via functions) ---
let mockContacts: MockContact[] = [
  { id: 101, name: "Alice", email: "alice@example.com" },
  { id: 102, name: "Bob", email: "bob@example.com" },
  { id: 103, name: "Charlie", email: "charlie@example.com" },
];

let mockConversations: Conversation[] = [
  {
    id: 1, displayId: "CONV-001", contactId: 101, status: "active",
    lastMessageAt: new Date(), createdAt: new Date(Date.now() - 5 * 60 * 1000),
    updatedAt: new Date(), startedAt: new Date(Date.now() - 5 * 60 * 1000),
    endedAt: null, model: "gpt-4", tokenCount: 150, metadata: { source: "widget" },
  },
  {
    id: 2, displayId: "CONV-002", contactId: 102, status: "paused",
    lastMessageAt: new Date(Date.now() - 60000), createdAt: new Date(Date.now() - 120000),
    updatedAt: new Date(Date.now() - 30000), startedAt: new Date(Date.now() - 120000),
    endedAt: null, model: "gpt-3.5-turbo", tokenCount: 75, metadata: {},
  },
  {
    id: 3, displayId: "CONV-003", contactId: 103, status: "completed",
    lastMessageAt: new Date(Date.now() - 3600000), createdAt: new Date(Date.now() - 7200000),
    updatedAt: new Date(Date.now() - 1800000), startedAt: new Date(Date.now() - 7200000),
    endedAt: new Date(Date.now() - 1800000), model: "gpt-3.5-turbo", tokenCount: 220, metadata: { reason: "resolved" },
  },
];

let mockMessages: MockMessage[] = [
  { id: "msg1", conversationId: 1, sender: "contact", content: "Hi, I have a question.", createdAt: new Date(Date.now() - 1000) },
  { id: "msg2", conversationId: 1, sender: "ai_agent", content: "Hello! How can I help?", createdAt: new Date() },
  { id: "msg3", conversationId: 2, sender: "contact", content: "This is a test.", createdAt: new Date(Date.now() - 70000) },
];

let mockDashboardMetrics: DashboardMetrics = {
  openConversations: mockConversations.filter(c => c.status === "active").length,
  pausedConversations: mockConversations.filter(c => c.status === "paused").length,
  closedConversations: mockConversations.filter(c => c.status === "completed").length,
  averageResponseTime: "2m",
  totalMessages: mockMessages.length,
};

let mockExternalServices: ServiceStatus[] = [
  { name: "AI Service", status: "operational", lastCheck: new Date() },
  { name: "CRM Integration", status: "degraded", lastCheck: new Date() },
];

let mockTokenUsage: TokenUsage = {
  total: 10000, used: 5000, limit: 100000,
  breakdown: [
    { service: "GPT-4", tokensUsed: 3000 },
    { service: "Natural Language Understanding", tokensUsed: 2000 },
  ]
};

// --- EXPORTED Function Implementations ---
export const getDashboardMetrics = async (): Promise<DashboardMetrics> => {
  mockDashboardMetrics.openConversations = mockConversations.filter((c: Conversation) => c.status === "active").length;
  mockDashboardMetrics.pausedConversations = mockConversations.filter((c: Conversation) => c.status === "paused").length;
  mockDashboardMetrics.closedConversations = mockConversations.filter((c: Conversation) => c.status === "completed").length;
  mockDashboardMetrics.totalMessages = mockMessages.length;
  return Promise.resolve(mockDashboardMetrics);
};

export const getExternalServices = async (): Promise<ServiceStatus[]> => {
  return Promise.resolve(mockExternalServices);
};

export const refreshExternalServices = async (): Promise<ServiceStatus[]> => {
  mockExternalServices = mockExternalServices.map((service: ServiceStatus) => ({
    ...service,
    lastCheck: new Date(),
    status: service.name === "CRM Integration" && Math.random() > 0.5 ? "operational" : service.status
  }));
  return Promise.resolve(mockExternalServices);
};

export const getConversationStats = async (timeRange: string): Promise<any> => {
  const now = Date.now();
  let filteredConversations: Conversation[] = [];
  const conversationsWithDate = mockConversations.map((c: Conversation) => ({ ...c, createdAt: typeof c.createdAt === 'string' ? new Date(c.createdAt) : c.createdAt as Date }));
  if (timeRange === '7d') filteredConversations = conversationsWithDate.filter((c: Conversation) => (c.createdAt as Date).getTime() > now - 7 * 24 * 60 * 60 * 1000);
  else if (timeRange === '24h') filteredConversations = conversationsWithDate.filter((c: Conversation) => (c.createdAt as Date).getTime() > now - 24 * 60 * 60 * 1000);
  else filteredConversations = conversationsWithDate;
  return Promise.resolve({
    dailyConversations: Array(7).fill(0),
    statusDistribution: {
      open: filteredConversations.filter((c: Conversation) => c.status === "active").length,
      paused: filteredConversations.filter((c: Conversation) => c.status === "paused").length,
      closed: filteredConversations.filter((c: Conversation) => c.status === "completed").length,
    }
  });
};

export const getTokenUsage = async (): Promise<TokenUsage> => {
  return Promise.resolve(mockTokenUsage);
};

export const getConversations = async (options?: GetConversationsOptions): Promise<GetConversationsResult> => {
  let filtered: Conversation[] = [...mockConversations];
  const { includeContact, status, search, page = 1, pageSize = 10 } = options || {};

  if (status && status !== 'all') {
    filtered = filtered.filter((c: Conversation) => c.status === status);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter((conv: Conversation) => {
      const contact = includeContact ? mockContacts.find((c: MockContact) => c.id === conv.contactId) : undefined;
      return (
        conv.displayId?.toLowerCase().includes(searchLower) ||
        (contact && contact.name.toLowerCase().includes(searchLower))
      );
    });
  }

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const paginatedConversations: Conversation[] = filtered.slice((page - 1) * pageSize, page * pageSize);

  let resultConversations: Array<Conversation | ConversationWithContact> = paginatedConversations;
  if (includeContact) {
    resultConversations = paginatedConversations.map((conv: Conversation) => {
      const contactDetails = mockContacts.find((c: MockContact) => c.id === conv.contactId);
      return { ...conv, contact: contactDetails };
    });
  }
  return Promise.resolve({ conversations: resultConversations, total, totalPages, currentPage: page });
};

export const getConversationById = async (id: string): Promise<Conversation | undefined> => {
  const numericId = Number(id);
  return Promise.resolve(mockConversations.find((conv: Conversation) => conv.id === numericId));
};

export const getConversationByIdWithContact = async (id: string): Promise<ConversationWithContact | undefined> => {
  const numericId = Number(id);
  const conversation = mockConversations.find((conv: Conversation) => conv.id === numericId);
  if (conversation) {
    const contact = mockContacts.find((c: MockContact) => c.id === conversation.contactId);
    return Promise.resolve({ ...conversation, contact });
  }
  return Promise.resolve(undefined);
};

export const getConversationMessages = async (conversationId: string): Promise<MockMessage[]> => {
  const numericConversationId = Number(conversationId);
  return Promise.resolve(mockMessages.filter((msg: MockMessage) => msg.conversationId === numericConversationId));
};

export const addConversationMessage = async (conversationId: string, message: { sender: 'human_agent' | 'ai_agent' | 'contact', content: string }): Promise<MockMessage> => {
  const numericConversationId = Number(conversationId);
  const newMessage: MockMessage = { id: `msg${mockMessages.length + 1}`, conversationId: numericConversationId, sender: message.sender, content: message.content, createdAt: new Date() };
  mockMessages.push(newMessage);
  const conversationIndex = mockConversations.findIndex((conv: Conversation) => conv.id === numericConversationId);
  if (conversationIndex !== -1) {
    mockConversations[conversationIndex].lastMessageAt = newMessage.createdAt;
    mockConversations[conversationIndex].updatedAt = new Date();
    if (message.sender === 'ai_agent' && mockConversations[conversationIndex].tokenCount !== null) {
      (mockConversations[conversationIndex].tokenCount as number) += message.content.length / 4;
    }
  }
  return Promise.resolve(newMessage);
};

export const updateConversationStatus = async (id: string, status: Conversation['status']): Promise<Conversation | undefined> => {
  const numericId = Number(id);
  const conversationIndex = mockConversations.findIndex((conv: Conversation) => conv.id === numericId);
  if (conversationIndex !== -1) {
    mockConversations[conversationIndex].status = status;
    mockConversations[conversationIndex].updatedAt = new Date();
    if (status === "completed" || status === "failed") {
      mockConversations[conversationIndex].endedAt = new Date();
    } else {
      if (mockConversations[conversationIndex].endedAt !== null && (status === "active" || status === "paused" || status === "taken_over")){
         mockConversations[conversationIndex].endedAt = null;
      }
    }
    return Promise.resolve(mockConversations[conversationIndex]);
  }
  return Promise.resolve(undefined);
};

export const getContactById = async (id: number): Promise<MockContact | undefined> => {
  return Promise.resolve(mockContacts.find((contact: MockContact) => contact.id === id));
};