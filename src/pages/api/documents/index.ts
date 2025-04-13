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
  data?: Document[] | Document;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Check authentication
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  
  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return handleGet(req, res);
    case 'POST':
      return handlePost(req, res);
    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

// Handle GET request - retrieve documents
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    // In a real app, we would fetch from a database
    // For now, using mock data
    
    // Implement query parameters for filtering
    const { tag, search, status } = req.query;
    
    let filteredDocuments = [...MOCK_DOCUMENTS];
    
    // Filter by tag if provided
    if (tag) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.tags?.includes(tag as string)
      );
    }
    
    // Filter by search term if provided
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.name.toLowerCase().includes(searchTerm) || 
        doc.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filter by status if provided
    if (status) {
      filteredDocuments = filteredDocuments.filter(doc => 
        doc.status === status
      );
    }
    
    // Add a slight delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return res.status(200).json({
      success: true,
      data: filteredDocuments,
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch documents',
    });
  }
}

// Handle POST request - create a new document
async function handlePost(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const { name, description, fileType, fileSize, storageInfo, tags } = req.body;
    
    // Validate required fields
    if (!name || !fileType || !fileSize || !storageInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
      });
    }
    
    // Create a new document
    const newDocument: Document = {
      id: `doc${Date.now()}`, // Generate a unique ID
      name,
      description,
      fileType,
      fileSize,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      storageInfo,
      owner: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ', // In a real app, this would be the user's wallet address
      version: 1,
      status: 'active',
      tags,
    };
    
    // In a real app, we would save to a database
    // For now, just simulate success
    
    // Add a slight delay to simulate network latency
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return res.status(201).json({
      success: true,
      data: newDocument,
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create document',
    });
  }
} 