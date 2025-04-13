// Blockchain constants
export const DEVNET_ENDPOINT = 'https://api.devnet.solana.com';
export const MAINNET_ENDPOINT = 'https://api.mainnet-beta.solana.com';
export const PROGRAM_ID = 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';

// IPFS constants
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';
export const IPFS_API_URL = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

// Arweave constants
export const ARWEAVE_GATEWAY = 'https://arweave.net/';

// Application constants
export const APP_NAME = 'Blokdoc';
export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/markdown',
  'application/json',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Authentication constants
export const SESSION_EXPIRY = 24 * 60 * 60; // 24 hours in seconds 