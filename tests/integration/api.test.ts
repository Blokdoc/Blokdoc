import { createMocks } from 'node-mocks-http';
import documentsHandler from '../../src/pages/api/documents';
import { getSession } from 'next-auth/react';

// Mock the next-auth session
jest.mock('next-auth/react');

describe('Documents API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  
  describe('GET /api/documents', () => {
    test('should return 401 if not authenticated', async () => {
      // Mock unauthenticated session
      (getSession as jest.Mock).mockResolvedValueOnce(null);
      
      const { req, res } = createMocks({
        method: 'GET',
      });
      
      await documentsHandler(req, res);
      
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });
    
    test('should return documents if authenticated', async () => {
      // Mock authenticated session
      (getSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'user@example.com', id: 'user123' }
      });
      
      const { req, res } = createMocks({
        method: 'GET',
      });
      
      await documentsHandler(req, res);
      
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          success: true,
          data: expect.any(Array)
        })
      );
    });
    
    test('should filter documents by tag', async () => {
      // Mock authenticated session
      (getSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'user@example.com', id: 'user123' }
      });
      
      const { req, res } = createMocks({
        method: 'GET',
        query: { tag: 'proposal' }
      });
      
      await documentsHandler(req, res);
      
      expect(res.statusCode).toBe(200);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      
      // All returned documents should have the 'proposal' tag
      responseData.data.forEach((doc: any) => {
        expect(doc.tags).toContain('proposal');
      });
    });
  });
  
  describe('POST /api/documents', () => {
    test('should create a new document', async () => {
      // Mock authenticated session
      (getSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'user@example.com', id: 'user123' }
      });
      
      const newDocument = {
        name: 'Test Document',
        description: 'Test description',
        tags: ['test', 'document']
      };
      
      const { req, res } = createMocks({
        method: 'POST',
        body: newDocument
      });
      
      await documentsHandler(req, res);
      
      expect(res.statusCode).toBe(201);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(true);
      expect(responseData.data).toMatchObject({
        name: newDocument.name,
        description: newDocument.description,
        tags: newDocument.tags
      });
      
      // Check for auto-generated fields
      expect(responseData.data.id).toBeDefined();
      expect(responseData.data.createdAt).toBeDefined();
      expect(responseData.data.updatedAt).toBeDefined();
    });
    
    test('should return 400 for invalid document data', async () => {
      // Mock authenticated session
      (getSession as jest.Mock).mockResolvedValueOnce({
        user: { email: 'user@example.com', id: 'user123' }
      });
      
      const invalidDocument = {
        // Missing required name field
        description: 'Test description',
        tags: ['test', 'document']
      };
      
      const { req, res } = createMocks({
        method: 'POST',
        body: invalidDocument
      });
      
      await documentsHandler(req, res);
      
      expect(res.statusCode).toBe(400);
      
      const responseData = JSON.parse(res._getData());
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBeDefined();
    });
  });
}); 