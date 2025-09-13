import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertChatSessionSchema, insertUserProgressSchema } from "@shared/schema";
import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "default_key"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.patch("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.updateUser(req.params.id, req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Book routes
  app.get("/api/chapters", async (req, res) => {
    try {
      const chapters = await storage.getAllChapters();
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chapters" });
    }
  });

  app.get("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.getChapter(req.params.id);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chapter" });
    }
  });

  // History routes
  app.get("/api/history/events", async (req, res) => {
    try {
      const { era, year, tags } = req.query;
      const filters: any = {};
      
      if (era) filters.era = era as string;
      if (year) filters.year = parseInt(year as string);
      if (tags) filters.tags = (tags as string).split(',');
      
      const events = await storage.getHistoryEvents(filters);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to get history events" });
    }
  });

  app.get("/api/history/topics", async (req, res) => {
    try {
      const topics = await storage.getHistoryTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ message: "Failed to get history topics" });
    }
  });

  // Practice routes
  app.get("/api/practices", async (req, res) => {
    try {
      const { type } = req.query;
      const practices = await storage.getPractices(type as string);
      res.json(practices);
    } catch (error) {
      res.status(500).json({ message: "Failed to get practices" });
    }
  });

  // Chat and AI routes
  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const sessionData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  app.get("/api/chat/sessions/:userId", async (req, res) => {
    try {
      const sessions = await storage.getChatSessionsByUser(req.params.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat sessions" });
    }
  });

  app.post("/api/ai/query", async (req, res) => {
    try {
      const { query, chapterId, sessionId } = req.body;
      
      if (!query) {
        return res.status(400).json({ message: "Query is required" });
      }

      // Multi-agent system orchestration
      const response = await processAIQuery(query, chapterId);
      
      // Update chat session if provided
      if (sessionId) {
        const session = await storage.getChatSession(sessionId);
        if (session) {
          const messages = [...(session.messages as any[]), 
            { role: "user", content: query, timestamp: new Date() },
            { role: "ai", content: response.content, agents: response.agents, timestamp: new Date() }
          ];
          await storage.updateChatSession(sessionId, messages);
        }
      }

      res.json(response);
    } catch (error) {
      console.error('AI query error:', error);
      res.status(500).json({ message: "Failed to process AI query" });
    }
  });

  // Progress tracking routes
  app.get("/api/progress/:userId", async (req, res) => {
    try {
      const progress = await storage.getUserProgress(req.params.userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to get user progress" });
    }
  });

  app.post("/api/progress", async (req, res) => {
    try {
      const progressData = insertUserProgressSchema.parse(req.body);
      const progress = await storage.createOrUpdateProgress(progressData);
      res.json(progress);
    } catch (error) {
      res.status(400).json({ message: "Invalid progress data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Multi-agent AI system
async function processAIQuery(query: string, chapterId?: string) {
  try {
    // Step 1: Orchestrator determines which agents to involve
    const orchestratorPrompt = `
As the Orchestrator agent in a multi-agent conversational AI system for "The Eternal Falcon" book, analyze this query and determine which agents should respond:

Query: "${query}"
Chapter Context: ${chapterId || "General"}

Available agents:
1. Fact-Checker: Verifies historical claims against curated database
2. Reasoner: Breaks down complex queries step by step  
3. Narrator: Generates responses in semi-academic mythic storytelling style

Respond with JSON in this format:
{
  "agents_needed": ["fact-checker", "reasoner", "narrator"],
  "query_type": "historical_verification|concept_explanation|narrative_context",
  "priority_agent": "fact-checker|reasoner|narrator"
}
`;

    const orchestratorResponse = await genai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            agents_needed: { type: "array", items: { type: "string" } },
            query_type: { type: "string" },
            priority_agent: { type: "string" }
          },
          required: ["agents_needed", "query_type", "priority_agent"]
        },
      },
      contents: orchestratorPrompt,
    });

    const orchestratorData = JSON.parse(orchestratorResponse.text || "{}");
    
    // Step 2: Get relevant context data
    let contextData = "";
    if (chapterId) {
      const chapter = await storage.getChapter(chapterId);
      if (chapter) {
        contextData = `Chapter: ${chapter.title}\nContent: ${chapter.narrative.slice(0, 500)}...`;
      }
    }

    // Get relevant history events
    const historyEvents = await storage.getHistoryEvents();
    const relevantEvents = historyEvents.slice(0, 3);
    const historyContext = relevantEvents.map(event => 
      `${event.title} (${event.year}): ${event.description}`
    ).join('\n');

    // Step 3: Run the required agents
    const agentResults: any = {};

    if (orchestratorData.agents_needed?.includes("fact-checker")) {
      const factCheckPrompt = `
As the Fact-Checker agent, verify the historical accuracy of this query against known historical data:

Query: "${query}"
Context: ${contextData}
Historical Database: ${historyContext}

Respond with JSON:
{
  "verified_facts": ["fact1", "fact2"],
  "corrections": ["correction1", "correction2"],
  "confidence_level": "high|medium|low",
  "sources": ["source1", "source2"]
}
`;

      const factCheckResponse = await genai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              verified_facts: { type: "array", items: { type: "string" } },
              corrections: { type: "array", items: { type: "string" } },
              confidence_level: { type: "string" },
              sources: { type: "array", items: { type: "string" } }
            },
            required: ["verified_facts", "corrections", "confidence_level", "sources"]
          },
        },
        contents: factCheckPrompt,
      });

      agentResults.factChecker = JSON.parse(factCheckResponse.text || "{}");
    }

    if (orchestratorData.agents_needed?.includes("reasoner")) {
      const reasonerPrompt = `
As the Reasoner agent, break down this complex query step by step using Chain-of-Thought reasoning:

Query: "${query}"
Context: ${contextData}

Respond with JSON:
{
  "reasoning_steps": ["step1", "step2", "step3"],
  "key_concepts": ["concept1", "concept2"],
  "connections": ["connection1", "connection2"],
  "implications": ["implication1", "implication2"]
}
`;

      const reasonerResponse = await genai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              reasoning_steps: { type: "array", items: { type: "string" } },
              key_concepts: { type: "array", items: { type: "string" } },
              connections: { type: "array", items: { type: "string" } },
              implications: { type: "array", items: { type: "string" } }
            },
            required: ["reasoning_steps", "key_concepts", "connections", "implications"]
          },
        },
        contents: reasonerPrompt,
      });

      agentResults.reasoner = JSON.parse(reasonerResponse.text || "{}");
    }

    if (orchestratorData.agents_needed?.includes("narrator")) {
      const narratorPrompt = `
As the Narrator agent, generate a response in the semi-academic mythic storytelling style of "The Eternal Falcon":

Query: "${query}"
Context: ${contextData}
Fact-Check Results: ${JSON.stringify(agentResults.factChecker || {})}
Reasoning Results: ${JSON.stringify(agentResults.reasoner || {})}

Style guidelines:
- Semi-academic: blend storytelling with historical accuracy
- Root answers in Nile Valley contributions + wider historical context
- Mythic tone but factually grounded
- Bridge ancient wisdom with modern understanding

Respond with JSON:
{
  "narrative_response": "detailed response text",
  "key_themes": ["theme1", "theme2"],
  "historical_connections": ["connection1", "connection2"],
  "modern_relevance": "how this applies today"
}
`;

      const narratorResponse = await genai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              narrative_response: { type: "string" },
              key_themes: { type: "array", items: { type: "string" } },
              historical_connections: { type: "array", items: { type: "string" } },
              modern_relevance: { type: "string" }
            },
            required: ["narrative_response", "key_themes", "historical_connections", "modern_relevance"]
          },
        },
        contents: narratorPrompt,
      });

      agentResults.narrator = JSON.parse(narratorResponse.text || "{}");
    }

    // Step 4: Orchestrator combines results
    const finalResponse = agentResults.narrator?.narrative_response || 
                         "I'm processing your question through multiple analytical frameworks. Please try rephrasing your query for better results.";

    return {
      content: finalResponse,
      agents: agentResults,
      queryType: orchestratorData.query_type,
      agentsUsed: orchestratorData.agents_needed || []
    };

  } catch (error) {
    console.error('AI processing error:', error);
    return {
      content: "I'm currently experiencing technical difficulties processing your query. Please try again in a moment.",
      agents: {},
      queryType: "error",
      agentsUsed: []
    };
  }
}
