/**
 * Test Utilities and Helpers
 * Contains helper functions for testing the Blokdoc application
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { DEVNET_ENDPOINT } from '../../src/utils/constants';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Generate a test wallet for use in tests
 * 
 * @returns Test wallet keypair
 */
export const generateTestWallet = (): Keypair => {
  return Keypair.generate();
};

/**
 * Creates a test connection to Solana
 * 
 * @param endpoint Optional endpoint URL (defaults to devnet)
 * @returns Solana connection
 */
export const createTestConnection = (endpoint: string = DEVNET_ENDPOINT): Connection => {
  return new Connection(endpoint, 'confirmed');
};

/**
 * Creates a test document for use in tests
 * 
 * @returns Test document data
 */
export const createTestDocument = () => {
  return {
    id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: 'Test Document.pdf',
    description: 'This is a test document for unit tests',
    fileType: 'application/pdf',
    fileSize: 1024 * 1024, // 1MB
    createdAt: Date.now(),
    updatedAt: Date.now(),
    storageInfo: {
      ipfsCid: `Qm${crypto.randomBytes(44).toString('hex')}`,
      solanaSignature: crypto.randomBytes(32).toString('hex'),
      documentPDA: new PublicKey(Keypair.generate().publicKey).toString(),
    },
    owner: new PublicKey(Keypair.generate().publicKey).toString(),
    version: 1,
    status: 'active' as const,
    tags: ['test', 'document', 'pdf'],
  };
};

/**
 * Creates a test file in the system temp directory
 * 
 * @param filename Filename to create
 * @param content File content
 * @returns Path to created file
 */
export const createTestFile = (filename: string, content: string): string => {
  const tempDir = process.env.TEMP || process.env.TMP || '/tmp';
  const filePath = path.join(tempDir, filename);
  
  fs.writeFileSync(filePath, content);
  
  return filePath;
};

/**
 * Cleans up test files
 * 
 * @param filePath Path to file to clean up
 */
export const cleanupTestFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Mock document storage for testing
 */
export class MockDocumentStorage {
  private documents: Map<string, Buffer> = new Map();
  
  /**
   * Store a document
   * 
   * @param id Document ID
   * @param content Document content
   * @returns Storage location
   */
  store(id: string, content: Buffer): string {
    this.documents.set(id, content);
    return `mock://documents/${id}`;
  }
  
  /**
   * Retrieve a document
   * 
   * @param id Document ID
   * @returns Document content or null if not found
   */
  retrieve(id: string): Buffer | null {
    return this.documents.get(id) || null;
  }
  
  /**
   * Delete a document
   * 
   * @param id Document ID
   * @returns Whether document was deleted
   */
  delete(id: string): boolean {
    return this.documents.delete(id);
  }
  
  /**
   * List all stored documents
   * 
   * @returns Array of document IDs
   */
  list(): string[] {
    return Array.from(this.documents.keys());
  }
  
  /**
   * Clear all documents
   */
  clear(): void {
    this.documents.clear();
  }
}

/**
 * Wait for a specified amount of time
 * 
 * @param ms Milliseconds to wait
 * @returns Promise that resolves after the specified time
 */
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}; 