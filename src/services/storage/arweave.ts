/**
 * Arweave Storage Service
 * Handles permanent decentralized storage of documents using Arweave
 */

import Arweave from 'arweave';
import { JWKInterface } from 'arweave/node/lib/wallet';
import axios from 'axios';
import { ARWEAVE_GATEWAY } from '@/utils/constants';

// Initialize Arweave client
const arweave = Arweave.init({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
  timeout: 20000,
});

/**
 * Generate a new Arweave wallet
 * 
 * @returns New JWK wallet
 */
export const generateWallet = async (): Promise<JWKInterface> => {
  return await arweave.wallets.generate();
};

/**
 * Get the address for a wallet
 * 
 * @param jwk Wallet JWK
 * @returns Wallet address
 */
export const getWalletAddress = async (jwk: JWKInterface): Promise<string> => {
  return await arweave.wallets.jwkToAddress(jwk);
};

/**
 * Get the balance for a wallet
 * 
 * @param address Wallet address
 * @returns Balance in AR
 */
export const getWalletBalance = async (address: string): Promise<string> => {
  const winston = await arweave.wallets.getBalance(address);
  const ar = arweave.ar.winstonToAr(winston);
  return ar;
};

/**
 * Upload data to Arweave network
 * 
 * @param data File data as Buffer or string
 * @param jwk Wallet JWK for transaction fee
 * @param tags Optional metadata tags for the transaction
 * @returns Transaction ID
 */
export const uploadToArweave = async (
  data: Buffer | string,
  jwk: JWKInterface,
  tags?: { name: string, value: string }[]
): Promise<string> => {
  try {
    // Create a transaction
    const transaction = await arweave.createTransaction(
      { data: data },
      jwk
    );
    
    // Add tags
    if (tags && tags.length > 0) {
      tags.forEach(tag => {
        transaction.addTag(tag.name, tag.value);
      });
    }
    
    // Add default content tags if not provided
    if (!tags?.some(tag => tag.name === 'Content-Type')) {
      transaction.addTag('Content-Type', 'application/octet-stream');
    }
    
    // Add blokdoc app tags
    transaction.addTag('App-Name', 'Blokdoc');
    transaction.addTag('App-Version', '0.1.0');
    
    // Sign the transaction
    await arweave.transactions.sign(transaction, jwk);
    
    // Submit the transaction
    const response = await arweave.transactions.post(transaction);
    
    if (response.status === 200 || response.status === 202) {
      return transaction.id;
    } else {
      throw new Error(`Failed to upload to Arweave: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error uploading to Arweave:', error);
    throw error;
  }
};

/**
 * Get URL for Arweave content
 * 
 * @param txId Transaction ID
 * @returns Full gateway URL
 */
export const getArweaveUrl = (txId: string): string => {
  return `${ARWEAVE_GATEWAY}${txId}`;
};

/**
 * Download content from Arweave
 * 
 * @param txId Transaction ID
 * @returns Content as Buffer
 */
export const downloadFromArweave = async (txId: string): Promise<Buffer> => {
  try {
    // First try direct gateway access
    try {
      const response = await axios.get(getArweaveUrl(txId), {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (directError) {
      console.warn('Direct gateway access failed, trying arweave.net API:', directError);
      
      // Fall back to arweave client
      const data = await arweave.transactions.getData(txId, {
        decode: true,
        string: false,
      });
      
      return Buffer.from(data as Uint8Array);
    }
  } catch (error) {
    console.error('Error downloading from Arweave:', error);
    throw error;
  }
};

/**
 * Get transaction status
 * 
 * @param txId Transaction ID
 * @returns Transaction status
 */
export const getTransactionStatus = async (txId: string): Promise<any> => {
  try {
    const status = await arweave.transactions.getStatus(txId);
    return status;
  } catch (error) {
    console.error('Error getting transaction status:', error);
    throw error;
  }
};

export default {
  generateWallet,
  getWalletAddress,
  getWalletBalance,
  uploadToArweave,
  getArweaveUrl,
  downloadFromArweave,
  getTransactionStatus
}; 
  getTransactionStatus
}; 
 * Arweave Storage Service
 * Handles permanent decentralized storage of documents using Arweave
 */

import Arweave from 'arweave';

// Type for Arweave transaction result
export interface ArweaveUploadResult {
  id: string;
  url: string;
  size: number;
  type: string;
  timestamp: number;
}

/**
 * Initialize Arweave client
 * @returns Arweave Client instance
 */
export const initArweaveClient = () => {
  try {
    // Initialize Arweave client
    // In a production app, this would be configured properly
    const client = Arweave.init({
      host: 'arweave.net',
      port: 443,
      protocol: 'https'
    });
    
    return client;
  } catch (error) {
    console.error('Arweave client initialization error:', error);
    throw new Error('Failed to initialize Arweave client');
  }
};

/**
 * Upload a file to Arweave
 * @param file - File to upload
 * @param wallet - Arweave wallet/key
 * @param tags - Optional metadata tags
 * @returns Arweave upload result with transaction ID
 */
export const uploadToArweave = async (
  file: File | Blob,
  wallet: any,
  tags: Record<string, string> = {}
): Promise<ArweaveUploadResult> => {
  try {
    // This is a placeholder implementation since we can't actually connect to Arweave in this example
    // In a real application, this would use the Arweave client to upload the file
    
    console.log('Uploading to Arweave:', file.type, file.size);
    
    // Simulate upload time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate a mock transaction ID
    const mockTxId = Array.from({ length: 43 }, () => 
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]
    ).join('');
    
    return {
      id: mockTxId,
      url: `https://arweave.net/${mockTxId}`,
      size: file.size,
      type: file.type,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Arweave upload error:', error);
    throw new Error('Failed to upload to Arweave');
  }
};

/**
 * Fetch a file from Arweave by its transaction ID
 * @param txId - Transaction ID
 * @returns File data as a Blob
 */
export const fetchFromArweave = async (txId: string): Promise<Blob> => {
  try {
    // This is a placeholder implementation
    // In a real application, this would fetch the file from Arweave
    
    console.log('Fetching from Arweave:', txId);
    
    // Simulate download time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a mock text file for demonstration
    return new Blob(['This is mock content fetched from Arweave'], { type: 'text/plain' });
  } catch (error) {
    console.error('Arweave fetch error:', error);
    throw new Error('Failed to fetch from Arweave');
  }
};

/**
 * Get the status of a transaction on Arweave
 * @param txId - Transaction ID
 * @returns Transaction status information
 */
export const getTransactionStatus = async (
  txId: string
): Promise<{ status: string; confirmations: number }> => {
  try {
    // This is a placeholder implementation
    // In a real application, this would check the transaction status on Arweave
    
    console.log('Checking transaction status on Arweave:', txId);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      status: 'confirmed',
      confirmations: 10
    };
  } catch (error) {
    console.error('Transaction status check error:', error);
    throw new Error('Failed to check transaction status');
  }
};

/**
 * Create and upload metadata to Arweave
 * @param metadata - Metadata to store
 * @param wallet - Arweave wallet/key
 * @param tags - Optional metadata tags
 * @returns Transaction ID of the uploaded metadata
 */
export const uploadMetadataToArweave = async (
  metadata: Record<string, any>,
  wallet: any,
  tags: Record<string, string> = {}
): Promise<string> => {
  try {
    // This is a placeholder implementation
    // In a real application, this would create a JSON file and upload it to Arweave
    
    console.log('Uploading metadata to Arweave:', metadata);
    
    // Simulate upload time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate a mock transaction ID
    const mockTxId = Array.from({ length: 43 }, () => 
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]
    ).join('');
    
    return mockTxId;
  } catch (error) {
    console.error('Metadata upload error:', error);
    throw new Error('Failed to upload metadata to Arweave');
  }
};

export default {
  initArweaveClient,
  uploadToArweave,
  fetchFromArweave,
  getTransactionStatus,
  uploadMetadataToArweave
}; 