import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as crypto from 'crypto';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { DEVNET_ENDPOINT } from '@/utils/constants';

// Document verification interface
export interface DocumentVerification {
  documentHash: string;
  timestamp: number;
  owner: string;
  signature: string;
  transactionId: string;
}

// NFT Document interface
export interface DocumentNFT {
  mint: string;
  tokenAccount: string;
  metadataUri: string;
  owner: string;
  name: string;
  symbol: string;
  transactionId: string;
}

/**
 * Generates a SHA-256 hash of the document content
 * @param content - Document content to hash
 * @returns SHA-256 hash of the document
 */
export const generateDocumentHash = (content: string): string => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

/**
 * Verifies a document on the Solana blockchain
 * @param connection - Solana connection
 * @param wallet - User's wallet
 * @param documentHash - Hash of the document content
 * @param metadata - Additional metadata to store with the verification
 * @returns Document verification information
 */
export const verifyDocumentOnChain = async (
  connection: Connection,
  wallet: any,
  documentHash: string,
  metadata: Record<string, any> = {}
): Promise<DocumentVerification | null> => {
  try {
    // Create a memo instruction with the document hash
    const encodedData = Buffer.from(
      JSON.stringify({
        type: 'document_verification',
        hash: documentHash,
        timestamp: Date.now(),
        metadata
      })
    );

    // Send transaction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }
      ],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: encodedData
    });

    const transaction = new Transaction().add(instruction);
    const signature = await wallet.sendTransaction(transaction, connection);
    
    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed');

    // Return verification information
    return {
      documentHash,
      timestamp: Date.now(),
      owner: wallet.publicKey.toString(),
      signature,
      transactionId: signature
    };
  } catch (error) {
    console.error('Error verifying document on chain:', error);
    return null;
  }
};

/**
 * Creates an NFT from a document
 * @param connection - Solana connection
 * @param wallet - User's wallet
 * @param metadataUri - URI pointing to document metadata (IPFS)
 * @param name - Name of the document NFT
 * @param symbol - Symbol for the document NFT
 * @returns Document NFT information
 */
export const createDocumentNFT = async (
  connection: Connection,
  wallet: any,
  metadataUri: string,
  name: string,
  symbol: string
): Promise<DocumentNFT | null> => {
  try {
    // This is a placeholder for NFT creation logic
    // In a full implementation, this would use Metaplex or similar tools
    // to create an SPL token with metadata
    
    // For now, we'll just return a simulated response
    const simulatedMint = Keypair.generate().publicKey.toString();
    const simulatedTokenAccount = Keypair.generate().publicKey.toString();
    
    return {
      mint: simulatedMint,
      tokenAccount: simulatedTokenAccount,
      metadataUri,
      owner: wallet.publicKey.toString(),
      name,
      symbol,
      transactionId: Keypair.generate().publicKey.toString()
    };
  } catch (error) {
    console.error('Error creating document NFT:', error);
    return null;
  }
};

/**
 * Verifies document ownership on the blockchain
 * @param connection - Solana connection
 * @param documentHash - Hash of the document to verify
 * @returns Boolean indicating if verification was successful
 */
export const verifyDocumentOwnership = async (
  connection: Connection,
  documentHash: string
): Promise<boolean> => {
  try {
    // This would query the blockchain for the document hash
    // and verify its ownership
    
    // Placeholder implementation
    return true;
  } catch (error) {
    console.error('Error verifying document ownership:', error);
    return false;
  }
};

/**
 * Transfers ownership of a document NFT
 * @param connection - Solana connection
 * @param wallet - User's wallet
 * @param mint - Mint address of the NFT
 * @param recipient - Recipient's public key
 * @returns Boolean indicating if transfer was successful
 */
export const transferDocumentOwnership = async (
  connection: Connection,
  wallet: any,
  mint: string,
  recipient: string
): Promise<boolean> => {
  try {
    // This would transfer the NFT to a new owner
    
    // Placeholder implementation
    return true;
  } catch (error) {
    console.error('Error transferring document ownership:', error);
    return false;
  }
};

/**
 * Gets the BDT token balance for the user
 * @param connection - Solana connection
 * @param wallet - User's wallet
 * @returns Token balance
 */
export const getBDTBalance = async (
  connection: Connection,
  wallet: any
): Promise<number> => {
  try {
    // This would query the token account for BDT
    
    // Placeholder implementation
    return 100.0;
  } catch (error) {
    console.error('Error getting BDT balance:', error);
    return 0;
  }
};

export * from './document';
export * from './program';

export const getSolanaExplorerUrl = (address: string, cluster = 'devnet'): string => {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
};

export const getSolanaTransactionUrl = (signature: string, cluster = 'devnet'): string => {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const createConnectionConfig = (endpoint = DEVNET_ENDPOINT) => ({
  commitment: 'confirmed' as const,
  confirmTransactionInitialTimeout: 60000,
});

// Function to use in React components that need to interact with Solana
export const useSolanaConnection = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  return {
    connection,
    wallet,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    sendTransaction: wallet.sendTransaction,
  };
};

export default {
  generateDocumentHash,
  verifyDocumentOnChain,
  createDocumentNFT,
  verifyDocumentOwnership,
  transferDocumentOwnership,
  getBDTBalance
}; 

export const getSolanaTransactionUrl = (signature: string, cluster = 'devnet'): string => {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
};

export const shortenAddress = (address: string, chars = 4): string => {
  return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
};

export const createConnectionConfig = (endpoint = DEVNET_ENDPOINT) => ({
  commitment: 'confirmed' as const,
  confirmTransactionInitialTimeout: 60000,
});

// Function to use in React components that need to interact with Solana
export const useSolanaConnection = () => {
  const { connection } = useConnection();
  const wallet = useWallet();
  
  return {
    connection,
    wallet,
    connected: wallet.connected,
    publicKey: wallet.publicKey,
    signTransaction: wallet.signTransaction,
    signAllTransactions: wallet.signAllTransactions,
    sendTransaction: wallet.sendTransaction,
  };
};

export default {
  generateDocumentHash,
  verifyDocumentOnChain,
  createDocumentNFT,
  verifyDocumentOwnership,
  transferDocumentOwnership,
  getBDTBalance
}; 
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  Keypair,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as crypto from 'crypto';

// Document verification interface
export interface DocumentVerification {
  documentHash: string;
  timestamp: number;
  owner: string;
  signature: string;
  transactionId: string;
}

// NFT Document interface
export interface DocumentNFT {
  mint: string;
  tokenAccount: string;
  metadataUri: string;
  owner: string;
  name: string;
  symbol: string;
  transactionId: string;
}

/**
 * Generates a SHA-256 hash of the document content
 * @param content - Document content to hash
 * @returns SHA-256 hash of the document
 */
export const generateDocumentHash = (content: string): string => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

/**
 * Verifies a document on the Solana blockchain
 * @param connection - Solana connection
 * @param wallet - User's wallet
 * @param documentHash - Hash of the document content
 * @param metadata - Additional metadata to store with the verification
 * @returns Document verification information
 */
export const verifyDocumentOnChain = async (
  connection: Connection,
  wallet: any,
  documentHash: string,
  metadata: Record<string, any> = {}
): Promise<DocumentVerification | null> => {
  try {
    // Create a memo instruction with the document hash
    const encodedData = Buffer.from(
      JSON.stringify({
        type: 'document_verification',
        hash: documentHash,
        timestamp: Date.now(),
        metadata
      })
    );

    // Send transaction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true }
      ],
      programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
      data: encodedData
    });

    const transaction = new Transaction().add(instruction);
    const signature = await wallet.sendTransaction(transaction, connection);
    
    // Confirm transaction
    await connection.confirmTransaction(signature, 'confirmed');

    // Return verification information
    return {
      documentHash,
      timestamp: Date.now(),
      owner: wallet.publicKey.toString(),
      signature,
      transactionId: signature
    };
  } catch (error) {
    console.error('Error verifying document on chain:', error);
    return null;
  }
};

/**
 * Creates an NFT from a document
 * @param connection - Solana connection
 * @param wallet - User's wallet
 * @param metadataUri - URI pointing to document metadata (IPFS)
 * @param name - Name of the document NFT
 * @param symbol - Symbol for the document NFT
 * @returns Document NFT information
 */
export const createDocumentNFT = async (
  connection: Connection,
  wallet: any,
  metadataUri: string,
  name: string,
  symbol: string
): Promise<DocumentNFT | null> => {
  try {
    // This is a placeholder for NFT creation logic
    // In a full implementation, this would use Metaplex or similar tools
    // to create an SPL token with metadata
    
    // For now, we'll just return a simulated response
    const simulatedMint = Keypair.generate().publicKey.toString();
    const simulatedTokenAccount = Keypair.generate().publicKey.toString();
    
    return {
      mint: simulatedMint,
      tokenAccount: simulatedTokenAccount,
      metadataUri,
      owner: wallet.publicKey.toString(),
      name,
      symbol,
      transactionId: Keypair.generate().publicKey.toString()
    };
  } catch (error) {
    console.error('Error creating document NFT:', error);
    return null;
  }
};

/**
 * Verifies document ownership on the blockchain
 * @param connection - Solana connection
 * @param documentHash - Hash of the document to verify
 * @returns Boolean indicating if verification was successful
 */
export const verifyDocumentOwnership = async (
  connection: Connection,
  documentHash: string
): Promise<boolean> => {
  try {
    // This would query the blockchain for the document hash
    // and verify its ownership
    
    // Placeholder implementation
    return true;
  } catch (error) {
    console.error('Error verifying document ownership:', error);
    return false;
  }
};

/**
 * Transfers ownership of a document NFT
 * @param connection - Solana connection
 * @param wallet - User's wallet
 * @param mint - Mint address of the NFT
 * @param recipient - Recipient's public key
 * @returns Boolean indicating if transfer was successful
 */
export const transferDocumentOwnership = async (
  connection: Connection,
  wallet: any,
  mint: string,
  recipient: string
): Promise<boolean> => {
  try {
    // This would transfer the NFT to a new owner
    
    // Placeholder implementation
    return true;
  } catch (error) {
    console.error('Error transferring document ownership:', error);
    return false;
  }
};

/**
 * Gets the BDT token balance for the user
 * @param connection - Solana connection
 * @param wallet - User's wallet
 * @returns Token balance
 */
export const getBDTBalance = async (
  connection: Connection,
  wallet: any
): Promise<number> => {
  try {
    // This would query the token account for BDT
    
    // Placeholder implementation
    return 100.0;
  } catch (error) {
    console.error('Error getting BDT balance:', error);
    return 0;
  }
};

export default {
  generateDocumentHash,
  verifyDocumentOnChain,
  createDocumentNFT,
  verifyDocumentOwnership,
  transferDocumentOwnership,
  getBDTBalance
}; 