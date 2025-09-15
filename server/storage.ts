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
    // Seed book chapters from "The Weavers of Eternity: A Chronicle of the Egyptian Gods"
    
    // Prologue
    const prologue: BookChapter = {
      id: "prologue",
      title: "The Silence Before All",
      chapterNumber: 0,
      narrative: `Before the first dawn, before the river sang, before sand and star were named, there was silence. Not the silence of sleep, nor the silence after death, but the silence of a world unborn.

There was no earth, no sky, no air. Only a vast and endless sea of shadowed waters stretched into eternity. This was Nu, the limitless expanse, the boundless nothingness from which all would rise.

The waters were heavy with possibility, yet empty of form. Within Nu drifted the seeds of gods not yet awakened, destinies unspoken, and worlds that had not yet drawn breath.

And in that endless depth, the stillness began to tremble.

A whisper moved through the waters – a stirring, a breath. Creation longed to be born, and the first story began.`,
      commentary: "The ancient Egyptian creation myth begins not with a bang, but with infinite potential. Nu represents the primordial chaos from which all order emerges, a concept that echoes through many world mythologies.",
      figures: ["https://images.unsplash.com/photo-1445905595283-21f8ae8a33d2"],
      tags: ["Creation", "Nu", "Primordial Waters", "Beginning"],
      timeSpan: "Before Time",
      era: "Mythological"
    };
    this.chapters.set(prologue.id, prologue);

    // Chapter 1 - Nu
    const chapter1: BookChapter = {
      id: "ch_1",
      title: "Nu – The Infinite Waters",
      chapterNumber: 1,
      narrative: `Nu was not god in the way others would be – with temples and names sung in hymns – but rather the canvas upon which existence would be painted. He was the dark water, the eternal tide, the father of beginnings and the grave of endings.

To look upon him was to see nothing and everything. To touch him was to feel the pulse of eternity.

Yet even Nu, vast and unending, felt the ache of loneliness.

He drifted within himself, tides folding upon tides, whispering: "What use is infinity if no one bears witness to its depth?"

And so from the waters stirred the first companions – shapes born from his essence. Shadows stretched and hardened into forms. From Nu's depths came Kek, the god of darkness, and his twin flame Heh, the god of infinity. From the hidden corners of his waters emerged Amun, the concealed one, and beside him, radiant in quiet majesty, came Mut, the great mother.

Each greeted Nu in silence, for there were no words yet, only the weight of awareness.

Creation had begun, and Nu receded slightly, not vanishing but watching. For though the gods would rise and clash, love and destroy, Nu would remain – the infinite sea that cradles both life and death.`,
      commentary: "Nu represents the concept of primordial chaos that exists before creation. Unlike the destructive chaos we often imagine, Nu is pregnant with potential – the source from which all order and meaning emerge.",
      figures: ["https://images.unsplash.com/photo-1439066615861-d1af74d74000"],
      tags: ["Nu", "Primordial Waters", "First Gods", "Creation"],
      timeSpan: "Dawn of Creation",
      era: "Mythological"
    };
    this.chapters.set(chapter1.id, chapter1);

    // Chapter 2 - Kek & Heh
    const chapter2: BookChapter = {
      id: "ch_2",
      title: "Kek & Heh – Shadows and Infinity",
      chapterNumber: 2,
      narrative: `From the still waters of Nu, shapes began to stir. The first was a darkness thicker than night, a presence that seemed to devour even the faintest glimmer of becoming. This was Kek, the god of shadow, cloaked in the eternal dusk that lingers before dawn.

Yet beside him rose another – vast, unending, without boundary – Heh, the god of infinity. He stretched in every direction, an endless horizon, and where Kek consumed light, Heh multiplied time, granting it no end.

They looked upon one another in the twilight of unformed creation.

Kek spoke first, his voice low and hollow, like wind echoing in a cavern: "I am the veil. I am the silence before the cry. Without me, light would blind itself, and order would have no rest."

Heh's laughter was like the rolling of distant thunder. "And I am the stretch of eternity. Without me, all things would die before they were born. I am the forever upon which the fleeting stands."

Together, they drifted through Nu's waters, shaping balance – the limits and the limitless, the night and the eternal expanse.`,
      commentary: "Kek and Heh represent fundamental forces in Egyptian cosmology – the balance between darkness and infinity, between limits and limitlessness. They establish the first cosmic dualities from which more complex creation can emerge.",
      figures: ["https://images.unsplash.com/photo-1502134249126-9f3755a50d78"],
      tags: ["Kek", "Heh", "Shadow", "Infinity", "Balance"],
      timeSpan: "Early Creation",
      era: "Mythological"
    };
    this.chapters.set(chapter2.id, chapter2);

    // Chapter 3 - Amun & Mut
    const chapter3: BookChapter = {
      id: "ch_3",
      title: "Amun & Mut – The Hidden and the Mother",
      chapterNumber: 3,
      narrative: `From the waters of Nu, shaped by the silence of Kek and stretched by the infinity of Heh, came a presence unseen, unknowable, unfathomable.

This was Amun, the Hidden One.

He was not shadow, nor light, nor sky, nor earth – but something between, something that slipped through grasp and gaze. To behold him was to feel as though he were always just behind you, or just beyond the veil, never fully caught.

Nu regarded him with awe. "You are mystery given breath. From you, the unknown will rise, for without mystery, knowledge has no meaning."

Amun bowed his head, his eyes veiled. His voice was quiet, but it carried across the eternal waters: "I am the unseen force. I move through what is, what was, and what will be. None shall name my true form, for it is in being hidden that I endure."

And beside him, rising like the dawn after endless night, came Mut, the Mother. She was vast yet gentle, her presence radiant, her embrace wide enough to hold worlds not yet born. Her crown bore the double plumes of majesty, and her eyes shone with the promise of nurture.

Amun and Mut stood side by side, and in their union, creation felt the stirrings of order. Where Amun was unseen, Mut gave form. Where Mut offered life, Amun lent spirit.`,
      commentary: "Amun and Mut represent the balance between the hidden and the revealed, the mysterious and the nurturing. Their partnership establishes the foundation for both divine kingship and the protection of life.",
      figures: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96"],
      tags: ["Amun", "Mut", "Hidden One", "Mother", "Mystery", "Nurture"],
      timeSpan: "Formation of Order",
      era: "Mythological"
    };
    this.chapters.set(chapter3.id, chapter3);

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

    const creationMyths: HistoryEvent = {
      id: "egyptian_creation_myths",
      title: "Development of Egyptian Creation Myths",
      year: -3500,
      era: "Predynastic",
      tags: ["Egypt", "Mythology", "Religion", "Creation"],
      description: "The foundational myths of Nu, Atum, and the first gods begin to take shape in early Egyptian religious thought, establishing the cosmological framework that would influence all later Egyptian civilization.",
      region: "Egypt"
    };
    this.historyEvents.set(creationMyths.id, creationMyths);

    // Seed practices aligned with "The Weavers of Eternity"
    const breathOfNu: Practice = {
      id: "breath_of_nu",
      type: "meditation",
      title: "Breath of Nu - Primordial Waters",
      duration: 12,
      instructions: "Connect with the infinite waters of Nu, the source of all creation. Sit comfortably and imagine yourself floating in vast, dark waters. Breathe deeply, allowing each breath to connect you with the primordial source. Feel the infinite potential within the stillness, the pregnant silence from which all existence emerges.",
      origin: "Based on the primordial Nu from The Weavers of Eternity",
      tags: ["Nu", "Primordial", "Creation", "Water"]
    };
    this.practices.set(breathOfNu.id, breathOfNu);

    const shadowAndLight: Practice = {
      id: "kek_heh_balance",
      type: "meditation",
      title: "Shadow and Infinity - Kek & Heh Balance",
      duration: 15,
      instructions: "Experience the cosmic balance of Kek (shadow) and Heh (infinity). Begin in darkness, acknowledging the shadows within and around you. Then expand your awareness to touch infinity - the endless expanse of time and space. Feel how darkness gives meaning to light, and how infinity gives context to the finite moment.",
      origin: "Inspired by Kek and Heh from The Weavers of Eternity",
      tags: ["Kek", "Heh", "Balance", "Shadow", "Infinity"]
    };
    this.practices.set(shadowAndLight.id, shadowAndLight);

    const hiddenMother: Practice = {
      id: "amun_mut_mystery",
      type: "meditation",
      title: "The Hidden and the Mother - Amun & Mut",
      duration: 18,
      instructions: "Explore the mystery of the hidden (Amun) and the nurturing power of the divine mother (Mut). Sit in contemplation of what remains hidden in your life, the mysteries you cannot grasp. Then open to the nurturing, protective energy that surrounds and sustains you. Feel the balance between the unknown and the caring embrace of existence.",
      origin: "Based on Amun and Mut from The Weavers of Eternity",
      tags: ["Amun", "Mut", "Mystery", "Mother", "Hidden", "Nurture"]
    };
    this.practices.set(hiddenMother.id, hiddenMother);
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
