import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "../storage";
import { semanticCache } from "./cache";
import type { HistoryEvent, BookChapter } from "@shared/schema";

export interface EmbeddedContent {
  id: string;
  content: string;
  embedding: number[];
  type: 'history_event' | 'book_chapter';
  metadata: {
    title: string;
    era?: string;
    year?: number;
    tags?: string[];
    region?: string;
  };
}

export interface SearchResult {
  id: string;
  content: string;
  similarity: number;
  type: 'history_event' | 'book_chapter';
  metadata: {
    title: string;
    era?: string;
    year?: number;
    tags?: string[];
    region?: string;
  };
}

export class SemanticSearchEngine {
  private genAI: GoogleGenerativeAI | null = null;
  private embeddedContent: EmbeddedContent[] = [];
  private isInitialized = false;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is required for semantic search");
      this.genAI = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
  }

  /**
   * Initialize the semantic search engine by creating embeddings for all content
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log("Initializing semantic search engine...");
    
    try {
      // Load historical events and chapters
      const [historyEvents, bookChapters] = await Promise.all([
        storage.getHistoryEvents(),
        storage.getAllChapters()
      ]);

      // Create embeddings for history events
      const historyEmbeddings = await this.createHistoryEventEmbeddings(historyEvents);
      
      // Create embeddings for book chapters  
      const chapterEmbeddings = await this.createBookChapterEmbeddings(bookChapters);

      this.embeddedContent = [...historyEmbeddings, ...chapterEmbeddings];
      this.isInitialized = true;
      
      console.log(`Semantic search initialized with ${this.embeddedContent.length} embedded items`);
    } catch (error) {
      console.error("Failed to initialize semantic search:", error);
      throw error;
    }
  }

  /**
   * Create embeddings for historical events
   */
  private async createHistoryEventEmbeddings(events: HistoryEvent[]): Promise<EmbeddedContent[]> {
    const embeddedEvents: EmbeddedContent[] = [];
    
    console.log(`Creating embeddings for ${events.length} historical events...`);
    
    for (const event of events) {
      try {
        const content = `${event.title}: ${event.description} (Year: ${event.year}, Era: ${event.era}, Region: ${event.region || 'Unknown'})`;
        const embedding = await this.generateEmbedding(content);
        
        embeddedEvents.push({
          id: event.id,
          content,
          embedding,
          type: 'history_event',
          metadata: {
            title: event.title,
            era: event.era,
            year: event.year,
            tags: event.tags as string[] || [],
            region: event.region ?? undefined
          }
        });

        // Add small delay to avoid rate limiting
        await this.delay(100);
      } catch (error) {
        console.error(`Failed to create embedding for event ${event.id}:`, error);
      }
    }
    
    return embeddedEvents;
  }

  /**
   * Create embeddings for book chapters
   */
  private async createBookChapterEmbeddings(chapters: BookChapter[]): Promise<EmbeddedContent[]> {
    const embeddedChapters: EmbeddedContent[] = [];
    
    console.log(`Creating embeddings for ${chapters.length} book chapters...`);
    
    for (const chapter of chapters) {
      try {
        const content = `${chapter.title}: ${chapter.narrative} ${chapter.commentary || ''}`;
        const embedding = await this.generateEmbedding(content);
        
        embeddedChapters.push({
          id: chapter.id,
          content,
          embedding,
          type: 'book_chapter',
          metadata: {
            title: chapter.title,
            era: chapter.era ?? undefined,
            tags: chapter.tags as string[] || []
          }
        });

        // Add small delay to avoid rate limiting
        await this.delay(100);
      } catch (error) {
        console.error(`Failed to create embedding for chapter ${chapter.id}:`, error);
      }
    }
    
    return embeddedChapters;
  }

  /**
   * Generate embedding for text using Google Gemini with caching and timeout
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // Check if genAI is initialized
    if (!this.genAI) {
      console.error("GoogleGenerativeAI not initialized - missing API key");
      return new Array(768).fill(0); // Return zero vector
    }

    // Check cache first
    const cacheKey = this.hashString(text);
    const cached = semanticCache.getEmbedding(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: "text-embedding-004"
      });
      
      // Add timeout to prevent hanging
      const embedPromise = model.embedContent(text);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Embedding generation timeout after 10 seconds')), 10000);
      });
      
      const result = await Promise.race([embedPromise, timeoutPromise]);
      const embedding = result.embedding.values;
      
      // Cache the result
      semanticCache.setEmbedding(cacheKey, embedding);
      
      return embedding;
    } catch (error) {
      console.error("Failed to generate embedding:", error);
      // Return zero vector as fallback
      const fallback = new Array(768).fill(0);
      // Cache fallback to avoid repeated API calls on errors
      semanticCache.setEmbedding(cacheKey, fallback);
      return fallback;
    }
  }

  /**
   * Generate a hash for text to use as cache key
   */
  private hashString(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  /**
   * Search for semantically similar content with caching
   */
  async semanticSearch(query: string, options: {
    limit?: number;
    threshold?: number;
    type?: 'history_event' | 'book_chapter';
    era?: string;
  } = {}): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { limit = 10, threshold = 0.7, type, era } = options;
    
    // Check cache first
    const cacheKey = semanticCache.generateQueryKey(query, options);
    const cached = semanticCache.getSearchResults(cacheKey);
    if (cached) {
      return cached;
    }
    
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Calculate similarities
      const similarities = this.embeddedContent.map(item => ({
        ...item,
        similarity: this.cosineSimilarity(queryEmbedding, item.embedding)
      }));

      // Filter by type and era if specified
      let filtered = similarities;
      if (type) {
        filtered = filtered.filter(item => item.type === type);
      }
      if (era) {
        filtered = filtered.filter(item => item.metadata.era === era);
      }

      // Filter by threshold and sort by similarity
      const results = filtered
        .filter(item => item.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      const searchResults = results.map(item => ({
        id: item.id,
        content: item.content,
        similarity: item.similarity,
        type: item.type,
        metadata: item.metadata
      }));

      // Cache the results
      semanticCache.setSearchResults(cacheKey, searchResults);
      
      return searchResults;
    } catch (error) {
      console.error("Semantic search failed:", error);
      return [];
    }
  }

  /**
   * Find historical context for fact-checking with caching
   */
  async findHistoricalContext(claim: string, options: {
    includeSimilar?: boolean;
    timeRange?: { start: number; end: number };
  } = {}): Promise<{
    directMatches: SearchResult[];
    relatedEvents: SearchResult[];
    confidence: number;
    sources: string[];
  }> {
    const { includeSimilar = true, timeRange } = options;
    
    // Check cache first
    const cacheKey = semanticCache.generateQueryKey(`context:${claim}`, options);
    const cached = semanticCache.getHistoricalContext(cacheKey);
    if (cached) {
      return cached;
    }
    
    // Search for direct matches with high threshold
    const directMatches = await this.semanticSearch(claim, {
      limit: 5,
      threshold: 0.8,
      type: 'history_event'
    });

    let relatedEvents: SearchResult[] = [];
    if (includeSimilar) {
      // Search for related content with lower threshold
      relatedEvents = await this.semanticSearch(claim, {
        limit: 10,
        threshold: 0.6,
        type: 'history_event'
      });
      
      // Remove duplicates from direct matches
      relatedEvents = relatedEvents.filter(
        related => !directMatches.some(direct => direct.id === related.id)
      );
    }

    // Filter by time range if provided
    if (timeRange) {
      const filterByTime = (results: SearchResult[]) => results.filter(result => {
        const year = result.metadata.year;
        return year !== undefined && year >= timeRange.start && year <= timeRange.end;
      });
      
      directMatches.splice(0, directMatches.length, ...filterByTime(directMatches));
      relatedEvents.splice(0, relatedEvents.length, ...filterByTime(relatedEvents));
    }

    // Calculate confidence based on matches
    const maxSimilarity = Math.max(
      ...directMatches.map(m => m.similarity),
      0
    );
    const confidence = maxSimilarity * (directMatches.length > 0 ? 1.0 : 0.5);

    // Extract sources
    const sources = [
      ...directMatches.map(m => m.metadata.title),
      ...relatedEvents.slice(0, 3).map(m => m.metadata.title)
    ];

    const result = {
      directMatches,
      relatedEvents: relatedEvents.slice(0, 5),
      confidence,
      sources
    };

    // Cache the result
    semanticCache.setHistoricalContext(cacheKey, result);

    return result;
  }

  /**
   * Get contextual information for a chapter
   */
  async getChapterContext(chapterId: string): Promise<{
    chapter?: BookChapter;
    relatedEvents: SearchResult[];
    relatedChapters: SearchResult[];
  }> {
    const chapter = await storage.getChapter(chapterId);
    if (!chapter) {
      return { relatedEvents: [], relatedChapters: [] };
    }

    const searchQuery = `${chapter.title} ${chapter.narrative}`;
    
    const [relatedEvents, relatedChapters] = await Promise.all([
      this.semanticSearch(searchQuery, {
        limit: 5,
        threshold: 0.6,
        type: 'history_event'
      }),
      this.semanticSearch(searchQuery, {
        limit: 3,
        threshold: 0.7,
        type: 'book_chapter'
      })
    ]);

    // Remove the current chapter from related chapters
    const filteredRelatedChapters = relatedChapters.filter(c => c.id !== chapterId);

    return {
      chapter,
      relatedEvents,
      relatedChapters: filteredRelatedChapters
    };
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Helper function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Refresh embeddings if content has been updated
   */
  async refreshEmbeddings(): Promise<void> {
    this.isInitialized = false;
    this.embeddedContent = [];
    await this.initialize();
  }
}

// Export singleton instance
export const semanticSearch = new SemanticSearchEngine();