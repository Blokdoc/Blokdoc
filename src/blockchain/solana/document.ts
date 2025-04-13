import { Connection, PublicKey, TransactionInstruction, SystemProgram, Transaction } from '@solana/web3.js';
import { BN } from '@project-serum/anchor';
import * as crypto from 'crypto';
import { getProgram, findDocumentManagerPDA, findDocumentPDA, findSignaturePDA } from './program';

// Document creation and management
export interface DocumentMetadata {
  name: string;
  documentType: string;
  hash: string;
  createdAt: number;
  owner: string;
  version: number;
  status: 'active' | 'archived';
}

/**
 * Creates a hash for a document.
 * 
 * @param content Document content as Buffer or string
 * @returns SHA-256 hash of the document
 */
export const createDocumentHash = (content: Buffer | string): string => {
  const hash = crypto.createHash('sha256');
  hash.update(typeof content === 'string' ? Buffer.from(content) : content);
  return hash.digest('hex');
};

/**
 * Registers a new document on the blockchain.
 * 
 * @param connection Solana connection
 * @param wallet Wallet for signing transactions
 * @param documentHash Hash of the document content
 * @param documentName Name of the document
 * @param documentType Type of the document (e.g., 'pdf', 'docx')
 * @returns Transaction signature
 */
export const registerDocument = async (
  connection: Connection,
  wallet: any,
  documentHash: string,
  documentName: string,
  documentType: string
): Promise<string> => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = await getProgram(connection, wallet);
    const [documentManagerPDA] = await findDocumentManagerPDA();
    
    // Fetch document count for creating the new PDA
    const documentManager = await program.account.documentManager.fetch(documentManagerPDA);
    const documentCount = documentManager.documentCount.toNumber();
    
    const [documentPDA] = await findDocumentPDA(wallet.publicKey, documentCount);
    
    // Current timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create and send transaction
    const tx = await program.methods
      .registerDocument(documentHash, documentName, documentType, new BN(timestamp))
      .accounts({
        documentManager: documentManagerPDA,
        document: documentPDA,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error registering document:', error);
    throw error;
  }
};

/**
 * Updates an existing document on the blockchain.
 * 
 * @param connection Solana connection
 * @param wallet Wallet for signing transactions
 * @param documentPDA Public key of the document account
 * @param documentHash New hash of the document content
 * @returns Transaction signature
 */
export const updateDocument = async (
  connection: Connection,
  wallet: any,
  documentPDA: PublicKey,
  documentHash: string
): Promise<string> => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = await getProgram(connection, wallet);
    
    // Current timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Create and send transaction
    const tx = await program.methods
      .updateDocument(documentHash, new BN(timestamp))
      .accounts({
        document: documentPDA,
        authority: wallet.publicKey,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

/**
 * Signs a document on the blockchain.
 * 
 * @param connection Solana connection
 * @param wallet Wallet for signing transactions
 * @param documentPDA Public key of the document account
 * @param signatureHash Hash of the signature content
 * @returns Transaction signature
 */
export const signDocument = async (
  connection: Connection,
  wallet: any,
  documentPDA: PublicKey,
  signatureHash: string
): Promise<string> => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = await getProgram(connection, wallet);
    const [signaturePDA] = await findSignaturePDA(documentPDA, wallet.publicKey);
    
    // Create and send transaction
    const tx = await program.methods
      .signDocument(signatureHash)
      .accounts({
        document: documentPDA,
        signature: signaturePDA,
        signer: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error signing document:', error);
    throw error;
  }
};

/**
 * Archives a document on the blockchain.
 * 
 * @param connection Solana connection
 * @param wallet Wallet for signing transactions
 * @param documentPDA Public key of the document account
 * @returns Transaction signature
 */
export const archiveDocument = async (
  connection: Connection,
  wallet: any,
  documentPDA: PublicKey
): Promise<string> => {
  try {
    if (!wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = await getProgram(connection, wallet);
    
    // Create and send transaction
    const tx = await program.methods
      .archiveDocument()
      .accounts({
        document: documentPDA,
        authority: wallet.publicKey,
      })
      .rpc();
    
    return tx;
  } catch (error) {
    console.error('Error archiving document:', error);
    throw error;
  }
};

/**
 * Retrieves a document from the blockchain.
 * 
 * @param connection Solana connection
 * @param documentPDA Public key of the document account
 * @returns Document data
 */
export const getDocument = async (
  connection: Connection,
  documentPDA: PublicKey
): Promise<DocumentMetadata> => {
  try {
    const program = await getProgram(connection, {});
    const document = await program.account.document.fetch(documentPDA);
    
    return {
      name: document.documentName,
      documentType: document.documentType,
      hash: document.documentHash,
      createdAt: document.timestamp.toNumber(),
      owner: document.authority.toString(),
      version: document.version,
      status: document.status.active ? 'active' : 'archived',
    };
  } catch (error) {
    console.error('Error fetching document:', error);
    throw error;
  }
}; 