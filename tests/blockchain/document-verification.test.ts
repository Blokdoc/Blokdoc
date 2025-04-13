import {
  createDocumentHash,
  registerDocument,
  getDocument,
  verifyDocumentOnChain
} from '../../src/blockchain/solana/document';
import { Connection, Keypair } from '@solana/web3.js';
import { DEVNET_ENDPOINT } from '../../src/utils/constants';

describe('Solana Document Verification', () => {
  // Create a test connection to Solana devnet
  const connection = new Connection(DEVNET_ENDPOINT, 'confirmed');
  
  // Create a test wallet for the tests
  const testWallet = Keypair.generate();
  
  // Test document data
  const testDocumentName = 'Test Document';
  const testDocumentType = 'application/pdf';
  const testDocumentContent = 'This is a test document content';
  const testDocumentHash = createDocumentHash(testDocumentContent);
  
  // Store the document PDA for later tests
  let documentPDA: string;
  
  beforeAll(async () => {
    // Fund the test wallet to pay for transactions
    // Note: In a real test, we would use an airdrop or other funding mechanism
    console.log(`Test wallet address: ${testWallet.publicKey.toString()}`);
  });
  
  test('should create a document hash', () => {
    const hash = createDocumentHash(testDocumentContent);
    
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBe(64); // SHA-256 hash is 64 chars in hex
    
    // Creating the same hash twice should yield the same result
    const hash2 = createDocumentHash(testDocumentContent);
    expect(hash).toBe(hash2);
    
    // Different content should yield different hash
    const differentHash = createDocumentHash('Different content');
    expect(hash).not.toBe(differentHash);
  });
  
  test('should register a document on the blockchain', async () => {
    // Skip this test in CI environments where blockchain integration is not available
    if (process.env.CI) {
      console.log('Skipping blockchain registration test in CI environment');
      return;
    }
    
    try {
      const txSignature = await registerDocument(
        connection,
        {
          publicKey: testWallet.publicKey,
          signTransaction: async (tx) => {
            tx.partialSign(testWallet);
            return tx;
          }
        },
        testDocumentHash,
        testDocumentName,
        testDocumentType
      );
      
      expect(txSignature).toBeDefined();
      expect(typeof txSignature).toBe('string');
      
      // Store the document PDA for later tests
      // In a real implementation, we would get this from the transaction result
      // For this test, we're simulating it
      documentPDA = `document${testWallet.publicKey.toString().slice(0, 10)}`;
      
    } catch (error) {
      console.error('Error registering document:', error);
      // This will fail the test if the blockchain is not available
      // In a real test environment, we would have proper mocks
      expect(error).toBeUndefined();
    }
  });
  
  test('should verify a document on the blockchain', async () => {
    // Skip this test in CI environments where blockchain integration is not available
    if (process.env.CI) {
      console.log('Skipping blockchain verification test in CI environment');
      return;
    }
    
    // Skip if previous test failed to register the document
    if (!documentPDA) {
      console.log('Skipping verification test as document registration failed');
      return;
    }
    
    try {
      const isValid = await verifyDocumentOnChain(
        connection,
        {
          publicKey: testWallet.publicKey,
          signTransaction: async (tx) => {
            tx.partialSign(testWallet);
            return tx;
          }
        },
        documentPDA,
        testDocumentHash
      );
      
      expect(isValid).toBe(true);
      
      // Test with incorrect hash
      const invalidHash = createDocumentHash('Different content');
      const isInvalidHashValid = await verifyDocumentOnChain(
        connection,
        {
          publicKey: testWallet.publicKey,
          signTransaction: async (tx) => {
            tx.partialSign(testWallet);
            return tx;
          }
        },
        documentPDA,
        invalidHash
      );
      
      expect(isInvalidHashValid).toBe(false);
      
    } catch (error) {
      console.error('Error verifying document:', error);
      // This will fail the test if the blockchain is not available
      // In a real test environment, we would have proper mocks
      expect(error).toBeUndefined();
    }
  });
  
  test('should fetch document data from the blockchain', async () => {
    // Skip this test in CI environments where blockchain integration is not available
    if (process.env.CI) {
      console.log('Skipping blockchain fetch test in CI environment');
      return;
    }
    
    // Skip if previous test failed to register the document
    if (!documentPDA) {
      console.log('Skipping fetch test as document registration failed');
      return;
    }
    
    try {
      const documentData = await getDocument(
        connection,
        documentPDA
      );
      
      expect(documentData).toBeDefined();
      expect(documentData.name).toBe(testDocumentName);
      expect(documentData.documentType).toBe(testDocumentType);
      expect(documentData.hash).toBe(testDocumentHash);
      expect(documentData.owner).toBe(testWallet.publicKey.toString());
      
    } catch (error) {
      console.error('Error fetching document:', error);
      // This will fail the test if the blockchain is not available
      // In a real test environment, we would have proper mocks
      expect(error).toBeUndefined();
    }
  });
}); 