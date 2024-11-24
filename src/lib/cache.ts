interface CacheItem<T> {
  value: T;
  timestamp: number;
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();

  set<T>(key: string, value: T, ttl: number): void {
    this.cache.set(key, {
      value,
      timestamp: Date.now() + (ttl * 1000), // Convert TTL from seconds to milliseconds
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if the item has expired
    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    // Check if the item has expired
    if (Date.now() > item.timestamp) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();
