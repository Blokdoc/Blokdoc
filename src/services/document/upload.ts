/**
 * Document Upload Service
 * Handles secure file upload, validation, and virus scanning
 */

import { Document } from './index';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed file types and their corresponding MIME types
const ALLOWED_FILE_TYPES = {
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif'
};

// Upload error types
export enum UploadErrorType {
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VIRUS_DETECTED = 'VIRUS_DETECTED',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

// Upload error class
export class UploadError extends Error {
  type: UploadErrorType;
  details?: any;

  constructor(type: UploadErrorType, message: string, details?: any) {
    super(message);
    this.name = 'UploadError';
    this.type = type;
    this.details = details;
  }
}

// File metadata interface
export interface FileMetadata {
  originalName: string;
  size: number;
  mimeType: string;
  extension: string;
  hash?: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// Upload result interface
export interface UploadResult {
  success: boolean;
  document?: Document;
  metadata: FileMetadata;
  storageLocation: string;
  error?: UploadError;
}

/**
 * Validate file size
 * 
 * @param size File size in bytes
 * @param maxSize Maximum allowed size in bytes
 */
export const validateFileSize = (size: number, maxSize: number = MAX_FILE_SIZE): void => {
  if (size > maxSize) {
    throw new UploadError(
      UploadErrorType.FILE_TOO_LARGE,
      `File size (${(size / 1024 / 1024).toFixed(2)}MB) exceeds the maximum allowed size (${(maxSize / 1024 / 1024).toFixed(2)}MB)`,
      { size, maxSize }
    );
  }
};

/**
 * Validate file type based on extension and MIME type
 * 
 * @param fileName Filename with extension
 * @param mimeType File MIME type
 */
export const validateFileType = (fileName: string, mimeType: string): void => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  // Check if extension is in allowed list
  if (!Object.keys(ALLOWED_FILE_TYPES).includes(extension)) {
    throw new UploadError(
      UploadErrorType.INVALID_FILE_TYPE,
      `File type "${extension}" is not allowed`,
      { extension }
    );
  }
  
  // Check if MIME type is valid for the extension
  const expectedMimeType = ALLOWED_FILE_TYPES[extension as keyof typeof ALLOWED_FILE_TYPES];
  if (mimeType !== expectedMimeType) {
    throw new UploadError(
      UploadErrorType.INVALID_FILE_TYPE,
      `Invalid MIME type "${mimeType}" for extension "${extension}"`,
      { mimeType, extension, expected: expectedMimeType }
    );
  }
};

/**
 * Scan file for viruses
 * 
 * @param fileBuffer File content as buffer
 * @returns Promise that resolves to boolean (true if file is safe)
 */
export const scanForViruses = async (fileBuffer: Buffer): Promise<boolean> => {
  // In a real implementation, this would integrate with a virus scanning service
  // This is a mock implementation for demonstration purposes
  return new Promise((resolve) => {
    // Simulate virus scanning process
    setTimeout(() => {
      // Mock: 99.9% of files are clean
      const isSafe = Math.random() > 0.001;
      resolve(isSafe);
    }, 1000);
  });
};

/**
 * Calculate file hash for integrity verification
 * 
 * @param fileBuffer File content as buffer
 * @returns SHA-256 hash of the file
 */
export const calculateFileHash = async (fileBuffer: Buffer): Promise<string> => {
  // In a real implementation, this would use crypto library
  // This is a mock implementation for demonstration purposes
  return new Promise((resolve) => {
    // Simulate hash calculation
    setTimeout(() => {
      // Generate a random hash for demonstration
      const hash = Array.from(
        { length: 64 },
        () => Math.floor(Math.random() * 16).toString(16)
      ).join('');
      
      resolve(hash);
    }, 300);
  });
};

/**
 * Store file in secure storage
 * 
 * @param fileBuffer File content as buffer
 * @param metadata File metadata
 * @returns Storage location identifier
 */
export const storeFile = async (fileBuffer: Buffer, metadata: FileMetadata): Promise<string> => {
  // In a real implementation, this would upload to a storage service
  // This is a mock implementation for demonstration purposes
  return new Promise((resolve) => {
    // Simulate storage process
    setTimeout(() => {
      // Generate a storage location
      const storageId = `storage/${metadata.uploadedBy}/${Date.now()}-${metadata.originalName}`;
      resolve(storageId);
    }, 800);
  });
};

/**
 * Process and validate file upload
 * 
 * @param file File object with buffer content
 * @param fileName Original file name
 * @param mimeType File MIME type
 * @param size File size in bytes
 * @param uploadedBy User identifier who uploaded the file
 */
export const processFileUpload = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  size: number,
  uploadedBy: string
): Promise<UploadResult> => {
  try {
    // 1. Validate file size
    validateFileSize(size);
    
    // 2. Validate file type
    validateFileType(fileName, mimeType);
    
    // 3. Scan for viruses
    const isSafe = await scanForViruses(fileBuffer);
    
    if (!isSafe) {
      throw new UploadError(
        UploadErrorType.VIRUS_DETECTED,
        'Potential security threat detected in the file',
        { fileName }
      );
    }
    
    // 4. Calculate file hash for integrity
    const hash = await calculateFileHash(fileBuffer);
    
    // 5. Create file metadata
    const metadata: FileMetadata = {
      originalName: fileName,
      size,
      mimeType,
      extension: fileName.split('.').pop()?.toLowerCase() || '',
      hash,
      uploadedBy,
      uploadedAt: new Date()
    };
    
    // 6. Store file
    const storageLocation = await storeFile(fileBuffer, metadata);
    
    // 7. Create document record 
    const document: Document = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: fileName,
      description: '',
      fileType: metadata.extension,
      fileSize: size,
      createdAt: metadata.uploadedAt,
      updatedAt: metadata.uploadedAt,
      storageInfo: {
        location: storageLocation,
        hash,
        originalName: fileName
      },
      owner: uploadedBy,
      version: 1,
      status: 'processing', // Initial status, will be updated after processing
      tags: []
    };
    
    return {
      success: true,
      document,
      metadata,
      storageLocation
    };
    
  } catch (error) {
    // Handle specific upload errors
    if (error instanceof UploadError) {
      return {
        success: false,
        error: error,
        metadata: {
          originalName: fileName,
          size,
          mimeType,
          extension: fileName.split('.').pop()?.toLowerCase() || '',
          uploadedBy,
          uploadedAt: new Date()
        },
        storageLocation: ''
      };
    }
    
    // Handle other errors
    return {
      success: false,
      error: new UploadError(
        UploadErrorType.UPLOAD_FAILED,
        'File upload failed',
        { originalError: error }
      ),
      metadata: {
        originalName: fileName,
        size,
        mimeType,
        extension: fileName.split('.').pop()?.toLowerCase() || '',
        uploadedBy,
        uploadedAt: new Date()
      },
      storageLocation: ''
    };
  }
};

/**
 * Generate a pre-signed URL for direct upload (client-side)
 * 
 * @param fileName Original file name
 * @param mimeType File MIME type
 * @param size File size in bytes
 * @param uploadedBy User identifier
 * @param expirationSeconds URL expiration time in seconds
 */
export const generatePreSignedUploadUrl = async (
  fileName: string,
  mimeType: string,
  size: number,
  uploadedBy: string,
  expirationSeconds: number = 300
): Promise<{url: string, expires: Date, fields: Record<string, string>}> => {
  // Validate file size and type first
  validateFileSize(size);
  validateFileType(fileName, mimeType);
  
  // In a real implementation, this would generate a pre-signed URL for direct upload
  // This is a mock implementation for demonstration purposes
  return new Promise((resolve) => {
    // Simulate URL generation
    setTimeout(() => {
      const expires = new Date(Date.now() + expirationSeconds * 1000);
      
      resolve({
        url: `https://api.example.com/upload/${uploadedBy}/${Date.now()}-${fileName}`,
        expires,
        fields: {
          'Content-Type': mimeType,
          'x-amz-meta-originalname': fileName,
          'x-amz-meta-uploadedby': uploadedBy
        }
      });
    }, 300);
  });
};

export default {
  processFileUpload,
  validateFileSize,
  validateFileType,
  scanForViruses,
  generatePreSignedUploadUrl
}; 