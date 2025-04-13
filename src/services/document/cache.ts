/**
 * Document Cache Service
 * Handles document caching to improve loading performance
 */

import { Document } from './index';

// Cache expiration time - 15 minutes by default
const DEFAULT_CACHE_EXPIRATION = 15 * 60 * 1000; 

// Cache item interface
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

// Cache configuration interface
interface CacheConfig {
  maxSize: number;
  defaultExpiration: number;
}

// Document cache class
export class DocumentCache {
  private cache: Map<string, CacheItem<Document>>;
  private contentCache: Map<string, CacheItem<ArrayBuffer>>;
  private config: CacheConfig;

  constructor(config?: Partial<CacheConfig>) {
    this.cache = new Map();
    this.contentCache = new Map();
    this.config = {
      maxSize: config?.maxSize || 50, // Default to 50 documents
      defaultExpiration: config?.defaultExpiration || DEFAULT_CACHE_EXPIRATION
    };

    // Auto-cleanup interval every 5 minutes
    setInterval(() => this.cleanupExpiredItems(), 5 * 60 * 1000);
  }

  /**
   * Add document to cache
   * 
   * @param documentId Document ID
   * @param document Document to cache
   * @param expiration Optional custom expiration time in milliseconds
   */
  setDocument(documentId: string, document: Document, expiration?: number): void {
    // Enforce cache size limit - remove oldest items if needed
    if (this.cache.size >= this.config.maxSize) {
      this.removeOldestItems(1);
    }

    const expirationTime = expiration || this.config.defaultExpiration;
    
    this.cache.set(documentId, {
      data: document,
      timestamp: Date.now(),
      expiresAt: Date.now() + expirationTime
    });
  }

  /**
   * Get document from cache
   * 
   * @param documentId Document ID
   * @returns Document if found and not expired, null otherwise
   */
  getDocument(documentId: string): Document | null {
    const cachedItem = this.cache.get(documentId);
    
    if (!cachedItem) {
      return null;
    }
    
    // Check if expired
    if (cachedItem.expiresAt < Date.now()) {
      this.cache.delete(documentId);
      return null;
    }
    
    return cachedItem.data;
  }

  /**
   * Remove document from cache
   * 
   * @param documentId Document ID
   */
  removeDocument(documentId: string): void {
    this.cache.delete(documentId);
  }

  /**
   * Cache document content (binary data)
   * 
   * @param documentId Document ID
   * @param content Document binary content
   * @param expiration Optional custom expiration time in milliseconds
   */
  setDocumentContent(documentId: string, content: ArrayBuffer, expiration?: number): void {
    // Check if we need to make room in the content cache
    if (this.contentCache.size >= this.config.maxSize) {
      this.removeOldestContentItems(1);
    }

    const expirationTime = expiration || this.config.defaultExpiration;
    
    this.contentCache.set(documentId, {
      data: content,
      timestamp: Date.now(),
      expiresAt: Date.now() + expirationTime
    });
  }

  /**
   * Get document content from cache
   * 
   * @param documentId Document ID
   * @returns Document content if found and not expired, null otherwise
   */
  getDocumentContent(documentId: string): ArrayBuffer | null {
    const cachedItem = this.contentCache.get(documentId);
    
    if (!cachedItem) {
      return null;
    }
    
    // Check if expired
    if (cachedItem.expiresAt < Date.now()) {
      this.contentCache.delete(documentId);
      return null;
    }
    
    return cachedItem.data;
  }

  /**
   * Remove document content from cache
   * 
   * @param documentId Document ID
   */
  removeDocumentContent(documentId: string): void {
    this.contentCache.delete(documentId);
  }

  /**
   * Clear all cached documents and content
   */
  clearCache(): void {
    this.cache.clear();
    this.contentCache.clear();
  }

  /**
   * Get number of documents in cache
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Get number of document contents in cache
   */
  get contentSize(): number {
    return this.contentCache.size;
  }

  /**
   * Get IDs of all cached documents
   */
  getCachedDocumentIds(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Remove the oldest items from document cache
   * 
   * @param count Number of items to remove
   */
  private removeOldestItems(count: number): void {
    // Convert to array and sort by timestamp
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest items
    for (let i = 0; i < count && i < entries.length; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Remove the oldest items from content cache
   * 
   * @param count Number of items to remove
   */
  private removeOldestContentItems(count: number): void {
    // Convert to array and sort by timestamp
    const entries = Array.from(this.contentCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest items
    for (let i = 0; i < count && i < entries.length; i++) {
      this.contentCache.delete(entries[i][0]);
    }
  }

  /**
   * Remove all expired items from cache
   */
  private cleanupExpiredItems(): void {
    const now = Date.now();
    
    // Clean document cache - using Array.from to avoid iteration issues
    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (item.expiresAt < now) {
        this.cache.delete(key);
      }
    });
    
    // Clean content cache - using Array.from to avoid iteration issues
    Array.from(this.contentCache.entries()).forEach(([key, item]) => {
      if (item.expiresAt < now) {
        this.contentCache.delete(key);
      }
    });
  }
}

// Create a singleton instance for the application
const documentCache = new DocumentCache();

/**
 * Get the singleton document cache instance
 */
export const getDocumentCache = (): DocumentCache => {
  return documentCache;
};

/**
 * Cache a document and return it
 * 
 * @param documentId Document ID
 * @param document Document to cache
 * @param expiration Optional custom expiration time
 */
export const cacheDocument = (
  documentId: string,
  document: Document,
  expiration?: number
): Document => {
  documentCache.setDocument(documentId, document, expiration);
  return document;
};

/**
 * Get a document from cache if available, or use the fetcher function
 * 
 * @param documentId Document ID
 * @param fetcher Function to fetch the document if not in cache
 * @param options Cache options
 */
export const getDocumentWithCache = async (
  documentId: string,
  fetcher: () => Promise<Document>,
  options?: { skipCache?: boolean; expiration?: number }
): Promise<Document> => {
  // If skipCache is true, bypass cache and use fetcher
  if (options?.skipCache) {
    const document = await fetcher();
    // Still cache the result for future use
    documentCache.setDocument(documentId, document, options.expiration);
    return document;
  }
  
  // Try to get from cache first
  const cachedDocument = documentCache.getDocument(documentId);
  
  if (cachedDocument) {
    return cachedDocument;
  }
  
  // Not in cache, use fetcher
  const document = await fetcher();
  
  // Cache the result
  documentCache.setDocument(documentId, document, options?.expiration);
  
  return document;
};

/**
 * Cache document content (binary data)
 * 
 * @param documentId Document ID
 * @param content Document binary content
 * @param expiration Optional custom expiration time
 */
export const cacheDocumentContent = (
  documentId: string,
  content: ArrayBuffer,
  expiration?: number
): ArrayBuffer => {
  documentCache.setDocumentContent(documentId, content, expiration);
  return content;
};

/**
 * Get document content from cache if available, or use the fetcher function
 * 
 * @param documentId Document ID
 * @param fetcher Function to fetch the content if not in cache
 * @param options Cache options
 */
export const getDocumentContentWithCache = async (
  documentId: string,
  fetcher: () => Promise<ArrayBuffer>,
  options?: { skipCache?: boolean; expiration?: number }
): Promise<ArrayBuffer> => {
  // If skipCache is true, bypass cache and use fetcher
  if (options?.skipCache) {
    const content = await fetcher();
    // Still cache the result for future use
    documentCache.setDocumentContent(documentId, content, options.expiration);
    return content;
  }
  
  // Try to get from cache first
  const cachedContent = documentCache.getDocumentContent(documentId);
  
  if (cachedContent) {
    return cachedContent;
  }
  
  // Not in cache, use fetcher
  const content = await fetcher();
  
  // Cache the result
  documentCache.setDocumentContent(documentId, content, options?.expiration);
  
  return content;
};

export default {
  getDocumentCache,
  cacheDocument,
  getDocumentWithCache,
  cacheDocumentContent,
  getDocumentContentWithCache
}; 