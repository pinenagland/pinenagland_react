import { 
  type User, 
  type InsertUser, 
  type BookChapter, 
  type InsertBookChapter,
  type HistoryEvent,
  type InsertHistoryEvent,
  type HistoryTopic,
  type InsertHistoryTopic,
  type Practice,
  type InsertPractice,
  type ChatSession,
  type InsertChatSession,
  type UserProgress,
  type InsertUserProgress
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Book operations
  getChapter(id: string): Promise<BookChapter | undefined>;
  getAllChapters(): Promise<BookChapter[]>;
  createChapter(chapter: InsertBookChapter): Promise<BookChapter>;

  // History operations
  getHistoryEvents(filters?: { era?: string; year?: number; tags?: string[] }): Promise<HistoryEvent[]>;
  getHistoryEvent(id: string): Promise<HistoryEvent | undefined>;
  createHistoryEvent(event: InsertHistoryEvent): Promise<HistoryEvent>;

  getHistoryTopics(): Promise<HistoryTopic[]>;
  getHistoryTopic(id: string): Promise<HistoryTopic | undefined>;
  createHistoryTopic(topic: InsertHistoryTopic): Promise<HistoryTopic>;

  // Practice operations
  getPractices(type?: string): Promise<Practice[]>;
  getPractice(id: string): Promise<Practice | undefined>;
  createPractice(practice: InsertPractice): Promise<Practice>;

  // Chat operations
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessionsByUser(userId: string): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, messages: any[]): Promise<ChatSession | undefined>;

  // Progress operations
  getUserProgress(userId: string): Promise<UserProgress[]>;
  getUserChapterProgress(userId: string, chapterId: string): Promise<UserProgress | undefined>;
  createOrUpdateProgress(progress: InsertUserProgress): Promise<UserProgress>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private chapters: Map<string, BookChapter> = new Map();
  private historyEvents: Map<string, HistoryEvent> = new Map();
  private historyTopics: Map<string, HistoryTopic> = new Map();
  private practices: Map<string, Practice> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private userProgress: Map<string, UserProgress> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Seed book chapters
    const chapter41: BookChapter = {
      id: "ch_41",
      title: "Horus – The Falcon God of Kingship",
      chapterNumber: 41,
      narrative: `In the vast expanse of the Nile Valley, where the river's life-giving waters carved civilization from desert sands, there soared a divine falcon whose piercing gaze would shape the destiny of pharaohs and the cosmic order itself. Horus, the sky god whose name echoes through millennia, represents more than myth—he embodies the living bridge between earthly kingship and divine authority.

The ancient Egyptians understood what modern archaeology confirms: that their civilization emerged not from isolation, but from the confluence of African wisdom traditions, Mediterranean trade routes, and innovations that would influence the entire ancient world. In this context, Horus becomes not merely a local deity, but a symbol of the universal human quest to understand leadership, justice, and the responsibilities of power.

Archaeological evidence from the Predynastic Period (c. 6000-3100 BCE) reveals falcon imagery in burial sites and ceremonial objects, suggesting that the Horus cult predates the unification of Upper and Lower Egypt. The famous Narmer Palette, dating to approximately 3100 BCE, shows the falcon god overseeing the pharaoh's victory, establishing a template for divine kingship that would endure for three millennia.`,
      commentary: "The mythology of Horus intertwines with historical events in ways that reveal deep truths about ancient Egyptian society. The story of Horus's battle with Seth reflects not only cosmic struggle between order and chaos, but also real political conflicts that shaped early Egyptian dynasties.",
      figures: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b"],
      tags: ["Ancient Egypt", "Mythology", "Kingship", "Nile Valley"],
      timeSpan: "3100 BCE - 332 BCE",
      era: "Ancient History"
    };
    this.chapters.set(chapter41.id, chapter41);

    // Seed history events
    const pyramidsEvent: HistoryEvent = {
      id: "pyramids_giza",
      title: "Pyramids of Giza Construction",
      year: -2580,
      era: "Old Kingdom",
      tags: ["Egypt", "Architecture", "Engineering"],
      description: "The Great Pyramid of Giza, built for Pharaoh Khufu, represents the pinnacle of Old Kingdom architecture and engineering.",
      region: "Egypt"
    };
    this.historyEvents.set(pyramidsEvent.id, pyramidsEvent);

    const firstDynasty: HistoryEvent = {
      id: "first_dynasty",
      title: "First Egyptian Dynasty",
      year: -3100,
      era: "Early Dynastic",
      tags: ["Egypt", "Politics", "Unification"],
      description: "Narmer (Menes) unifies Upper and Lower Egypt, establishing the first pharaonic dynasty and the template for divine kingship.",
      region: "Egypt"
    };
    this.historyEvents.set(firstDynasty.id, firstDynasty);

    const neolithic: HistoryEvent = {
      id: "neolithic_revolution",
      title: "Neolithic Revolution Begins",
      year: -12000,
      era: "Prehistoric",
      tags: ["Global", "Agriculture", "Civilization"],
      description: "Agricultural revolution transforms human society, leading to permanent settlements and the foundation for civilization.",
      region: "Global"
    };
    this.historyEvents.set(neolithic.id, neolithic);

    // Seed practices
    const breathOfRa: Practice = {
      id: "breath_of_ra",
      type: "meditation",
      title: "Breath of Ra",
      duration: 10,
      instructions: "Ancient Egyptian breathing technique that aligns with the solar cycle, promoting vitality and mental clarity. Begin by facing east and breathing in rhythm with the imagined rising sun...",
      origin: "Ancient Egyptian temple practices from Heliopolis",
      tags: ["Egyptian", "Solar", "Breathing"]
    };
    this.practices.set(breathOfRa.id, breathOfRa);

    const thirdEye: Practice = {
      id: "third_eye_awakening",
      type: "meditation",
      title: "Third Eye Awakening",
      duration: 15,
      instructions: "Sacred geometry meditation focusing on the eye of Horus and inner vision. Combines ancient Egyptian wisdom with modern neuroscience understanding...",
      origin: "Ancient Egyptian mystical traditions",
      tags: ["Egyptian", "Consciousness", "Vision"]
    };
    this.practices.set(thirdEye.id, thirdEye);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Book operations
  async getChapter(id: string): Promise<BookChapter | undefined> {
    return this.chapters.get(id);
  }

  async getAllChapters(): Promise<BookChapter[]> {
    return Array.from(this.chapters.values()).sort((a, b) => a.chapterNumber - b.chapterNumber);
  }

  async createChapter(chapter: InsertBookChapter): Promise<BookChapter> {
    this.chapters.set(chapter.id, chapter);
    return chapter;
  }

  // History operations
  async getHistoryEvents(filters?: { era?: string; year?: number; tags?: string[] }): Promise<HistoryEvent[]> {
    let events = Array.from(this.historyEvents.values());
    
    if (filters?.era) {
      events = events.filter(event => event.era === filters.era);
    }
    
    if (filters?.year) {
      events = events.filter(event => Math.abs(event.year - filters.year!) <= 100);
    }
    
    if (filters?.tags?.length) {
      events = events.filter(event => 
        filters.tags!.some(tag => 
          (event.tags as string[]).includes(tag)
        )
      );
    }
    
    return events.sort((a, b) => b.year - a.year);
  }

  async getHistoryEvent(id: string): Promise<HistoryEvent | undefined> {
    return this.historyEvents.get(id);
  }

  async createHistoryEvent(event: InsertHistoryEvent): Promise<HistoryEvent> {
    this.historyEvents.set(event.id, event);
    return event;
  }

  async getHistoryTopics(): Promise<HistoryTopic[]> {
    return Array.from(this.historyTopics.values());
  }

  async getHistoryTopic(id: string): Promise<HistoryTopic | undefined> {
    return this.historyTopics.get(id);
  }

  async createHistoryTopic(topic: InsertHistoryTopic): Promise<HistoryTopic> {
    this.historyTopics.set(topic.id, topic);
    return topic;
  }

  // Practice operations
  async getPractices(type?: string): Promise<Practice[]> {
    const practices = Array.from(this.practices.values());
    if (type) {
      return practices.filter(practice => practice.type === type);
    }
    return practices;
  }

  async getPractice(id: string): Promise<Practice | undefined> {
    return this.practices.get(id);
  }

  async createPractice(practice: InsertPractice): Promise<Practice> {
    this.practices.set(practice.id, practice);
    return practice;
  }

  // Chat operations
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async getChatSessionsByUser(userId: string): Promise<ChatSession[]> {
    return Array.from(this.chatSessions.values())
      .filter(session => session.userId === userId)
      .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const chatSession: ChatSession = {
      ...session,
      id,
      timestamp: new Date()
    };
    this.chatSessions.set(id, chatSession);
    return chatSession;
  }

  async updateChatSession(id: string, messages: any[]): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, messages };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async getUserChapterProgress(userId: string, chapterId: string): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values())
      .find(progress => progress.userId === userId && progress.chapterId === chapterId);
  }

  async createOrUpdateProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existingKey = Array.from(this.userProgress.entries())
      .find(([_, p]) => p.userId === progress.userId && p.chapterId === progress.chapterId)?.[0];

    if (existingKey) {
      const existing = this.userProgress.get(existingKey)!;
      const updated = { ...existing, ...progress, timestamp: new Date() };
      this.userProgress.set(existingKey, updated);
      return updated;
    } else {
      const id = randomUUID();
      const newProgress: UserProgress = {
        ...progress,
        id,
        timestamp: new Date()
      };
      this.userProgress.set(id, newProgress);
      return newProgress;
    }
  }
}

export const storage = new MemStorage();
