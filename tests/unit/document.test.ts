import { validateFile, createDocumentHash } from '../../src/services/document';
import { MAX_FILE_SIZE, SUPPORTED_FILE_TYPES } from '../../src/utils/constants';

describe('Document Service', () => {
  describe('validateFile', () => {
    test('should validate a valid file', () => {
      const file = {
        name: 'test-document.pdf',
        size: 1024 * 1024, // 1MB
        type: 'application/pdf'
      } as File;
      
      const result = validateFile(file);
      expect(result.valid).toBe(true);
      expect(result.message).toBeUndefined();
    });
    
    test('should reject a file that exceeds size limit', () => {
      const file = {
        name: 'large-document.pdf',
        size: MAX_FILE_SIZE + 1024, // Exceeds max size
        type: 'application/pdf'
      } as File;
      
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('size exceeds');
    });
    
    test('should reject a file with unsupported type', () => {
      const file = {
        name: 'invalid-file.xyz',
        size: 1024 * 1024,
        type: 'application/xyz' // Unsupported type
      } as File;
      
      const result = validateFile(file);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('not supported');
    });
  });
  
  describe('createDocumentHash', () => {
    test('should create a hash from string content', () => {
      const content = 'test document content';
      const hash = createDocumentHash(content);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 produces 64 character hex string
    });
    
    test('should create a hash from Buffer content', () => {
      const content = Buffer.from('test document content');
      const hash = createDocumentHash(content);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64);
    });
    
    test('should create the same hash for identical content', () => {
      const content1 = 'test document content';
      const content2 = 'test document content';
      
      const hash1 = createDocumentHash(content1);
      const hash2 = createDocumentHash(content2);
      
      expect(hash1).toBe(hash2);
    });
    
    test('should create different hashes for different content', () => {
      const content1 = 'test document content';
      const content2 = 'different document content';
      
      const hash1 = createDocumentHash(content1);
      const hash2 = createDocumentHash(content2);
      
      expect(hash1).not.toBe(hash2);
    });
  });
}); 