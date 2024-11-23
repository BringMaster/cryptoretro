interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheItem<any>>;
  
  private constructor() {
    this.cache = new Map();
    this.loadFromLocalStorage();
    window.addEventListener('beforeunload', () => this.saveToLocalStorage());
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  private loadFromLocalStorage() {
    try {
      const savedCache = localStorage.getItem('cryptoretro_cache');
      if (savedCache) {
        const parsed = JSON.parse(savedCache);
        Object.entries(parsed).forEach(([key, value]) => {
          this.cache.set(key, value as CacheItem<any>);
        });
        this.cleanExpiredItems();
      }
    } catch (error) {
      console.error('Error loading cache from localStorage:', error);
      this.cache.clear();
    }
  }

  private saveToLocalStorage() {
    try {
      const cacheObj = Object.fromEntries(this.cache.entries());
      localStorage.setItem('cryptoretro_cache', JSON.stringify(cacheObj));
    } catch (error) {
      console.error('Error saving cache to localStorage:', error);
    }
  }

  private cleanExpiredItems() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  public get<T>(key: string): T | null {
    this.cleanExpiredItems();
    const item = this.cache.get(key);
    if (!item) return null;
    return item.data;
  }

  public set<T>(key: string, data: T, ttlSeconds: number = 60) {
    const timestamp = Date.now();
    const expiry = timestamp + (ttlSeconds * 1000);
    this.cache.set(key, { data, timestamp, expiry });
    this.saveToLocalStorage();
  }

  public getTimestamp(key: string): number | null {
    const item = this.cache.get(key);
    return item ? item.timestamp : null;
  }

  public clear() {
    this.cache.clear();
    localStorage.removeItem('cryptoretro_cache');
  }
}

export const cacheService = CacheService.getInstance();
