import { ConversationMessage } from "@shared/schema";

export interface Conversation {  
  avatarColor: string;
  avatarText: string;
  userName: string;
  userContact: string;
  status: string;
  displayId: string;
  model: string;
  startedAt: string;
  duration: string;
  tokenCount: number;
}

export type ConversationMessages = ConversationMessage[];