<div align="center">
  <img src="public/images/logo.png" alt="Blokdoc Logo" width="300"/>
</div>

# Blokdoc

A blockchain-based document verification and management system built on Solana.

## 🌟 Features

- Document storage on IPFS and Arweave
- Document verification through Solana blockchain
- Secure document sharing and access control
- Version control and document history
- User-friendly dashboard interface
- Multi-wallet support (Phantom, Solflare, Torus)
- Advanced document processing and content extraction
- Searchable document metadata and content

## 🛠️ Technology Stack

- Frontend: React, Next.js, TailwindCSS
- Backend: Next.js API routes
- Blockchain: Solana
- Storage: IPFS, Arweave
- Authentication: NextAuth.js
- Document Processing: PDF.js

## 🏗️ Project Architecture

```
blokdoc/
├── contracts/           # Solana smart contracts
├── docs/                # Documentation
├── public/              # Static assets
├── src/
│   ├── blockchain/      # Blockchain integration
│   │   └── solana/      # Solana specific code
│   ├── components/      # React components
│   ├── pages/           # Next.js pages and API routes
│   │   ├── api/         # Backend API endpoints
│   │   └── ...          # Frontend pages
│   ├── services/        # Business logic services
│   │   ├── document/    # Document processing services
│   │   └── storage/     # Storage services (IPFS, Arweave)
│   ├── styles/          # CSS and styling
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
└── tests/               # Test files
```

## 📊 System Architecture

```
+-----------------+     +-----------------+     +------------------+
|                 |     |                 |     |                  |
|  Client Layer   |---->|    API Layer    |---->|  Service Layer   |
|  (Next.js/React)|     |  (Next.js API)  |     |  (Core Logic)    |
|                 |     |                 |     |                  |
+-----------------+     +-----------------+     +--------+---------+
                                                         |
                                                         v
                                           +--------------+-------------+
                                           |              |             |
                                           v              v             v
                               +----------------+ +-------------+ +------------+
                               |                | |             | |            |
                               | Blockchain     | | IPFS        | | Arweave    |
                               | (Solana)       | | Storage     | | Storage    |
                               |                | |             | |            |
                               +----------------+ +-------------+ +------------+
```

Blokdoc follows a multi-layered architecture:

1. **Frontend Layer** - React/Next.js application providing the user interface
2. **API Layer** - Next.js API routes handling backend logic
3. **Service Layer** - Core business logic for document processing
4. **Blockchain Layer** - Integration with Solana for document verification
5. **Storage Layer** - IPFS and Arweave for decentralized storage

## 💾 Data Flow

```
+-------------+    +-----------------+    +-------------------+
| User Upload |    | File Processing |    | Storage & Blockchain
+-------------+    +-----------------+    +-------------------+
       |                   |                        |
       v                   v                        v
+-------------+    +-----------------+    +-------------------+
| Select File |    | Validate & Scan |    | Upload to IPFS/   |
| Add Metadata|    | Extract Content |    | Arweave           |
+-------------+    +-----------------+    +-------------------+
       |                   |                        |
       v                   v                        v
+-------------+    +-----------------+    +-------------------+
| Submit Form |    | Generate Hash   |    | Register on Solana|
|             |    | Process Content |    | Store Reference   |
+-------------+    +-----------------+    +-------------------+
```

### Document Upload Process:

1. User selects a document and submits metadata
2. File is validated and scanned for viruses
3. Document content is processed and extracted
4. File is encrypted and uploaded to IPFS/Arweave
5. Document hash and metadata are registered on Solana blockchain
6. Document reference is stored in database with user ownership

### Document Verification Process:

1. User requests document verification
2. System retrieves document hash from blockchain
3. Original document hash is compared with blockchain record
4. Verification result is returned to user
5. Verification transaction is added to document history

## 💻 Key Code Implementations

### Blockchain Integration

```typescript
// Document verification on Solana
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
```

### File Processing

```typescript
export const processFileUpload = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  size: number,
  uploadedBy: string
): Promise<UploadResult> => {
  try {
    // 1. Validate file size and type
    validateFileSize(size);
    validateFileType(fileName, mimeType);
    
    // 2. Scan for viruses
    const isSafe = await scanForViruses(fileBuffer);
    
    // 3. Calculate file hash for integrity
    const hash = await calculateFileHash(fileBuffer);
    
    // 4. Create file metadata
    const metadata = {
      originalName: fileName,
      size,
      mimeType,
      extension: fileName.split('.').pop()?.toLowerCase() || '',
      hash,
      uploadedBy,
      uploadedAt: new Date()
    };
    
    // 5. Store file in decentralized storage
    const storageLocation = await storeFile(fileBuffer, metadata);
    
    // 6. Create document record
    const document = {
      id: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: fileName,
      fileType: metadata.extension,
      fileSize: size,
      createdAt: metadata.uploadedAt,
      updatedAt: metadata.uploadedAt,
      storageInfo: {
        location: storageLocation,
        hash,
        originalName: fileName
      },
      owner: uploadedBy,
      version: 1,
      status: 'processing'
    };
    
    return { success: true, document, metadata, storageLocation };
  } catch (error) {
    // Handle errors
    return { 
      success: false, 
      error: error instanceof UploadError ? error : new UploadError(UploadErrorType.UPLOAD_FAILED, 'Unknown error') 
    };
  }
};
```

## 🔐 Security Features

Blokdoc implements several security measures:

- **File Validation**: Checks file size, type, and extension before processing
- **Virus Scanning**: All uploaded files are scanned for malware
- **Content Hashing**: SHA-256 hash verification for document integrity
- **Blockchain Verification**: Immutable proof of document existence and ownership
- **Access Control**: Fine-grained permission system for document sharing
- **Encryption**: Document content is encrypted before storage

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- Solana CLI tools
- A Solana wallet (Phantom, Solflare, or similar)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Blokdoc/Blokdoc.git
   cd Blokdoc
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Configure environment variables
   ```
   cp .env.example .env.local
   ```
   Edit `.env.local` with your Solana network settings

4. Run the development server
   ```
   npm run dev
   ```

## 📘 Documentation

For detailed documentation, please see the [docs](./docs) directory.

## 🧪 Testing

Run the test suite:

```
npm test
```

For specific test files:

```
npm test -- src/services/document/upload.test.ts
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📊 Project Status

Current version: V1.01 - Beta Release 

## 📱 Connect With Us

- **Website**: [https://www.blokdoc.xyz/](https://www.blokdoc.xyz/)
- **GitHub**: [https://github.com/Blokdoc/Blokdoc](https://github.com/Blokdoc/Blokdoc)
- **Twitter**: [https://x.com/Blok_doc_](https://x.com/Blok_doc_)
- **Email**: [contact@blokdoc.xyz](mailto:contact@blokdoc.xyz)

For any technical inquiries or bug reports, please open an issue on our [GitHub repository](https://github.com/Blokdoc/Blokdoc/issues). 