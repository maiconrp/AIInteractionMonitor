// File: server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage"; // Confirme que este arquivo exporta corretamente as funções
import { conversationStatusEnum, type Conversation } from "@shared/schema";
// A importação de ConversationWithContact de @shared/schema foi removida,
// pois este tipo é definido localmente em mockDatabase.ts e inferido.

// Clientes conectados via WebSocket
const clients = new Map<string, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    const clientId = Math.random().toString(36).substring(2, 15);
    clients.set(clientId, ws);
    console.log(`WebSocket client connected: ${clientId}`);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`Received message from ${clientId}:`, data);

        // Handle different message types with improved error handling
        switch (data.type) {
          case 'conversation_updated_by_client': // Renomeado para clareza
            // Broadcast para outros clientes que uma conversa foi atualizada (pelo remetente)
            broadcastMessage(clientId, {
              type: 'conversation_updated_on_server', // Notifica que o servidor processou
              conversationId: data.conversationId,
              details: data.payload // Exemplo de payload
            });
            break;
          // Add more cases for other message types as needed
          default:
            console.warn(`Unknown WebSocket message type from ${clientId}: ${data.type}`);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
      console.log(`WebSocket client disconnected: ${clientId}`);
    });
    ws.send(JSON.stringify({ type: 'connected', clientId }));
  });

  // Broadcast para todos os clientes, exceto o remetente
  function broadcastMessage(senderId: string, message: any) {
    const messageString = JSON.stringify(message);
    clients.forEach((client, id) => {
      if (id !== senderId && client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageString);
        } catch (e) {
          console.error(`Error broadcasting message to client (except sender) ${id}:`, e);
        }
      }
    });
  }

  // Broadcast para TODOS os clientes
  function broadcastToAll(message: any) {
    const messageString = JSON.stringify(message);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageString);
        } catch (e) {
          console.error("Error broadcasting message to all clients:", e);
        }
      }
    });
  }

  // --- ROTAS DA API ---

  app.get('/api/dashboard/metrics', async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
    }
  });

  app.get('/api/services/status', async (req, res) => {
    try {
      const services = await storage.getExternalServices();
      res.json(services);
    } catch (error) {
      console.error('Error fetching service status:', error);
      res.status(500).json({ message: 'Failed to fetch service status' });
    }
  });

  app.post('/api/services/refresh', async (req, res) => {
    try {
      const services = await storage.refreshExternalServices();
      res.json(services);
      broadcastToAll({ type: 'services_updated', services });
    } catch (error) {
      console.error('Error refreshing service status:', error);
      res.status(500).json({ message: 'Failed to refresh service status' });
    }
  });

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

  app.get('/api/tokens/usage', async (req, res) => {
    try {
      const tokenUsage = await storage.getTokenUsage();
      res.json(tokenUsage);
    } catch (error) {
      console.error('Error fetching token usage:', error);
      res.status(500).json({ message: 'Failed to fetch token usage' });
    }
  });

  app.get('/api/conversations', async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const status = req.query.status as string | undefined;
      const search = req.query.search as string | undefined;
      const pageSize = 10; // Você pode tornar isso um parâmetro de query também

      // `storage.getConversations` deve aceitar estas opções e retornar a estrutura esperada
      const result = await storage.getConversations({
        includeContact: true, // Opção para incluir detalhes do contato
        status,
        search,
        page,
        pageSize
      });
      
      res.json(result); // `result` já deve ter { conversations, total, totalPages, currentPage }

    } catch (error) {
      console.error('Error fetching conversations:', error);
      res.status(500).json({ message: 'Failed to fetch conversations' });
    }
  });

  app.get('/api/conversations/:id', async (req, res) => {
    try {
      // `storage.getConversationByIdWithContact` deve existir e retornar Promise<ConversationWithContact | undefined>
      const conversation = await storage.getConversationByIdWithContact(req.params.id);

      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      res.json(conversation);
    } catch (error) {
      console.error(`Error fetching conversation ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch conversation' });
    }
  });

  app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
      const messages = await storage.getConversationMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error(`Error fetching messages for conversation ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to fetch conversation messages' });
    }
  });

  app.post('/api/conversations/:id/messages', async (req, res) => {
    try {
      const { content, sender } = req.body as { content: string, sender: 'human_agent' | 'ai_agent' | 'contact' };
      if (!content) {
        return res.status(400).json({ message: 'Message content is required' });
      }
      if (!sender || !['human_agent', 'ai_agent', 'contact'].includes(sender)) {
        return res.status(400).json({ message: 'Valid sender (human_agent, contact, or ai_agent) is required' });
      }
      
      const message = await storage.addConversationMessage(req.params.id, { sender, content });
      // Notifica todos os clientes sobre a nova mensagem
      broadcastToAll({ type: 'new_message', conversationId: req.params.id, message });
      res.status(201).json(message);
    } catch (error) {
      console.error(`Error sending message for conversation ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  app.post('/api/conversations/:id/pause', async (req, res) => {
    try {
      // `storage.updateConversationStatus` deve retornar Promise<Conversation | undefined>
      const conversation = await storage.updateConversationStatus(
        req.params.id,
        conversationStatusEnum.enumValues[1] // 'paused' - assumindo que o índice 1 é 'paused'
                                            // Verifique seu `conversationStatusEnum.enumValues` para o valor correto
      );
      
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      res.json(conversation);
      // Notifica todos os clientes sobre a atualização do status da conversa
      broadcastToAll({ type: 'conversation_status_updated', conversationId: req.params.id, conversation });
    } catch (error) {
      console.error(`Error pausing conversation ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to pause conversation' });
    }
  });

  app.post('/api/conversations/:id/takeover', async (req, res) => {
    try {
      // `storage.updateConversationStatus` deve retornar Promise<Conversation | undefined>
      const conversation = await storage.updateConversationStatus(
        req.params.id,
        conversationStatusEnum.enumValues[4] // 'taken_over' - assumindo que o índice 4 é 'taken_over'
                                            // Verifique seu `conversationStatusEnum.enumValues`
      );
      
      if (!conversation) {
        return res.status(404).json({ message: 'Conversation not found' });
      }
      res.json(conversation);
      // Notifica todos os clientes sobre a atualização do status da conversa
      broadcastToAll({ type: 'conversation_status_updated', conversationId: req.params.id, conversation });
    } catch (error) {
      console.error(`Error taking over conversation ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to take over conversation' });
    }
  });

  return httpServer;
}