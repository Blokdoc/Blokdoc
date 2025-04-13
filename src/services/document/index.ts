import { createDocumentHash, registerDocument, updateDocument, signDocument, archiveDocument, getDocument } from '@/blockchain/solana/document';
import { uploadToIPFS, getIPFSUrl, downloadFromIPFS } from '@/services/storage/ipfs';
import { uploadToArweave, getArweaveUrl, downloadFromArweave } from '@/services/storage/arweave';
import { Connection, PublicKey } from '@solana/web3.js';
import { DEVNET_ENDPOINT, SUPPORTED_FILE_TYPES, MAX_FILE_SIZE } from '@/utils/constants';

// Document types
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

/**
 * Check if file is valid for upload
 * 
 * @param file File to validate
 * @returns Whether the file is valid
 */
export const validateFile = (file: File): { valid: boolean; message?: string } => {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      message: `File size exceeds maximum allowed (${MAX_FILE_SIZE / (1024 * 1024)}MB)`,
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
 * Upload document to decentralized storage and register on blockchain
 * 
 * @param file Document file
 * @param wallet User's wallet for signing transactions
 * @param metadata Additional document metadata
 * @param options Upload options
 * @returns Document info with storage details
 */
export const uploadDocument = async (
  file: File,
  wallet: any,
  metadata: { name?: string; description?: string; tags?: string[] } = {},
  options: { preferredStorage?: 'ipfs' | 'arweave'; registerOnChain?: boolean } = {}
): Promise<Document> => {
  // Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
  // Read file content
  const fileContent = await readFileAsBuffer(file);
  
  // Create document hash
  const documentHash = createDocumentHash(fileContent);
  
  // Storage info
  const storageInfo: DocumentStorageInfo = {};
  
  // Upload to preferred storage
  if (!options.preferredStorage || options.preferredStorage === 'ipfs') {
    // Upload to IPFS
    const ipfsCid = await uploadToIPFS(fileContent, {
      filename: file.name,
      pinataMetadata: {
        name: metadata.name || file.name,
        keyvalues: {
          description: metadata.description || '',
          tags: metadata.tags?.join(',') || '',
          type: file.type,
          size: file.size.toString(),
        },
      },
    });
    storageInfo.ipfsCid = ipfsCid;
  } else if (options.preferredStorage === 'arweave') {
    // For Arweave, we would need a funded wallet
    // This is a simplified example - in a real app, this would be handled properly
    if (!wallet.arweaveJwk) {
      throw new Error('Arweave wallet is required for Arweave storage');
    }
    
    // Upload to Arweave
    const arweaveTxId = await uploadToArweave(
      fileContent,
      wallet.arweaveJwk,
      [
        { name: 'Content-Type', value: file.type },
        { name: 'App-Name', value: 'Blokdoc' },
        { name: 'Document-Name', value: metadata.name || file.name },
        { name: 'Document-Hash', value: documentHash },
      ]
    );
    storageInfo.arweaveTxId = arweaveTxId;
  }
  
  // Register on blockchain if required
  if (options.registerOnChain !== false) {
    // Create Solana connection
    const connection = new Connection(DEVNET_ENDPOINT);
    
    // Register document on Solana
    const solanaSignature = await registerDocument(
      connection,
      wallet,
      documentHash,
      metadata.name || file.name,
      file.type
    );
    
    storageInfo.solanaSignature = solanaSignature;
  }
  
  // Create document object
  const document: Document = {
    id: documentHash,
    name: metadata.name || file.name,
    description: metadata.description,
    fileType: file.type,
    fileSize: file.size,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    storageInfo,
    owner: wallet.publicKey?.toString() || '',
    version: 1,
    status: 'active',
    tags: metadata.tags,
    metadata: {
      originalName: file.name,
      lastModified: file.lastModified,
    },
  };
  
  return document;
};

/**
 * Download document from decentralized storage
 * 
 * @param document Document to download
 * @returns Buffer containing document data
 */
export const downloadDocument = async (document: Document): Promise<Buffer> => {
  // Try IPFS first if available
  if (document.storageInfo.ipfsCid) {
    try {
      return await downloadFromIPFS(document.storageInfo.ipfsCid);
    } catch (ipfsError) {
      console.error('IPFS download failed:', ipfsError);
      // Fall through to try Arweave
    }
  }
  
  // Try Arweave if available
  if (document.storageInfo.arweaveTxId) {
    try {
      return await downloadFromArweave(document.storageInfo.arweaveTxId);
    } catch (arweaveError) {
      console.error('Arweave download failed:', arweaveError);
      throw new Error('Failed to download document from any storage source');
    }
  }
  
  throw new Error('No valid storage information available for this document');
};

/**
 * Get document details from blockchain
 * 
 * @param documentPDA PDA of the document account
 * @param connection Solana connection
 * @returns Document metadata from blockchain
 */
export const getDocumentFromBlockchain = async (
  documentPDA: string,
  connection: Connection
): Promise<any> => {
  try {
    const publicKey = new PublicKey(documentPDA);
    return await getDocument(connection, publicKey);
  } catch (error) {
    console.error('Error getting document from blockchain:', error);
    throw error;
  }
};

/**
 * Update document on blockchain
 * 
 * @param document Document to update
 * @param newContent New document content
 * @param wallet User's wallet for signing
 * @param connection Solana connection
 * @returns Updated document
 */
export const updateDocumentContent = async (
  document: Document,
  newContent: Buffer | File,
  wallet: any,
  connection: Connection
): Promise<Document> => {
  // Read content as buffer if it's a File
  const contentBuffer = newContent instanceof File
    ? await readFileAsBuffer(newContent)
    : newContent;
  
  // Create document hash
  const documentHash = createDocumentHash(contentBuffer);
  
  // Update document on blockchain
  if (document.storageInfo.documentPDA) {
    const documentPDA = new PublicKey(document.storageInfo.documentPDA);
    
    const solanaSignature = await updateDocument(
      connection,
      wallet,
      documentPDA,
      documentHash
    );
    
    document.storageInfo.solanaSignature = solanaSignature;
  }
  
  // Update storage
  if (document.storageInfo.ipfsCid) {
    // Upload new version to IPFS
    const ipfsCid = await uploadToIPFS(contentBuffer, {
      filename: document.name,
      pinataMetadata: {
        name: document.name,
        keyvalues: {
          description: document.description || '',
          tags: document.tags?.join(',') || '',
          type: document.fileType,
          size: document.fileSize.toString(),
          version: (document.version + 1).toString(),
        },
      },
    });
    document.storageInfo.ipfsCid = ipfsCid;
  }
  
  // Update document object
  document.id = documentHash;
  document.updatedAt = Date.now();
  document.version += 1;
  
  return document;
};

/**
 * Helper to read file as Buffer
 * 
 * @param file File to read
 * @returns File content as Buffer
 */
const readFileAsBuffer = (file: File): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(Buffer.from(reader.result));
      } else {
        reject(new Error('Failed to read file as ArrayBuffer'));
      }
    };
    
    reader.onerror = () => {
      reject(reader.error || new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}; 