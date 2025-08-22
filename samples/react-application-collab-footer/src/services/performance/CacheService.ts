import { Log } from '@microsoft/sp-core-library';
import { CACHE_CONSTANTS } from '../../extensions/collaborationFooter/constants/ApplicationConstants';

const LOG_SOURCE: string = 'CacheService';

export interface ICacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  invalidate(key: string): Promise<void>;
  invalidatePattern(pattern: string): Promise<void>;
  clear(): Promise<void>;
  getStats(): Promise<ICacheStats>;
}

export interface ICacheStats {
  totalKeys: number;
  hitRate: number;
  totalHits: number;
  totalMisses: number;
  memoryUsage: number;
}

/**
 * In-memory cache service with TTL support and performance monitoring
 * Provides fast caching for SharePoint and Graph API responses
 */
export class MemoryCacheService implements ICacheService {
  private cache = new Map<string, ICacheItem<any>>();
  private stats = {
    hits: 0,
    misses: 0,
    sets: 0,
    invalidations: 0
  };
  private readonly DEFAULT_TTL = CACHE_CONSTANTS.DEFAULT_TTL;
  private readonly MAX_CACHE_SIZE = CACHE_CONSTANTS.MAX_CACHE_SIZE;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Start periodic cleanup of expired items
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredItems();
    }, CACHE_CONSTANTS.CLEANUP_INTERVAL);

    Log.info(LOG_SOURCE, 'MemoryCacheService initialized');
  }

  /**
   * Get cached item if it exists and hasn't expired
   */
  public async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      Log.verbose(LOG_SOURCE, `Cache miss for key: ${key}`);
      return null;
    }

    // Check if item has expired
    if (Date.now() > item.timestamp + item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      Log.verbose(LOG_SOURCE, `Cache expired for key: ${key}`);
      return null;
    }

    this.stats.hits++;
    Log.verbose(LOG_SOURCE, `Cache hit for key: ${key}`);
    return item.data as T;
  }

  /**
   * Set cache item with optional TTL
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // If cache is at max size, remove oldest item
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        Log.verbose(LOG_SOURCE, `Evicted oldest cache item: ${firstKey}`);
      }
    }

    const cacheItem: ICacheItem<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    };

    this.cache.set(key, cacheItem);
    this.stats.sets++;
    Log.verbose(LOG_SOURCE, `Cached item with key: ${key}, TTL: ${cacheItem.ttl}ms`);
  }

  /**
   * Invalidate specific cache key
   */
  public async invalidate(key: string): Promise<void> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.invalidations++;
      Log.verbose(LOG_SOURCE, `Invalidated cache key: ${key}`);
    }
  }

  /**
   * Invalidate all keys matching a pattern (simple wildcard support)
   */
  public async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      this.stats.invalidations++;
    }

    Log.verbose(LOG_SOURCE, `Invalidated ${keysToDelete.length} keys matching pattern: ${pattern}`);
  }

  /**
   * Clear all cached items
   */
  public async clear(): Promise<void> {
    const size = this.cache.size;
    this.cache.clear();
    this.stats.invalidations += size;
    Log.info(LOG_SOURCE, `Cleared all ${size} cached items`);
  }

  /**
   * Get cache performance statistics
   */
  public async getStats(): Promise<ICacheStats> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    // Estimate memory usage (rough calculation)
    const memoryUsage = JSON.stringify([...this.cache.entries()]).length;

    return {
      totalKeys: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      memoryUsage
    };
  }

  /**
   * Cleanup expired items from cache
   */
  private cleanupExpiredItems(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, item] of this.cache.entries()) {
      if (now > item.timestamp + item.ttl) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      Log.verbose(LOG_SOURCE, `Cleaned up ${keysToDelete.length} expired cache items`);
    }
  }

  /**
   * Destroy the cache service and cleanup intervals
   */
  public destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    Log.info(LOG_SOURCE, 'MemoryCacheService destroyed');
  }
}

/**
 * Cache key utility functions
 */
export class CacheKeys {
  public static readonly SHARED_LINKS = 'shared-links';
  public static readonly PERSONAL_LINKS = 'personal-links';
  public static readonly USER_PROFILE = 'user-profile';
  public static readonly TAXONOMY_TERMS = 'taxonomy-terms';
  public static readonly SITE_INFO = 'site-info';

  public static userSpecific(baseKey: string, userId: string): string {
    return `${baseKey}:user:${userId}`;
  }

  public static siteSpecific(baseKey: string, siteId: string): string {
    return `${baseKey}:site:${siteId}`;
  }

  public static listSpecific(baseKey: string, listId: string): string {
    return `${baseKey}:list:${listId}`;
  }

  public static timestamped(baseKey: string): string {
    return `${baseKey}:${Date.now()}`;
  }
}

// Singleton instance for global use
export const cacheService = new MemoryCacheService();