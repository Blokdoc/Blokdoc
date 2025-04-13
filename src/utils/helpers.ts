/**
 * Helper utility functions for common operations
 */

import { SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from './constants';

/**
 * Format file size to a human-readable string
 * 
 * @param bytes Size in bytes
 * @param decimals Number of decimal places
 * @returns Formatted size string with units
 */
export const formatFileSize = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/**
 * Format date to a human-readable string
 * 
 * @param timestamp Timestamp in milliseconds
 * @returns Formatted date string
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Truncate a string to a specified length
 * 
 * @param str String to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated string
 */
export const truncateString = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Truncate wallet address for display
 * 
 * @param address Wallet address to truncate
 * @returns Truncated address (e.g., "Ax7d...j9kF")
 */
export const truncateAddress = (address: string): string => {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
};

/**
 * Validate a file against size and type constraints
 * 
 * @param file File to validate
 * @returns Object with validation results
 */
export const validateFile = (file: File): { valid: boolean; message?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `File size exceeds maximum allowed (${formatFileSize(MAX_FILE_SIZE)})`,
    };
  }
  
  // Check file type
  if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: `File type ${file.type} is not supported`,
    };
  }
  
  return { valid: true };
};

/**
 * Extract file extension from file name
 * 
 * @param fileName File name
 * @returns File extension without the dot
 */
export const getFileExtension = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

/**
 * Convert a file to Base64 string
 * 
 * @param file File to convert
 * @returns Promise that resolves with Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to Base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Convert a file to ArrayBuffer
 * 
 * @param file File to convert
 * @returns Promise that resolves with ArrayBuffer
 */
export const fileToArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to ArrayBuffer'));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Generate a random ID
 * 
 * @returns Random ID string
 */
export const generateId = (prefix = 'id'): string => {
  return `${prefix}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Deep clone an object
 * 
 * @param obj Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Wait for a specified amount of time
 * 
 * @param ms Time to wait in milliseconds
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
}; 