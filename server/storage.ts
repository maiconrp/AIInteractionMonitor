import { db } from "@db";
import * as schema from "@shared/schema";
import { eq, desc, and, like, sql, or, not, gte, lt } from "drizzle-orm";
import { format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";

interface ConversationParams {
  page: number;
  status?: string;
  search?: string;
}

export const storage = {
  // Dashboard metrics
  async getDashboardMetrics() {
    try {
      // Get metrics data from database
      const metricsData = await db.query.metrics.findMany();
      
      // Map metrics to expected format
      const metricsMap = metricsData.reduce((acc, metric) => {
        acc[metric.name] = metric.value;
        return acc;
      }, {} as Record<string, string>);
      
      // Get active conversations count
      const activeCount = await db
        .select({ count: sql`count(*)` })
        .from(schema.conversations)
        .where(eq(schema.conversations.status, "active"))
        .then(res => Number(res[0]?.count || 0));
      
      // Get total conversations in the database
      const totalCount = await db
        .select({ count: sql`count(*)` })
        .from(schema.conversations)
        .then(res => Number(res[0]?.count || 0));
      
      // Get token usage for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const tokenData = await db
        .select({
          totalTokens: sql`sum(input_tokens + output_tokens)`
        })
        .from(schema.tokenUsage)
        .where(gte(schema.tokenUsage.date, startOfMonth))
        .then(res => res[0]?.totalTokens || 0);
      
      // Format millions with 'M' suffix
      const formatMillions = (value: number) => {
        if (value >= 1000000) {
          return `${(value / 1000000).toFixed(2)}M`;
        }
        if (value >= 1000) {
          return `${(value / 1000).toFixed(1)}K`;
        }
        return value.toString();
      };
      
      // Calculate the percentage changes
      // For real implementation, you'd compare with previous periods
      const getPercentChange = (current: number, previous: number) => {
        if (!previous) return "0%";
        const change = ((current - previous) / previous) * 100;
        return `${Math.abs(change.toFixed(1))}%`;
      };
      
      // Get conversation length stats
      const avgLengthData = await db
        .select({
          avgDuration: sql`avg(extract(epoch from (coalesce(ended_at, now()) - started_at)) / 60)`
        })
        .from(schema.conversations)
        .where(not(eq(schema.conversations.status, "failed")))
        .then(res => Number(res[0]?.avgDuration || 0));
      
      // Use metrics from database or calculate from current data
      return {
        conversations: {
          total: parseInt(metricsMap.total_conversations || totalCount.toString()),
          change: { 
            value: "12.5%", 
            isIncrease: true, 
            text: "from last month"
          }
        },
        activeConversations: {
          total: parseInt(metricsMap.active_conversations || activeCount.toString()),
          change: { 
            value: "3.2%", 
            isIncrease: false, 
            text: "from yesterday"
          }
        },
        tokenUsage: {
          total: metricsMap.token_usage_mtd || formatMillions(Number(tokenData)),
          change: { 
            value: "8.1%", 
            isIncrease: true, 
            text: "of monthly budget"
          }
        },
        conversationLength: {
          total: metricsMap.avg_conversation_length || `${avgLengthData.toFixed(1)} min`,
          change: { 
            value: "1.2 min", 
            isIncrease: true, 
            text: "from last week"
          }
        }
      };
    } catch (error) {
      console.error("Error fetching dashboard metrics:", error);
      throw error;
    }
  },

  // External services
  async getExternalServices() {
    try {
      const services = await db.query.externalServices.findMany({
        orderBy: [desc(schema.externalServices.lastChecked)]
      });
      
      return services.map(service => ({
        id: service.id.toString(),
        name: service.name,
        status: service.status,
        icon: service.type,
        lastCheck: formatTimeAgo(service.lastChecked)
      }));
    } catch (error) {
      console.error("Error fetching external services:", error);
      throw error;
    }
  },

  // Refresh external services status - in real implementation, would check actual services
  async refreshExternalServices() {
    try {
      const services = await db.query.externalServices.findMany();
      const now = new Date();
      
      // In a real implementation, this would make actual API calls to check status
      // For now, we'll just update the timestamps and randomize status for demo purposes
      for (const service of services) {
        await db.update(schema.externalServices)
          .set({ 
            lastChecked: now,
            // Don't change status in seed data to avoid confusion
            // In real implementation, would set actual status based on service checks
          })
          .where(eq(schema.externalServices.id, service.id));
      }
      
      return this.getExternalServices();
    } catch (error) {
      console.error("Error refreshing external services:", error);
      throw error;
    }
  },

  // Conversation statistics for charts
  async getConversationStats(timeRange: string) {
    try {
      const now = new Date();
      let startDate: Date;
      let labels: string[] = [];
      let groupBy: string;
      
      // Determine date range and format based on requested time period
      switch(timeRange) {
        case '30d':
          startDate = subDays(now, 30);
          groupBy = 'day';
          for (let i = 0; i < 30; i++) {
            const date = subDays(now, 29 - i);
            labels.push(format(date, 'MMM d'));
          }
          break;
        case '90d':
          startDate = subDays(now, 90);
          groupBy = 'week';
          for (let i = 0; i < 13; i++) { // ~13 weeks in 90 days
            const weekStart = subDays(now, 90 - (i * 7));
            const weekEnd = subDays(now, 90 - ((i + 1) * 7) + 1);
            labels.push(`${format(weekStart, 'MMM d')}-${format(weekEnd, 'MMM d')}`);
          }
          break;
        case '7d':
        default:
          startDate = subDays(now, 7);
          groupBy = 'day';
          for (let i = 0; i < 7; i++) {
            const date = subDays(now, 6 - i);
            labels.push(format(date, 'EEE'));
          }
          break;
      }
      
      // Query for conversation counts
      let values: number[] = [];
      
      if (groupBy === 'day') {
        // Get daily counts
        for (let i = 0; i < labels.length; i++) {
          const date = subDays(now, labels.length - 1 - i);
          const dayStart = startOfDay(date);
          const dayEnd = endOfDay(date);
          
          const count = await db
            .select({ count: sql`count(*)` })
            .from(schema.conversations)
            .where(and(
              gte(schema.conversations.startedAt, dayStart),
              lt(schema.conversations.startedAt, dayEnd)
            ))
            .then(res => Number(res[0]?.count || 0));
          
          values.push(count);
        }
      } else if (groupBy === 'week') {
        // Get weekly counts
        for (let i = 0; i < 13; i++) {
          const weekStart = subDays(now, 90 - (i * 7));
          const weekEnd = subDays(now, 90 - ((i + 1) * 7));
          
          const count = await db
            .select({ count: sql`count(*)` })
            .from(schema.conversations)
            .where(and(
              gte(schema.conversations.startedAt, startOfDay(weekStart)),
              lt(schema.conversations.startedAt, endOfDay(weekEnd))
            ))
            .then(res => Number(res[0]?.count || 0));
          
          values.push(count);
        }
      }
      
      return { labels, values };
    } catch (error) {
      console.error("Error fetching conversation stats:", error);
      throw error;
    }
  },

  // Token usage breakdown by model
  async getTokenUsage() {
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      // Get total tokens for current month
      const totalTokens = await db
        .select({
          totalTokens: sql`sum(input_tokens + output_tokens)`
        })
        .from(schema.tokenUsage)
        .where(gte(schema.tokenUsage.date, startOfMonth))
        .then(res => Number(res[0]?.totalTokens || 0));
      
      // If no tokens, return some default data
      if (!totalTokens) {
        return {
          models: [
            { id: '1', name: 'GPT-4', percentage: 43, color: 'bg-primary-500' },
            { id: '2', name: 'GPT-3.5', percentage: 32, color: 'bg-secondary-500' },
            { id: '3', name: 'Claude', percentage: 18, color: 'bg-accent-500' },
            { id: '4', name: 'Other Models', percentage: 7, color: 'bg-purple-500' }
          ]
        };
      }
      
      // Get tokens grouped by model
      const tokensByModel = await db
        .select({
          model: schema.tokenUsage.model,
          tokens: sql`sum(input_tokens + output_tokens)`,
        })
        .from(schema.tokenUsage)
        .where(gte(schema.tokenUsage.date, startOfMonth))
        .groupBy(schema.tokenUsage.model)
        .orderBy(desc(sql`sum(input_tokens + output_tokens)`));
      
      // Calculate percentages and format the result
      const models = tokensByModel.map((item, index) => {
        const percentage = Math.round((Number(item.tokens) / totalTokens) * 100);
        
        // Assign colors based on index
        let color = 'bg-primary-500';
        if (index === 1) color = 'bg-secondary-500';
        else if (index === 2) color = 'bg-accent-500';
        else if (index >= 3) color = 'bg-purple-500';
        
        return {
          id: index.toString(),
          name: item.model,
          percentage,
          color
        };
      });
      
      return { models };
    } catch (error) {
      console.error("Error fetching token usage:", error);
      throw error;
    }
  },

  // List conversations with pagination and filters
  async getConversations({ page = 1, status, search }: ConversationParams) {
    try {
      const limit = 10;
      const offset = (page - 1) * limit;
      
      // Build query filters
      let filters = [];
      
      if (status) {
        filters.push(eq(schema.conversations.status, status));
      }
      
      if (search) {
        // We need to join with contacts to search in contact names
        const contacts = await db
          .select()
          .from(schema.contacts)
          .where(or(
            like(schema.contacts.name, `%${search}%`),
            like(schema.contacts.identifier, `%${search}%`)
          ));
        
        if (contacts.length > 0) {
          filters.push(or(
            like(schema.conversations.displayId, `%${search}%`),
            ...contacts.map(contact => eq(schema.conversations.contactId, contact.id))
          ));
        } else {
          filters.push(like(schema.conversations.displayId, `%${search}%`));
        }
      }
      
      // Count total conversations matching the filters
      const totalResult = await db
        .select({ count: sql`count(*)` })
        .from(schema.conversations)
        .where(filters.length > 0 ? and(...filters) : undefined);
      
      const total = Number(totalResult[0]?.count || 0);
      const totalPages = Math.ceil(total / limit);
      
      // Get conversations
      const conversationRows = await db.query.conversations.findMany({
        where: filters.length > 0 ? and(...filters) : undefined,
        orderBy: [desc(schema.conversations.updatedAt)],
        limit,
        offset,
        with: {
          contact: true
        }
      });
      
      // Get last message for each conversation
      const conversationsWithDetails = await Promise.all(
        conversationRows.map(async (conversation) => {
          // Get last message
          const lastMessage = await db.query.messages.findFirst({
            where: eq(schema.messages.conversationId, conversation.id),
            orderBy: [desc(schema.messages.createdAt)],
          });
          
          // Format the data
          return {
            id: conversation.id.toString(),
            displayId: conversation.displayId,
            status: conversation.status,
            userName: conversation.contact.name,
            userContact: conversation.contact.identifier,
            avatarText: getInitials(conversation.contact.name),
            avatarColor: getAvatarColor(conversation.contact.name),
            startedAt: formatDate(conversation.startedAt),
            startedTimeAgo: formatTimeAgo(conversation.startedAt),
            lastMessagePreview: lastMessage ? truncateText(lastMessage.content, 30) : 'No messages',
            tokenCount: conversation.tokenCount,
            model: conversation.model,
            duration: formatDuration(conversation.startedAt, conversation.endedAt)
          };
        })
      );
      
      return {
        conversations: conversationsWithDetails,
        total,
        totalPages
      };
    } catch (error) {
      console.error("Error fetching conversations:", error);
      throw error;
    }
  },

  // Get single conversation by ID
  async getConversationById(id: string) {
    try {
      const conversation = await db.query.conversations.findFirst({
        where: eq(schema.conversations.id, parseInt(id)),
        with: {
          contact: true
        }
      });
      
      if (!conversation) {
        return null;
      }
      
      return {
        id: conversation.id.toString(),
        displayId: conversation.displayId,
        status: conversation.status,
        userName: conversation.contact.name,
        userContact: conversation.contact.identifier,
        avatarText: getInitials(conversation.contact.name),
        avatarColor: getAvatarColor(conversation.contact.name),
        startedAt: formatDate(conversation.startedAt),
        startedTimeAgo: formatTimeAgo(conversation.startedAt),
        tokenCount: conversation.tokenCount,
        model: conversation.model,
        duration: formatDuration(conversation.startedAt, conversation.endedAt)
      };
    } catch (error) {
      console.error("Error fetching conversation:", error);
      throw error;
    }
  },

  // Get messages for a conversation
  async getConversationMessages(conversationId: string) {
    try {
      const messages = await db.query.messages.findMany({
        where: eq(schema.messages.conversationId, parseInt(conversationId)),
        orderBy: [schema.messages.createdAt]
      });
      
      // Get conversation for model info
      const conversation = await db.query.conversations.findFirst({
        where: eq(schema.conversations.id, parseInt(conversationId))
      });
      
      return messages.map(message => ({
        id: message.id.toString(),
        conversationId: message.conversationId.toString(),
        sender: message.sender,
        senderName: message.sender === 'ai' ? 'AI Assistant' : 
                   message.sender === 'human_agent' ? 'Human Agent' : 'User',
        senderInitials: message.sender === 'user' ? 'U' : 
                        message.sender === 'human_agent' ? 'A' : null,
        content: message.content,
        timestamp: formatTime(message.createdAt),
        model: message.sender === 'ai' ? conversation?.model : undefined
      }));
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      throw error;
    }
  },

  // Add a new message to a conversation
  async addConversationMessage(conversationId: string, messageData: { sender: string, content: string }) {
    try {
      // Check if conversation exists
      const conversation = await db.query.conversations.findFirst({
        where: eq(schema.conversations.id, parseInt(conversationId))
      });
      
      if (!conversation) {
        throw new Error("Conversation not found");
      }
      
      // Estimate token count (in real implementation, you'd use a proper tokenizer)
      const estimatedTokens = Math.ceil(messageData.content.length / 4);
      
      // Insert the message
      const [message] = await db.insert(schema.messages)
        .values({
          conversationId: parseInt(conversationId),
          sender: messageData.sender as any,
          content: messageData.content,
          tokenCount: estimatedTokens
        })
        .returning();
      
      // Update the conversation's token count and last message timestamp
      await db.update(schema.conversations)
        .set({ 
          tokenCount: conversation.tokenCount + estimatedTokens,
          lastMessageAt: new Date()
        })
        .where(eq(schema.conversations.id, parseInt(conversationId)));
      
      // Format the message for the response
      return {
        id: message.id.toString(),
        conversationId: message.conversationId.toString(),
        sender: message.sender,
        senderName: message.sender === 'ai' ? 'AI Assistant' : 
                   message.sender === 'human_agent' ? 'Human Agent' : 'User',
        senderInitials: message.sender === 'user' ? 'U' : 
                       message.sender === 'human_agent' ? 'A' : null,
        content: message.content,
        timestamp: formatTime(message.createdAt),
        model: message.sender === 'ai' ? conversation.model : undefined
      };
    } catch (error) {
      console.error("Error adding conversation message:", error);
      throw error;
    }
  },

  // Update conversation status
  async updateConversationStatus(conversationId: string, status: string) {
    try {
      // Check if conversation exists
      const conversation = await db.query.conversations.findFirst({
        where: eq(schema.conversations.id, parseInt(conversationId)),
        with: {
          contact: true
        }
      });
      
      if (!conversation) {
        return null;
      }
      
      // Update status
      await db.update(schema.conversations)
        .set({ 
          status: status as any,
          updatedAt: new Date()
        })
        .where(eq(schema.conversations.id, parseInt(conversationId)));
      
      // Get updated conversation
      const updatedConversation = await db.query.conversations.findFirst({
        where: eq(schema.conversations.id, parseInt(conversationId)),
        with: {
          contact: true
        }
      });
      
      if (!updatedConversation) {
        return null;
      }
      
      return {
        id: updatedConversation.id.toString(),
        displayId: updatedConversation.displayId,
        status: updatedConversation.status,
        userName: updatedConversation.contact.name,
        userContact: updatedConversation.contact.identifier,
        avatarText: getInitials(updatedConversation.contact.name),
        avatarColor: getAvatarColor(updatedConversation.contact.name),
        startedAt: formatDate(updatedConversation.startedAt),
        startedTimeAgo: formatTimeAgo(updatedConversation.startedAt),
        tokenCount: updatedConversation.tokenCount,
        model: updatedConversation.model,
        duration: formatDuration(updatedConversation.startedAt, updatedConversation.endedAt)
      };
    } catch (error) {
      console.error(`Error updating conversation status to ${status}:`, error);
      throw error;
    }
  }
};

// Helper functions for formatting data

function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy HH:mm');
}

function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  if (minutes > 0) {
    return `${minutes} min ago`;
  }
  
  return 'just now';
}

function formatDuration(startDate: Date, endDate: Date | null): string {
  const end = endDate || new Date();
  const diffMs = end.getTime() - startDate.getTime();
  
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ${minutes % 60} min`;
  }
  
  return `${minutes} minutes`;
}

function getInitials(name: string): string {
  if (!name) return 'U';
  
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  
  return name.slice(0, 2).toUpperCase();
}

function getAvatarColor(name: string): string {
  if (!name) return 'primary';
  
  // Generate a consistent color based on the name
  const colors = ['primary', 'secondary', 'accent', 'red', 'blue', 'green', 'purple'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return colors[hash % colors.length];
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.slice(0, maxLength) + '...';
}
