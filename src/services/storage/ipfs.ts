/**
 * IPFS Storage Service
 * Handles decentralized storage of documents using IPFS
 */

import { create, IPFSHTTPClient } from 'ipfs-http-client';
import axios from 'axios';
import { IPFS_GATEWAY, IPFS_API_URL } from '@/utils/constants';

let ipfsClient: IPFSHTTPClient | null = null;

// Type for file metadata
export interface FileMetadata {
  name: string;
  description?: string;
  type: string;
  size: number;
  lastModified: number;
  tags?: string[];
}

// Type for IPFS upload result
export interface IPFSUploadResult {
  cid: string;
  size: number;
  path: string;
  url: string;
  metadata: FileMetadata;
}

/**
 * Initialize IPFS client with authentication if required
 */
export const initIPFSClient = (projectId?: string, projectSecret?: string) => {
  try {
    // For this example, we're using a public gateway
    // In production, you should use authenticated endpoints
    if (projectId && projectSecret) {
      const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
      ipfsClient = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        headers: {
          authorization: auth,
        },
      });
    } else {
      ipfsClient = create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
      });
    }
    return ipfsClient;
  } catch (error) {
    console.error('IPFS client initialization error:', error);
    return null;
  }
};

/**
 * Upload content to IPFS
 * 
 * @param content File content as Buffer or string
 * @param options Upload options
 * @returns IPFS CID (Content Identifier)
 */
export const uploadToIPFS = async (
  content: Buffer | string,
  options?: { filename?: string; pinataMetadata?: any }
): Promise<string> => {
  try {
    // If we're using Pinata API
    if (IPFS_API_URL.includes('pinata')) {
      const formData = new FormData();
      
      // If content is a string, convert to buffer
      const buffer = typeof content === 'string' ? Buffer.from(content) : content;
      
      // Create a blob and add to formData
      const file = new Blob([buffer]);
      formData.append('file', file, options?.filename || 'file');
      
      if (options?.pinataMetadata) {
        formData.append('pinataMetadata', JSON.stringify(options.pinataMetadata));
      }
      
      const response = await axios.post(IPFS_API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add your Pinata API keys here if needed
          // 'pinata_api_key': YOUR_PINATA_API_KEY,
          // 'pinata_secret_api_key': YOUR_PINATA_SECRET_API_KEY
        },
      });
      
      return response.data.IpfsHash;
    } 
    // If we're using the IPFS client directly
    else if (ipfsClient) {
      const added = await ipfsClient.add(content);
      return added.cid.toString();
    } else {
      throw new Error('IPFS client not initialized');
    }
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

/**
 * Get IPFS gateway URL for a CID
 * 
 * @param cid IPFS Content Identifier
 * @param filename Optional filename for content disposition
 * @returns Full gateway URL
 */
export const getIPFSUrl = (cid: string, filename?: string): string => {
  if (filename) {
    return `${IPFS_GATEWAY}${cid}?filename=${encodeURIComponent(filename)}`;
  }
  return `${IPFS_GATEWAY}${cid}`;
};

/**
 * Download content from IPFS
 * 
 * @param cid IPFS Content Identifier
 * @returns Content as Buffer
 */
export const downloadFromIPFS = async (cid: string): Promise<Buffer> => {
  try {
    // Using axios to retrieve content from gateway
    const response = await axios.get(getIPFSUrl(cid), {
      responseType: 'arraybuffer',
    });
    
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error downloading from IPFS:', error);
    throw error;
  }
};

/**
 * Fetch a file from IPFS by its CID
 * @param cid - Content Identifier
 * @returns File data as a Blob
 */
export const fetchFromIPFS = async (cid: string): Promise<Blob> => {
  try {
    // This is a placeholder implementation
    // In a real application, this would fetch the file from IPFS
    
    console.log('Fetching from IPFS:', cid);
    
    // Simulate download time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create a mock text file for demonstration
    return new Blob(['This is mock content fetched from IPFS'], { type: 'text/plain' });
  } catch (error) {
    console.error('IPFS fetch error:', error);
    throw new Error('Failed to fetch from IPFS');
  }
};

/**
 * Pin an existing IPFS CID to ensure it remains available
 * @param cid - Content Identifier to pin
 * @returns Boolean indicating success
 */
export const pinIPFSContent = async (cid: string): Promise<boolean> => {
  try {
    // This is a placeholder implementation
    // In a real application, this would pin the content on IPFS
    
    console.log('Pinning IPFS content:', cid);
    
    // Simulate pinning time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('IPFS pinning error:', error);
    return false;
  }
};

/**
 * Create metadata JSON and upload to IPFS
 * @param metadata - Metadata to store
 * @returns CID of the uploaded metadata
 */
export const uploadMetadataToIPFS = async (metadata: Record<string, any>): Promise<string> => {
  try {
    // This is a placeholder implementation
    // In a real application, this would create a JSON file and upload it to IPFS
    
    console.log('Uploading metadata to IPFS:', metadata);
    
    // Simulate upload time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock CID
    const mockCid = 'Qm' + Array.from({ length: 44 }, () => 
      '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'[Math.floor(Math.random() * 58)]
    ).join('');
    
    return mockCid;
  } catch (error) {
    console.error('Metadata upload error:', error);
    throw new Error('Failed to upload metadata to IPFS');
  }
};

export default {
  initIPFSClient,
  uploadToIPFS,
  fetchFromIPFS,
  pinIPFSContent,
  uploadMetadataToIPFS
}; 