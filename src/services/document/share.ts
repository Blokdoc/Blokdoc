/**
 * Document Sharing Service
 * Handles document sharing and permissions management
 */

import { Document } from './index';
import { Connection, PublicKey } from '@solana/web3.js';
import { DEVNET_ENDPOINT } from '@/utils/constants';

// Permission levels
export enum PermissionLevel {
  VIEWER = 'viewer',
  COMMENTER = 'commenter',
  EDITOR = 'editor',
  OWNER = 'owner'
}

// Share details interface
export interface ShareDetails {
  documentId: string;
  recipientId: string;  // Wallet address or user identifier
  permissionLevel: PermissionLevel;
  expiresAt?: number;   // Optional expiration timestamp
  sharedAt: number;
  sharedBy: string;     // Sharer's wallet address
  transactionId?: string; // Blockchain transaction ID if applicable
}

// Share invitation interface
export interface ShareInvitation {
  id: string;
  documentId: string;
  documentName: string;
  permissionLevel: PermissionLevel;
  invitedBy: string;
  invitedAt: number;
  expiresAt?: number;
  status: 'pending' | 'accepted' | 'declined';
}

// List of mock share invitations for development
const MOCK_SHARE_INVITATIONS: ShareInvitation[] = [
  {
    id: 'invite1',
    documentId: 'doc1',
    documentName: 'Project Proposal.pdf',
    permissionLevel: PermissionLevel.EDITOR,
    invitedBy: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ',
    invitedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    status: 'pending'
  },
  {
    id: 'invite2',
    documentId: 'doc2',
    documentName: 'Meeting Notes.docx',
    permissionLevel: PermissionLevel.VIEWER,
    invitedBy: 'CzkTZfeYNJYBPdEYJQ3SVnKFMmN8gPHNGSrZLwuwVqrM',
    invitedAt: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
    status: 'accepted'
  }
];

/**
 * Get the permission level for a user on a document
 * 
 * @param documentId Document ID
 * @param userId User wallet address
 * @returns Permission level or null if no access
 */
export const getPermissionLevel = async (
  documentId: string,
  userId: string
): Promise<PermissionLevel | null> => {
  try {
    // In a real implementation, this would query a database or blockchain
    // For mock purposes, always return VIEWER unless it's the document owner
    if (userId === 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ') {
      return PermissionLevel.OWNER;
    }
    
    return PermissionLevel.VIEWER;
  } catch (error) {
    console.error('Error getting permission level:', error);
    return null;
  }
};

/**
 * Check if user has permission to perform an action on a document
 * 
 * @param documentId Document ID
 * @param userId User wallet address
 * @param requiredPermission Required permission level
 * @returns Whether user has the required permission
 */
export const hasPermission = async (
  documentId: string,
  userId: string,
  requiredPermission: PermissionLevel
): Promise<boolean> => {
  const userPermission = await getPermissionLevel(documentId, userId);
  
  if (!userPermission) return false;
  
  // Permission hierarchy: OWNER > EDITOR > COMMENTER > VIEWER
  switch (requiredPermission) {
    case PermissionLevel.VIEWER:
      return true; // All permission levels can view
    case PermissionLevel.COMMENTER:
      return userPermission !== PermissionLevel.VIEWER;
    case PermissionLevel.EDITOR:
      return userPermission === PermissionLevel.EDITOR || userPermission === PermissionLevel.OWNER;
    case PermissionLevel.OWNER:
      return userPermission === PermissionLevel.OWNER;
    default:
      return false;
  }
};

/**
 * Share a document with another user
 * 
 * @param document Document to share
 * @param recipientId Recipient wallet address
 * @param permissionLevel Permission level to grant
 * @param wallet Sender's wallet for signing
 * @param expiresIn Optional expiration time in milliseconds
 * @returns Share details
 */
export const shareDocument = async (
  document: Document,
  recipientId: string,
  permissionLevel: PermissionLevel,
  wallet: any,
  expiresIn?: number
): Promise<ShareDetails> => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    // Ensure user has permission to share
    const canShare = await hasPermission(document.id, wallet.publicKey.toString(), PermissionLevel.EDITOR);
    
    if (!canShare) {
      throw new Error('You do not have permission to share this document');
    }
    
    // Calculate expiration time if provided
    const expiresAt = expiresIn ? Date.now() + expiresIn : undefined;
    
    // In a real implementation, this would update a database and possibly create a blockchain transaction
    // For now, return mock share details
    
    // Create share details
    const shareDetails: ShareDetails = {
      documentId: document.id,
      recipientId: recipientId,
      permissionLevel: permissionLevel,
      expiresAt: expiresAt,
      sharedAt: Date.now(),
      sharedBy: wallet.publicKey.toString(),
    };
    
    // Optionally record sharing on blockchain
    const connection = new Connection(DEVNET_ENDPOINT);
    // This would be implemented in a real application to record the share on chain
    
    return shareDetails;
  } catch (error) {
    console.error('Error sharing document:', error);
    throw error;
  }
};

/**
 * Get pending share invitations for a user
 * 
 * @param userId User wallet address
 * @returns List of pending share invitations
 */
export const getPendingInvitations = async (userId: string): Promise<ShareInvitation[]> => {
  try {
    // In a real implementation, this would query a database
    // For now, return mock invitations
    
    return MOCK_SHARE_INVITATIONS.filter(invitation => invitation.status === 'pending');
  } catch (error) {
    console.error('Error fetching pending invitations:', error);
    return [];
  }
};

/**
 * Respond to a share invitation
 * 
 * @param invitationId Invitation ID
 * @param accept Whether to accept or decline
 * @param wallet User's wallet for signing
 * @returns Updated invitation
 */
export const respondToInvitation = async (
  invitationId: string,
  accept: boolean,
  wallet: any
): Promise<ShareInvitation | null> => {
  try {
    // In a real implementation, this would update a database and possibly create a blockchain transaction
    
    // Find the invitation
    const invitation = MOCK_SHARE_INVITATIONS.find(inv => inv.id === invitationId);
    
    if (!invitation) {
      return null;
    }
    
    // Update invitation status
    invitation.status = accept ? 'accepted' : 'declined';
    
    return invitation;
  } catch (error) {
    console.error('Error responding to invitation:', error);
    return null;
  }
};

/**
 * Revoke a user's access to a document
 * 
 * @param documentId Document ID
 * @param userId User wallet address to revoke
 * @param wallet Owner's wallet for signing
 * @returns Whether revocation was successful
 */
export const revokeAccess = async (
  documentId: string,
  userId: string,
  wallet: any
): Promise<boolean> => {
  try {
    // Ensure user has permission to revoke
    const canRevoke = await hasPermission(documentId, wallet.publicKey.toString(), PermissionLevel.OWNER);
    
    if (!canRevoke) {
      throw new Error('Only the document owner can revoke access');
    }
    
    // In a real implementation, this would update a database and possibly create a blockchain transaction
    // For now, return success
    
    return true;
  } catch (error) {
    console.error('Error revoking access:', error);
    return false;
  }
};

/**
 * Get all users who have access to a document
 * 
 * @param documentId Document ID
 * @param wallet Owner's wallet for querying
 * @returns List of users and their permission levels
 */
export const getDocumentShares = async (
  documentId: string,
  wallet: any
): Promise<{ userId: string; permissionLevel: PermissionLevel }[]> => {
  try {
    // Ensure user has permission to view shares
    const canViewShares = await hasPermission(documentId, wallet.publicKey.toString(), PermissionLevel.OWNER);
    
    if (!canViewShares) {
      throw new Error('Only the document owner can view all shares');
    }
    
    // In a real implementation, this would query a database
    // For now, return mock data
    
    return [
      { userId: 'CzkTZfeYNJYBPdEYJQ3SVnKFMmN8gPHNGSrZLwuwVqrM', permissionLevel: PermissionLevel.EDITOR },
      { userId: 'HNpdP4MPUmjnFRmhG5oi5YU3A5GnMxgNUVEwAJ7z4QXJ', permissionLevel: PermissionLevel.VIEWER },
      { userId: 'FZzFj3Z5V3SJzF6Nbkmq6JUUoq2SJwKMSmSz5VtfnEVn', permissionLevel: PermissionLevel.COMMENTER },
    ];
  } catch (error) {
    console.error('Error getting document shares:', error);
    return [];
  }
};

/**
 * Create a public share link for a document
 * 
 * @param documentId Document ID
 * @param wallet Owner's wallet for signing
 * @param expiresIn Optional expiration time in milliseconds
 * @returns Public share link
 */
export const createPublicShareLink = async (
  documentId: string,
  wallet: any,
  expiresIn?: number
): Promise<string> => {
  try {
    // Ensure user has permission to create share link
    const canCreateLink = await hasPermission(documentId, wallet.publicKey.toString(), PermissionLevel.OWNER);
    
    if (!canCreateLink) {
      throw new Error('Only the document owner can create public share links');
    }
    
    // Calculate expiration time if provided
    const expiresAt = expiresIn ? Date.now() + expiresIn : undefined;
    
    // In a real implementation, this would create a database entry and generate a unique ID
    // For now, create a mock link
    
    const linkId = Math.random().toString(36).substring(2, 15);
    const baseUrl = 'https://app.blokdoc.io/share';
    
    // In an actual implementation, this would be encrypted and include authentication parameters
    return `${baseUrl}/${documentId}/${linkId}${expiresAt ? `?expires=${expiresAt}` : ''}`;
  } catch (error) {
    console.error('Error creating public share link:', error);
    throw error;
  }
};

export default {
  getPermissionLevel,
  hasPermission,
  shareDocument,
  getPendingInvitations,
  respondToInvitation,
  revokeAccess,
  getDocumentShares,
  createPublicShareLink
}; 