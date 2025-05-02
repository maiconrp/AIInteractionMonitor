import { db } from "./index";
import * as schema from "@shared/schema";
import { faker } from '@faker-js/faker';

async function seed() {
  try {
    console.log("Starting database seed...");

    // Generate external services
    const externalServices = [
      {
        name: "Evolution API",
        type: "messaging",
        status: "operational" as const,
        details: { endpoint: "https://api.evolution.com", version: "1.0.0" },
      },
      {
        name: "N8N Workflow",
        type: "automation",
        status: "degraded" as const,
        details: { endpoint: "https://n8n.example.com", version: "0.9.5" },
      }
    ];

    console.log("Seeding external services...");
    for (const service of externalServices) {
      // Check if service exists
      const existingService = await db.query.externalServices.findFirst({
        where: (s, { eq, and }) => and(
          eq(s.name, service.name),
          eq(s.type, service.type)
        )
      });
      
      if (!existingService) {
        await db.insert(schema.externalServices).values({
          ...service,
          lastChecked: new Date(),
        });
      } else {
        console.log(`Service ${service.name} already exists, skipping.`);
      }
    }

    // Generate test contacts
    const contactsData = [];
    for (let i = 0; i < 10; i++) {
      contactsData.push({
        name: faker.person.fullName(),
        identifier: faker.phone.number(),
        platform: 'WhatsApp',
        metadata: { 
          profilePicUrl: faker.image.avatar(),
          lastSeen: faker.date.recent().toISOString()
        },
      });
    }

    console.log("Seeding contacts...");
    for (const contact of contactsData) {
      // Check if contact exists
      const existingContact = await db.query.contacts.findFirst({
        where: (c, { eq }) => eq(c.identifier, contact.identifier)
      });
      
      if (!existingContact) {
        await db.insert(schema.contacts).values(contact);
      } else {
        console.log(`Contact with identifier ${contact.identifier} already exists, skipping.`);
      }
    }

    // Fetch contacts for conversations
    const contacts = await db.query.contacts.findMany();
    
    if (contacts.length === 0) {
      console.log("No contacts found, cannot create conversations.");
      return;
    }

    // Generate conversations
    const conversationsData = [];
    const statuses: Array<'active' | 'paused' | 'completed' | 'failed' | 'taken_over'> = ['active', 'paused', 'completed', 'failed', 'taken_over'];
    const models = ['GPT-4', 'GPT-3.5', 'Claude', 'GPT-4'];
    
    for (let i = 0; i < 20; i++) {
      const startDate = faker.date.recent({ days: 30 });
      const endDate = faker.date.between({ from: startDate, to: new Date() });
      
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const contact = contacts[Math.floor(Math.random() * contacts.length)];
      
      conversationsData.push({
        displayId: `C-${1000 + i}`,
        contactId: contact.id,
        status,
        model,
        tokenCount: faker.number.int({ min: 50, max: 2000 }),
        metadata: { source: 'seed', tags: faker.helpers.arrayElements(['support', 'sales', 'onboarding', 'feedback'], { min: 1, max: 2 }) },
        startedAt: startDate,
        lastMessageAt: status === 'active' ? new Date() : endDate,
        endedAt: status === 'completed' || status === 'failed' ? endDate : null,
      });
    }

    console.log("Seeding conversations...");
    for (const convo of conversationsData) {
      // Check if conversation exists
      const existingConversation = await db.query.conversations.findFirst({
        where: (c, { eq }) => eq(c.displayId, convo.displayId)
      });
      
      if (!existingConversation) {
        await db.insert(schema.conversations).values(convo);
      } else {
        console.log(`Conversation with ID ${convo.displayId} already exists, skipping.`);
      }
    }

    // Fetch conversations for messages
    const conversations = await db.query.conversations.findMany();
    
    if (conversations.length === 0) {
      console.log("No conversations found, cannot create messages.");
      return;
    }

    // Generate messages for each conversation
    console.log("Seeding messages...");
    for (const conversation of conversations) {
      const messageCount = faker.number.int({ min: 2, max: 15 });
      
      // Check if messages exist for this conversation
      const existingMessages = await db.query.messages.findFirst({
        where: (m, { eq }) => eq(m.conversationId, conversation.id)
      });
      
      if (existingMessages) {
        console.log(`Messages already exist for conversation ${conversation.displayId}, skipping.`);
        continue;
      }
      
      // Add user first message
      await db.insert(schema.messages).values({
        conversationId: conversation.id,
        sender: 'user',
        content: faker.lorem.sentence({ min: 3, max: 10 }),
        tokenCount: faker.number.int({ min: 5, max: 50 }),
        createdAt: conversation.startedAt,
      });
      
      // Add the rest of the messages
      for (let i = 1; i < messageCount; i++) {
        const isUser = i % 2 === 0;
        const date = new Date(conversation.startedAt.getTime() + (i * 1000 * 60 * 2)); // Add 2 minutes per message
        
        await db.insert(schema.messages).values({
          conversationId: conversation.id,
          sender: isUser ? 'user' : 'ai',
          content: faker.lorem.paragraph({ min: 1, max: 3 }),
          tokenCount: faker.number.int({ min: 20, max: 150 }),
          metadata: isUser ? {} : { model: conversation.model },
          createdAt: date,
        });
      }
      
      // Update lastMessageAt if not set
      if (!conversation.lastMessageAt) {
        await db.update(schema.conversations)
          .set({ lastMessageAt: new Date() })
          .where((c, { eq }) => eq(c.id, conversation.id));
      }
    }

    // Generate token usage data for the past 30 days
    console.log("Seeding token usage data...");
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Check if token usage exists for this date and model
      for (const model of models) {
        const existingUsage = await db.query.tokenUsage.findFirst({
          where: (t, { eq, and, sql }) => and(
            eq(t.model, model),
            sql`DATE(${t.date}) = DATE(${date})`
          )
        });
        
        if (!existingUsage) {
          await db.insert(schema.tokenUsage).values({
            model,
            inputTokens: faker.number.int({ min: 5000, max: 50000 }),
            outputTokens: faker.number.int({ min: 10000, max: 100000 }),
            date,
          });
        }
      }
    }

    // Generate metrics data
    console.log("Seeding metrics data...");
    const metricTypes = [
      { name: 'total_conversations', value: '8291' },
      { name: 'active_conversations', value: '43' },
      { name: 'avg_conversation_length', value: '8.5' },
      { name: 'token_usage_mtd', value: '1.24M' },
    ];

    for (const metric of metricTypes) {
      // Check if metric exists
      const existingMetric = await db.query.metrics.findFirst({
        where: (m, { eq }) => eq(m.name, metric.name)
      });
      
      if (!existingMetric) {
        await db.insert(schema.metrics).values({
          ...metric,
          date: new Date(),
        });
      } else {
        console.log(`Metric ${metric.name} already exists, skipping.`);
      }
    }

    console.log("Database seed completed successfully!");
  }
  catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
