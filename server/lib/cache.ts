import { LRUCache } from "lru-cache";

export interface CacheItem {
  data: any;
  timestamp: number;
  expires: number;
}

export class SemanticCache {
  private embeddings: LRUCache<string, number[]>;
  private searchResults: LRUCache<string, any>;
  private historicalContext: LRUCache<string, any>;
  
  constructor() {
    // Cache for embeddings (longer TTL since they change rarely)
    this.embeddings = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 60 * 24 // 24 hours
    });
    
    // Cache for search results (shorter TTL for freshness)
    this.searchResults = new LRUCache({
      max: 500,
      ttl: 1000 * 60 * 30 // 30 minutes
    });
    
    // Cache for historical context
    this.historicalContext = new LRUCache({
      max: 200,
      ttl: 1000 * 60 * 60 // 1 hour
    });
  }

  /**
   * Cache an embedding
   */
  setEmbedding(key: string, embedding: number[]): void {
    this.embeddings.set(key, embedding);
  }

  /**
   * Get cached embedding
   */
  getEmbedding(key: string): number[] | undefined {
    return this.embeddings.get(key);
  }

  /**
   * Cache search results
   */
  setSearchResults(queryKey: string, results: any): void {
    this.searchResults.set(queryKey, results);
  }

  /**
   * Get cached search results
   */
  getSearchResults(queryKey: string): any | undefined {
    return this.searchResults.get(queryKey);
  }

  /**
   * Cache historical context
   */
  setHistoricalContext(queryKey: string, context: any): void {
    this.historicalContext.set(queryKey, context);
  }

  /**
   * Get cached historical context
   */
  getHistoricalContext(queryKey: string): any | undefined {
    return this.historicalContext.get(queryKey);
  }

  /**
   * Generate cache key from query parameters
   */
  generateQueryKey(query: string, options: any = {}): string {
    return `${query}:${JSON.stringify(options)}`;
  }

  /**
   * Clear all caches
   */
  clearAll(): void {
    this.embeddings.clear();
    this.searchResults.clear();
    this.historicalContext.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): any {
    return {
      embeddings: {
        size: this.embeddings.size,
        calculatedSize: this.embeddings.calculatedSize
      },
      searchResults: {
        size: this.searchResults.size,
        calculatedSize: this.searchResults.calculatedSize
      },
      historicalContext: {
        size: this.historicalContext.size,
        calculatedSize: this.historicalContext.calculatedSize
      }
    };
  }
}

export const semanticCache = new SemanticCache();