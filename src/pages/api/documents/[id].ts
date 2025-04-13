import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Document } from '@/services/document';

// Mock documents for demonstration purposes
const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc1',
    name: 'Project Proposal.pdf',
    description: 'Proposal for the new blockchain project',
    fileType: 'application/pdf',
    fileSize: 1204000,
    createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    storageInfo: {
      ipfsCid: 'QmX5hgmdkLZ6EGdELVMmfLJAKLUuXjdKGGn8G4xqhqKJ4r',
      solanaSignature: '5KZbHjKFuLUFVqsaHKaULDbP4Zy5SW46WXTRzKhxEJgM3KjMQwJK7t5F9n3mXYtU3EamdK5KPQHs4GaNL2YrJxDt',
      documentPDA: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ',
    },
    owner: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ',
    version: 2,
    status: 'active',
    tags: ['proposal', 'project', 'blockchain'],
  },
  {
    id: 'doc2',
    name: 'Meeting Notes.docx',
    description: 'Notes from the team meeting on blockchain security',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 853000,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    storageInfo: {
      ipfsCid: 'QmYXL4NpZA4PW4XzmPsxmvEWfEVNS6W6RF5rTh4QBKDJLe',
      arweaveTxId: 'ar:GDkzEnZXjP0n5OvpQ7FhyRMKMYzTvDHdLXgVZkVXkMc',
    },
    owner: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ',
    version: 1,
    status: 'active',
    tags: ['meeting', 'notes', 'security'],
  },
  {
    id: 'doc3',
    name: 'Smart Contract Audit.pdf',
    description: 'Security audit for the new smart contract',
    fileType: 'application/pdf',
    fileSize: 2548000,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
    storageInfo: {
      arweaveTxId: 'ar:XwPRHAYV_OhVXmSmPoy9n-LHNnXdPnVO_wPJCYRApJ8',
      solanaSignature: '4wry77oEhPS2MnKmALvjpRQKZgYvTjKZrRXmRLB7JqkzQ9Njy1jJXdBjxdvB1XHtKWwJqmzCBG4JYyGHnrZZMbdS',
    },
    owner: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ',
    version: 1,
    status: 'active',
    tags: ['audit', 'security', 'smart-contract'],
  },
];

type ResponseData = {
  success: boolean;
  data?: Document;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Get document ID from the URL
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid document ID',
    });
  }
  
  // Check authentication
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }
  
  // Find the document
  const document = MOCK_DOCUMENTS.find(doc => doc.id === id);
  
  if (!document) {
    return res.status(404).json({
      success: false,
      error: 'Document not found',
    });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res, document);
    case 'PUT':
      return handlePut(req, res, document);
    case 'DELETE':
      return handleDelete(req, res, document);
    default:
      return res.status(405).json({
        success: false,
        error: 'Method not allowed',
      });
  }
}

// Handle GET request - retrieve a single document
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  document: Document
) {
  try {
    // Add a slight delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch document',
    });
  }
}

// Handle PUT request - update a document
async function handlePut(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  document: Document
) {
  try {
    const { name, description, tags, status } = req.body;
    
    // Update document properties
    if (name) document.name = name;
    if (description !== undefined) document.description = description;
    if (tags) document.tags = tags;
    if (status) document.status = status;
    
    // Update timestamp
    document.updatedAt = Date.now();
    
    // Add a slight delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Error updating document:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update document',
    });
  }
}

// Handle DELETE request - delete a document
async function handleDelete(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
  document: Document
) {
  try {
    // In a real app, we would delete from a database
    // For now, just simulate success
    
    // Add a slight delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete document',
    });
  }
} 