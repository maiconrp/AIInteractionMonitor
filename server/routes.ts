import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { conversationStatusEnum } from "@shared/schema";
import { eq, desc, and, like, sql } from "drizzle-orm";

// Clients connected via WebSocket
const clients = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(clientId, ws);
    
    console.log(`WebSocket client connected: ${clientId}`);
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from ${clientId}:`, data);
        
        // Handle various message types
        if (data.type === 'conversation_updated') {
          // Broadcast to all other clients
          broadcastMessage(clientId, {
            type: 'conversation_updated',
            conversationId: data.conversationId,
            action: data.action
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
    
    // Send initial connection confirmation
    ws.send(JSON.stringify({ type: 'connected', clientId }));
  });

  // Broadcast a message to all connected clients except the sender
  function broadcastMessage(senderId: string, message: any) {
    clients.forEach((client, id) => {
      if (id !== senderId && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // API ROUTES

  // Dashboard metrics
  app.get('/api/dashboard/metrics', async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
    }
  });

  // External services status
  app.get('/api/services/status', async (req, res) => {
    try {
      const services = await storage.getExternalServices();
      res.json(services);
    } catch (error) {
      console.error('Error fetching service status:', error);
      res.status(500).json({ message: 'Failed to fetch service status' });
    }
  });

  // Refresh service status
  app.post('/api/services/refresh', async (req, res) => {
    try {
      const services = await storage.refreshExternalServices();
      res.json(services);
      
      // Broadcast service status update to all clients
      const message = { type: 'services_updated', services };
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      });
    } catch (error) {
      console.error('Error refreshing service status:', error);
      res.status(500).json({ message: 'Failed to refresh service status' });
    }
  });

  // Conversation stats (for chart)
  app.get('/api/conversations/stats', async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || '7d';
      const stats = await storage.getConversationStats(timeRange);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching conversation stats:', error);
      res.status(500).json({ message: 'Failed to fetch conversation stats' });
    }
  });

  // Token usage
  app.get('/api/tokens/usage', async (req, res) => {
    try {
      const tokenUsage = await storage.getTokenUsage();
      res.json(tokenUsage);
    } catch (error) {
      console.error('Error fetching token usage:', error);
      res.status(500).json({ message: 'Failed to fetch token usage' });
    }
  });

  // List conversations with pagination
  app.get('/api/conversations', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const status = req.query.status as string;
      const search = req.query.search as string;
      
      const { conversations, total, totalPages } = await storage.getConversations({
        page,
        status: status !== 'all' ? status : undefined,
        search: search || undefined
      });
      
      res.json({ conversations, total, totalPages });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  });

  // Get single conversation
  app.get('/api/conversations/:id', async (req, res) => {
    try {
      const conversation = await storage.getConversationById(req.params.id);
      
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      res.json(conversation);
    } catch (error) {
      console.error('Error fetching conversation:', error);
      res.status(500).json({ message: 'Failed to fetch conversation' });
    }
  });

  // Get conversation messages
  app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching conversation messages:', error);
      res.status(500).json({ message: 'Failed to fetch conversation messages' });
    }
  });

  // Send message to conversation
  app.post('/api/conversations/:id/messages', async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: 'Message content is required' });
      }
      
      const message = await storage.addConversationMessage(req.params.id, {
        sender: 'human_agent',
        content
      });
      
      // Broadcast message to all clients
      const broadcastMsg = { 
        type: 'new_message', 
        conversationId: req.params.id,
        message
      };
      
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(broadcastMsg));
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Pause conversation AI
  app.post('/api/conversations/:id/pause', async (req, res) => {
    try {
      const conversation = await storage.updateConversationStatus(
        req.params.id, 
        'paused'
      );
      
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      res.json(conversation);
      
      // Broadcast status change to all clients
      const broadcastMsg = { 
        type: 'conversation_updated', 
        conversationId: req.params.id,
        status: 'paused'
      };
      
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(broadcastMsg));
        }
      });
    } catch (error) {
      console.error('Error pausing conversation:', error);
      res.status(500).json({ message: 'Failed to pause conversation' });
    }
  });

  // Take over conversation
  app.post('/api/conversations/:id/takeover', async (req, res) => {
    try {
      const conversation = await storage.updateConversationStatus(
        req.params.id, 
        'taken_over'
      );
      
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      
      res.json(conversation);
      
      // Broadcast status change to all clients
      const broadcastMsg = { 
        type: 'conversation_updated', 
        conversationId: req.params.id,
        status: 'taken_over'
      };
      
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(broadcastMsg));
        }
      });
    } catch (error) {
      console.error('Error taking over conversation:', error);
      res.status(500).json({ message: 'Failed to take over conversation' });
    }
  });

  return httpServer;
}
