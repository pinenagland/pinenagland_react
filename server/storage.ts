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
  type InsertUserProgress,
  users,
  bookChapters,
  historyEvents,
  historyTopics,
  practices,
  chatSessions,
  userProgress
} from "@shared/schema";
import { randomUUID } from "crypto";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, and, or, desc, gte, lte, arrayOverlaps } from "drizzle-orm";

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

    // Seed comprehensive history events across multiple eras
    const historyEventsSeed: HistoryEvent[] = [
      // Prehistoric Era
      {
        id: "neolithic_revolution",
        title: "Neolithic Revolution Begins",
        year: -12000,
        era: "Prehistoric",
        tags: ["Global", "Agriculture", "Civilization"],
        description: "Agricultural revolution transforms human society, leading to permanent settlements and the foundation for civilization.",
        region: "Global"
      },
      {
        id: "sahara_desertification",
        title: "Sahara Desertification Forces Nile Migration",
        year: -5000,
        era: "Prehistoric",
        tags: ["Egypt", "Climate", "Migration"],
        description: "Climate change transforms the Sahara from grassland to desert, forcing populations to migrate to the Nile Valley, concentrating Egyptian civilization.",
        region: "Egypt"
      },
      // Predynastic Period
      {
        id: "egyptian_creation_myths",
        title: "Development of Egyptian Creation Myths",
        year: -3500,
        era: "Predynastic",
        tags: ["Egypt", "Mythology", "Religion", "Creation"],
        description: "The foundational myths of Nu, Atum, and the first gods begin to take shape in early Egyptian religious thought, establishing the cosmological framework that would influence all later Egyptian civilization.",
        region: "Egypt"
      },
      {
        id: "hieroglyphic_writing",
        title: "Hieroglyphic Writing System Emerges",
        year: -3200,
        era: "Predynastic",
        tags: ["Egypt", "Writing", "Cultural"],
        description: "The earliest hieroglyphic inscriptions appear, marking the birth of one of humanity's great writing systems.",
        region: "Egypt"
      },
      // Early Dynastic Period
      {
        id: "first_dynasty",
        title: "First Egyptian Dynasty - Unification",
        year: -3100,
        era: "Early Dynastic",
        tags: ["Egypt", "Political", "Unification"],
        description: "Narmer (Menes) unifies Upper and Lower Egypt, establishing the first pharaonic dynasty and the template for divine kingship that would endure for millennia.",
        region: "Egypt"
      },
      {
        id: "memphis_founded",
        title: "Memphis Founded as Capital",
        year: -3100,
        era: "Early Dynastic",
        tags: ["Egypt", "Political", "Urban Planning"],
        description: "Memphis is established at the junction of Upper and Lower Egypt, serving as the administrative center of the unified kingdom.",
        region: "Egypt"
      },
      // Old Kingdom Period
      {
        id: "step_pyramid",
        title: "Step Pyramid of Djoser Built",
        year: -2670,
        era: "Old Kingdom",
        tags: ["Egypt", "Architecture", "Engineering"],
        description: "Imhotep designs the first monumental stone building, revolutionizing architecture and establishing the pyramid tradition.",
        region: "Egypt"
      },
      {
        id: "pyramids_giza",
        title: "Great Pyramids of Giza Construction",
        year: -2580,
        era: "Old Kingdom",
        tags: ["Egypt", "Architecture", "Engineering"],
        description: "The Great Pyramid of Giza, built for Pharaoh Khufu, represents the pinnacle of Old Kingdom architecture and engineering, standing as one of the Seven Wonders of the Ancient World.",
        region: "Egypt"
      },
      {
        id: "great_sphinx",
        title: "Great Sphinx of Giza Carved",
        year: -2500,
        era: "Old Kingdom",
        tags: ["Egypt", "Architecture", "Mythology"],
        description: "The Great Sphinx, possibly representing Khafre, becomes an enduring symbol of Egyptian mystery and divine kingship.",
        region: "Egypt"
      },
      // Middle Kingdom Period
      {
        id: "middle_kingdom_rise",
        title: "Middle Kingdom Reunification",
        year: -2055,
        era: "Middle Kingdom",
        tags: ["Egypt", "Political", "Renaissance"],
        description: "After the First Intermediate Period's chaos, Mentuhotep II reunifies Egypt, beginning a golden age of literature and culture.",
        region: "Egypt"
      },
      {
        id: "coffin_texts",
        title: "Coffin Texts Democratize Afterlife",
        year: -2000,
        era: "Middle Kingdom",
        tags: ["Egypt", "Religion", "Cultural"],
        description: "Religious texts previously reserved for pharaohs become available to nobility and commoners, transforming Egyptian spiritual life.",
        region: "Egypt"
      },
      // New Kingdom Period
      {
        id: "hatshepsut_reign",
        title: "Hatshepsut's Peaceful Reign",
        year: -1479,
        era: "New Kingdom",
        tags: ["Egypt", "Political", "Architecture"],
        description: "Queen Hatshepsut rules as pharaoh for 22 years, focusing on trade, architecture, and artistic achievement rather than conquest.",
        region: "Egypt"
      },
      {
        id: "akhenaten_revolution",
        title: "Akhenaten's Religious Revolution",
        year: -1353,
        era: "New Kingdom",
        tags: ["Egypt", "Religion", "Cultural"],
        description: "Pharaoh Akhenaten attempts to establish monotheistic worship of Aten, fundamentally challenging Egyptian religious tradition.",
        region: "Egypt"
      },
      {
        id: "tutankhamun_tomb",
        title: "Tutankhamun's Burial",
        year: -1323,
        era: "New Kingdom",
        tags: ["Egypt", "Archaeological", "Cultural"],
        description: "The young pharaoh Tutankhamun is buried with unprecedented treasures, creating the most famous archaeological discovery of the 20th century.",
        region: "Egypt"
      },
      {
        id: "ramesses_abu_simbel",
        title: "Abu Simbel Temples Built",
        year: -1264,
        era: "New Kingdom",
        tags: ["Egypt", "Architecture", "Political"],
        description: "Ramesses II constructs the magnificent Abu Simbel temples, demonstrating Egyptian power and artistic achievement at its peak.",
        region: "Egypt"
      },
      // Classical Period
      {
        id: "persian_conquest",
        title: "Persian Conquest of Egypt",
        year: -525,
        era: "Classical Period",
        tags: ["Egypt", "Political", "Foreign Rule"],
        description: "Cambyses II conquers Egypt, ending native pharaonic rule and beginning centuries of foreign domination.",
        region: "Egypt"
      },
      {
        id: "alexander_egypt",
        title: "Alexander the Great Conquers Egypt",
        year: -332,
        era: "Classical Period",
        tags: ["Egypt", "Political", "Hellenistic"],
        description: "Alexander liberates Egypt from Persian rule and founds Alexandria, beginning the Hellenistic period in Egyptian history.",
        region: "Egypt"
      },
      {
        id: "alexandria_founded",
        title: "Alexandria Founded",
        year: -331,
        era: "Classical Period",
        tags: ["Egypt", "Urban Planning", "Cultural"],
        description: "Alexandria becomes the intellectual and commercial center of the Mediterranean world, housing the Great Library.",
        region: "Egypt"
      },
      {
        id: "ptolemaic_dynasty",
        title: "Ptolemaic Dynasty Established",
        year: -305,
        era: "Classical Period",
        tags: ["Egypt", "Political", "Hellenistic"],
        description: "Ptolemy I establishes the last pharaonic dynasty, blending Greek and Egyptian cultures for three centuries.",
        region: "Egypt"
      },
      {
        id: "rosetta_stone_created",
        title: "Rosetta Stone Inscribed",
        year: -196,
        era: "Classical Period",
        tags: ["Egypt", "Cultural", "Writing"],
        description: "A decree in three scripts is carved, unknowingly creating the key that would later unlock hieroglyphic writing.",
        region: "Egypt"
      },
      {
        id: "cleopatra_death",
        title: "Death of Cleopatra VII",
        year: -30,
        era: "Classical Period",
        tags: ["Egypt", "Political", "Roman"],
        description: "The last pharaoh of Egypt dies, ending three millennia of pharaonic rule as Egypt becomes a Roman province.",
        region: "Egypt"
      },
      // Roman/Byzantine Period
      {
        id: "christianity_egypt",
        title: "Christianity Spreads in Egypt",
        year: 100,
        era: "Roman Period",
        tags: ["Egypt", "Religion", "Cultural"],
        description: "Christianity takes root in Egypt, eventually transforming into the Coptic Church and ending traditional Egyptian religion.",
        region: "Egypt"
      },
      {
        id: "monastery_movement",
        title: "Christian Monastery Movement Begins",
        year: 270,
        era: "Roman Period",
        tags: ["Egypt", "Religion", "Cultural"],
        description: "St. Anthony founds Christian monasticism in the Egyptian desert, influencing religious life worldwide.",
        region: "Egypt"
      },
      // Islamic Period
      {
        id: "arab_conquest",
        title: "Arab Conquest of Egypt",
        year: 641,
        era: "Medieval",
        tags: ["Egypt", "Political", "Islamic"],
        description: "Arab armies conquer Byzantine Egypt, beginning the Islamic period and gradual Arabization of Egyptian society.",
        region: "Egypt"
      },
      {
        id: "cairo_founded",
        title: "Cairo Founded by Fatimids",
        year: 969,
        era: "Medieval",
        tags: ["Egypt", "Urban Planning", "Islamic"],
        description: "The Fatimid dynasty establishes Cairo (Al-Qahirah), which becomes one of the Islamic world's greatest cities.",
        region: "Egypt"
      },
      {
        id: "saladin_ayyubids",
        title: "Saladin Establishes Ayyubid Dynasty",
        year: 1171,
        era: "Medieval",
        tags: ["Egypt", "Political", "Islamic"],
        description: "Saladin overthrows the Fatimids and establishes the Ayyubid dynasty, making Egypt the center of resistance to the Crusades.",
        region: "Egypt"
      },
      {
        id: "mamluks_rise",
        title: "Mamluk Sultanate Established",
        year: 1250,
        era: "Medieval",
        tags: ["Egypt", "Political", "Military"],
        description: "Former slave soldiers establish the Mamluk Sultanate, creating one of the medieval world's most powerful military states.",
        region: "Egypt"
      },
      // Modern Period
      {
        id: "ottoman_conquest",
        title: "Ottoman Conquest of Egypt",
        year: 1517,
        era: "Early Modern",
        tags: ["Egypt", "Political", "Ottoman"],
        description: "The Ottoman Empire conquers Egypt, making it a province of the empire while maintaining considerable autonomy.",
        region: "Egypt"
      },
      {
        id: "napoleon_expedition",
        title: "Napoleon's Egyptian Expedition",
        year: 1798,
        era: "Modern Era",
        tags: ["Egypt", "Archaeological", "European"],
        description: "Napoleon's campaign brings European scholars to Egypt, launching modern Egyptology and rediscovering ancient Egypt for the Western world.",
        region: "Egypt"
      },
      {
        id: "rosetta_stone_discovery",
        title: "Rosetta Stone Discovered",
        year: 1799,
        era: "Modern Era",
        tags: ["Egypt", "Archaeological", "Discovery"],
        description: "French soldiers discover the Rosetta Stone, providing the key to deciphering hieroglyphs and unlocking ancient Egyptian texts.",
        region: "Egypt"
      },
      {
        id: "champollion_hieroglyphs",
        title: "Champollion Deciphers Hieroglyphs",
        year: 1822,
        era: "Modern Era",
        tags: ["Egypt", "Archaeological", "Discovery"],
        description: "Jean-François Champollion successfully decodes hieroglyphic writing, opening the door to understanding ancient Egyptian civilization.",
        region: "Egypt"
      },
      {
        id: "suez_canal",
        title: "Suez Canal Opens",
        year: 1869,
        era: "Modern Era",
        tags: ["Egypt", "Engineering", "Global Trade"],
        description: "The Suez Canal opens, transforming Egypt into a crucial hub of global commerce and strategic importance.",
        region: "Egypt"
      },
      {
        id: "tutankhamun_discovery",
        title: "Discovery of Tutankhamun's Tomb",
        year: 1922,
        era: "Modern Era",
        tags: ["Egypt", "Archaeological", "Discovery"],
        description: "Howard Carter discovers the intact tomb of Tutankhamun, creating a worldwide sensation and advancing understanding of New Kingdom Egypt.",
        region: "Egypt"
      },
      {
        id: "egyptian_independence",
        title: "Egyptian Independence",
        year: 1952,
        era: "Modern Era",
        tags: ["Egypt", "Political", "Independence"],
        description: "The Free Officers Revolution ends the monarchy and establishes the Republic of Egypt, beginning the modern era of Egyptian independence.",
        region: "Egypt"
      }
    ];

    // Add all events to storage
    historyEventsSeed.forEach(event => {
      this.historyEvents.set(event.id, event);
    });

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
      preferences: insertUser.preferences || {},
      goals: insertUser.goals || {},
      progress: insertUser.progress || {},
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

// PostgreSQL Storage Implementation
export class PostgresStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required for PostgreSQL storage");
    }
    this.db = drizzle(neon(process.env.DATABASE_URL));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const result = await this.db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  // Book operations
  async getChapter(id: string): Promise<BookChapter | undefined> {
    const result = await this.db.select().from(bookChapters).where(eq(bookChapters.id, id));
    return result[0];
  }

  async getAllChapters(): Promise<BookChapter[]> {
    return await this.db.select().from(bookChapters).orderBy(bookChapters.chapterNumber);
  }

  async createChapter(chapter: InsertBookChapter): Promise<BookChapter> {
    const result = await this.db.insert(bookChapters).values(chapter).returning();
    return result[0];
  }

  // History operations
  async getHistoryEvents(filters?: { era?: string; year?: number; tags?: string[] }): Promise<HistoryEvent[]> {
    let query = this.db.select().from(historyEvents);
    const conditions = [];

    if (filters?.era) {
      conditions.push(eq(historyEvents.era, filters.era));
    }
    
    if (filters?.year) {
      // Match MemStorage behavior: +/-100 year window
      conditions.push(
        and(
          gte(historyEvents.year, filters.year - 100),
          lte(historyEvents.year, filters.year + 100)
        )
      );
    }
    
    if (filters?.tags?.length) {
      // Filter events that have any of the specified tags
      const tagConditions = filters.tags.map(tag => 
        arrayOverlaps(historyEvents.tags, [tag])
      );
      conditions.push(or(...tagConditions));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Match MemStorage behavior: order by year descending
    return await query.orderBy(desc(historyEvents.year));
  }

  async getHistoryEvent(id: string): Promise<HistoryEvent | undefined> {
    const result = await this.db.select().from(historyEvents).where(eq(historyEvents.id, id));
    return result[0];
  }

  async createHistoryEvent(event: InsertHistoryEvent): Promise<HistoryEvent> {
    const result = await this.db.insert(historyEvents).values(event).returning();
    return result[0];
  }

  async getHistoryTopics(): Promise<HistoryTopic[]> {
    return await this.db.select().from(historyTopics);
  }

  async getHistoryTopic(id: string): Promise<HistoryTopic | undefined> {
    const result = await this.db.select().from(historyTopics).where(eq(historyTopics.id, id));
    return result[0];
  }

  async createHistoryTopic(topic: InsertHistoryTopic): Promise<HistoryTopic> {
    const result = await this.db.insert(historyTopics).values(topic).returning();
    return result[0];
  }

  // Practice operations
  async getPractices(type?: string): Promise<Practice[]> {
    if (type) {
      return await this.db.select().from(practices).where(eq(practices.type, type));
    }
    return await this.db.select().from(practices);
  }

  async getPractice(id: string): Promise<Practice | undefined> {
    const result = await this.db.select().from(practices).where(eq(practices.id, id));
    return result[0];
  }

  async createPractice(practice: InsertPractice): Promise<Practice> {
    const result = await this.db.insert(practices).values(practice).returning();
    return result[0];
  }

  // Chat operations
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const result = await this.db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return result[0];
  }

  async getChatSessionsByUser(userId: string): Promise<ChatSession[]> {
    return await this.db.select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.timestamp));
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const result = await this.db.insert(chatSessions).values(session).returning();
    return result[0];
  }

  async updateChatSession(id: string, messages: any[]): Promise<ChatSession | undefined> {
    const result = await this.db.update(chatSessions)
      .set({ messages })
      .where(eq(chatSessions.id, id))
      .returning();
    return result[0];
  }

  // Progress operations
  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await this.db.select().from(userProgress).where(eq(userProgress.userId, userId));
  }

  async getUserChapterProgress(userId: string, chapterId: string): Promise<UserProgress | undefined> {
    const result = await this.db.select()
      .from(userProgress)
      .where(and(eq(userProgress.userId, userId), eq(userProgress.chapterId, chapterId)));
    return result[0];
  }

  async createOrUpdateProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const existing = await this.getUserChapterProgress(progress.userId!, progress.chapterId!);
    
    if (existing) {
      const result = await this.db.update(userProgress)
        .set({ ...progress, timestamp: new Date() })
        .where(eq(userProgress.id, existing.id))
        .returning();
      return result[0];
    } else {
      const result = await this.db.insert(userProgress).values(progress).returning();
      return result[0];
    }
  }

  // Seeding function to populate database with initial data
  async seedDatabase(): Promise<void> {
    // Check if data already exists
    const existingChapters = await this.getAllChapters();
    if (existingChapters.length > 0) {
      console.log("Database already seeded, skipping...");
      return;
    }

    console.log("Seeding database with initial data...");

    // Seed book chapters from "The Weavers of Eternity: A Chronicle of the Egyptian Gods"
    await this.createChapter({
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
    });

    await this.createChapter({
      id: "ch_1",
      title: "Nu – The Infinite Waters",
      chapterNumber: 1,
      narrative: `Nu was not god in the way others would be – with temples and names sung in hymns – but rather the canvas upon which existence would be painted. He was the dark water, the eternal tide, the father of beginnings and the grave of endings.

In the boundless expanse of his being, all possibilities swirled like currents beneath a moonless sky. Here, time had no meaning, for there was no sun to mark its passage. Space held no boundaries, for there were no shores to contain the endless sea.

Yet within this apparent emptiness lay the greatest abundance. Every star that would shine, every grain of sand that would shift, every heartbeat that would echo through eternity – all resided in Nu's infinite embrace.

The waters spoke in whispers older than sound, carrying stories that had never been told. And from these primordial depths, the first stirring of consciousness began to rise.`,
      commentary: "Nu represents the concept of infinite potential – the state before creation where all possibilities exist simultaneously. In Egyptian cosmology, he remains present throughout existence as the underlying foundation of reality.",
      figures: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4"],
      tags: ["Nu", "Infinite Waters", "Primordial", "Creation"],
      timeSpan: "Before Time",
      era: "Mythological"
    });

    await this.createChapter({
      id: "ch_2", 
      title: "Kek & Heh – Shadows and Infinity",
      chapterNumber: 2,
      narrative: `From the deep currents of Nu emerged the first duality – not of light and dark as mortals understand, but of shadow and eternity.

Kek emerged as the embodiment of the primordial darkness, not as absence but as potential. His darkness was the fertile void where all things gestated before birth. In his realm, concepts took shape before becoming real, dreams crystallized into destiny.

Beside him stirred Heh, the personification of infinity itself. Where Kek was the bounded darkness that made light meaningful, Heh was the endless expanse that gave context to all finite things. Together, they established the fundamental rhythm of existence – the bounded and the boundless, the finite and the eternal.

Their dance created the first cosmic music, a rhythm that would pulse through all creation. In the interplay of Kek's defining shadows and Heh's limitless expanse, the stage was set for form to emerge from formlessness.`,
      commentary: "Kek and Heh represent complementary cosmic principles. Their emergence from Nu shows how the ancient Egyptians understood that even fundamental dualities arise from an underlying unity.",
      figures: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4"],
      tags: ["Kek", "Heh", "Duality", "Shadow", "Infinity"],
      timeSpan: "Dawn of Time",
      era: "Mythological"
    });

    await this.createChapter({
      id: "ch_3",
      title: "Amun & Mut – The Hidden and the Mother",
      chapterNumber: 3,
      narrative: `As the cosmic forces settled into their eternal dance, two more powers emerged from Nu's depths – powers that would shape the very nature of divinity itself.

Amun arose as the Hidden One, the god whose essence could never be fully grasped or contained. He was the breath behind all breath, the will behind all action, the invisible force that moves the seen world. Even his fellow gods would struggle to comprehend his true nature, for Amun was the mystery that dwells at the heart of all mysteries.

With him came Mut, the Great Mother, whose womb would nurture all that was to come. She was not merely a vessel for creation, but creation's own wisdom and protective embrace. In her eyes blazed the fierce love that would defend the young cosmos from the chaos that forever sought to reclaim it.

Together, Amun and Mut established the pattern of hidden wisdom and manifest nurturing that would echo through all divine relationships. The Hidden and the Mother – the unknowable truth and the protective love that makes existence possible.`,
      commentary: "Amun and Mut represent the complementary aspects of divine mystery and divine accessibility. Their union shows how the transcendent must work through the immanent to touch mortal existence.",
      figures: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96"],
      tags: ["Amun", "Mut", "Hidden God", "Great Mother", "Divine Mystery"],
      timeSpan: "Age of First Gods",
      era: "Mythological"
    });

    // Seed historical events
    await this.createHistoryEvent({
      id: "ancient_egypt_unification",
      title: "Unification of Upper and Lower Egypt",
      year: -3100,
      era: "Ancient Egypt",
      tags: ["Egypt", "Unification", "Pharaoh", "Civilization"],
      description: "King Menes (possibly Narmer) unifies Upper and Lower Egypt, founding the first dynasty and establishing Memphis as the capital.",
      region: "Egypt"
    });

    await this.createHistoryEvent({
      id: "pyramid_construction",
      title: "Great Pyramid of Giza Construction",
      year: -2580,
      era: "Old Kingdom",
      tags: ["Pyramid", "Giza", "Pharaoh", "Architecture"],
      description: "Construction of the Great Pyramid of Giza under Pharaoh Khufu, one of the Seven Wonders of the Ancient World.",
      region: "Egypt"
    });

    // Seed meditation practices
    await this.createPractice({
      id: "breath_of_nu",
      type: "meditation",
      title: "Breath of Nu - Primordial Waters",
      duration: 20,
      instructions: "Connect with the infinite potential of Nu, the primordial waters. Breathe deeply and imagine yourself floating in the cosmic ocean before creation. Feel the boundless possibilities flowing around and through you. With each breath, connect to the source of all existence.",
      origin: "Inspired by Nu from The Weavers of Eternity",
      tags: ["Nu", "Primordial", "Infinite Potential", "Cosmic Ocean"]
    });

    await this.createPractice({
      id: "shadow_light_balance",
      type: "meditation", 
      title: "Shadow and Light Balance - Kek & Heh",
      duration: 15,
      instructions: "Experience the cosmic balance of Kek (shadow) and Heh (infinity). Begin in darkness, acknowledging the shadows within and around you. Then expand your awareness to touch infinity - the endless expanse of time and space. Feel how darkness gives meaning to light, and how infinity gives context to the finite moment.",
      origin: "Inspired by Kek and Heh from The Weavers of Eternity",
      tags: ["Kek", "Heh", "Balance", "Shadow", "Infinity"]
    });

    console.log("Database seeding completed!");
  }
}

export const storage = new PostgresStorage();

// Initialize the database with seed data
storage.seedDatabase().catch(console.error);
