// Document related types
export interface DocumentStorageInfo {
  ipfsCid?: string;
  arweaveTxId?: string;
  solanaSignature?: string;
  documentPDA?: string;
}

export interface Document {
  id: string;
  name: string;
  description?: string;
  fileType: string;
  fileSize: number;
  createdAt: number;
  updatedAt: number;
  storageInfo: DocumentStorageInfo;
  owner: string;
  version: number;
  status: 'active' | 'archived';
  collaborators?: string[];
  tags?: string[];
  metadata?: Record<string, any>;
}

// API Response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Upload related types
export enum UploadErrorType {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  VIRUS_DETECTED = 'VIRUS_DETECTED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface FileMetadata {
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
  uploadedBy: string;
  uploadedAt: Date;
  hash?: string;
}

export interface UploadResult {
  success: boolean;
  error?: Error;
  metadata: FileMetadata;
  storageLocation: string;
}

// Document content types
export interface DocumentStructure {
  headings: Array<{ level: number; text: string; position: number }>;
  paragraphs: Array<{ text: string; position: number }>;
  lists: Array<{ items: string[]; type: 'bulleted' | 'numbered'; position: number }>;
  tables: Array<{ headers?: string[]; rows: string[][]; position: number }>;
  images: Array<{ caption?: string; path: string; position: number }>;
  charts: Array<{ type: string; data: any; position: number }>;
  codeBlocks: Array<{ language: string; code: string; position: number }>;
}

export interface DocumentContent {
  title: string;
  content: string;
  structure: DocumentStructure;
  metadata: Record<string, any>;
  pages: number;
}

// Authentication types
export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  walletAddress?: string;
}

// Blockchain types
export interface BlockchainTransaction {
  signature: string;
  blockTime: number;
  successful: boolean;
  confirmations: number;
}

export interface DocumentVerification {
  verified: boolean;
  timestamp: number;
  documentHash: string;
  ownerAddress: string;
  transactions: BlockchainTransaction[];
} 