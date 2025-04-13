<p align="center">
  <img src="public/images/logo.png" alt="Blokdoc Logo" width="200"/>
</p>

# Blokdoc - Decentralized Document Management and Collaboration Platform

> **Secure your documents on the blockchain, collaborate seamlessly, and maintain immutable records with our cutting-edge decentralized platform.**

<br>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [Data Flow](#-data-flow)
- [Implementation Logic](#-implementation-logic)
- [Key Components](#-key-components)
- [Getting Started](#-getting-started)
- [Blockchain Integration](#-blockchain-integration)
- [Project Structure](#-project-structure)
- [Contribution Guidelines](#-contribution-guidelines)
- [License](#-license)
- [Contact](#-contact)

<br>

## 🌟 Overview

Blokdoc is a decentralized intelligent document management and collaboration platform that combines blockchain technology with advanced document processing capabilities. It leverages Solana blockchain to provide document authenticity verification, proof of ownership, and version control, while integrating artificial intelligence for advanced document processing and collaboration.

<br>

## ✨ Features

- **🔒 Blockchain Security** - Ensure document authenticity and immutability through Solana blockchain verification and timestamping.
- **📦 Decentralized Storage** - Store your documents permanently on IPFS and Arweave, ensuring they remain accessible and uncensorable.
- **🤝 Tokenized Collaboration** - Enable transparent contribution tracking and compensation mechanisms through tokenized collaboration.
- **🧠 AI Document Processing** - Extract insights, perform OCR, and generate summaries from your documents using advanced AI technology.
- **📝 Version Control** - Track document history with immutable timestamped versions, allowing you to view and restore previous states.
- **📄 Smart Contracts** - Automate document workflows and permissions with programmable smart contracts on the Solana blockchain.

<br>

## 🏗️ Architecture

Blokdoc follows a modern full-stack architecture that combines decentralized storage, blockchain verification, and a responsive web interface:

```
┌────────────────────────────────────────────────────────────────────┐
│                        Blokdoc Architecture                         │
└────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
         ┌───────────────────────────────────────────────┐
         │                 Client (Next.js)               │
         │                                               │
         │  ┌──────────┐  ┌──────────┐  ┌──────────────┐ │
         │  │  Pages   │  │Components│  │State/Context │ │
         │  └──────────┘  └──────────┘  └──────────────┘ │
         └───────────────────────────────────────────────┘
                                    │
                                    ▼
         ┌───────────────────────────────────────────────┐
         │                 API Layer                      │
         │     (Next.js API Routes, Authentication)       │
         └───────────────────────────────────────────────┘
                                    │
             ┌────────────────────┐ │ ┌──────────────────┐
             │                    │ │ │                  │
             ▼                    │ │ ▼                  │
┌──────────────────────┐         │ │ ┌──────────────────┐
│   Solana Blockchain  │         │ │ │  Decentralized   │
│                      │◄────────┘ └─►     Storage      │
│   - Smart Contracts  │              │ - IPFS           │
│   - Document Auth    │              │ - Arweave        │
└──────────────────────┘              └──────────────────┘
             │                                 │
             └─────────────────┬──────────────┘
                               │
                               ▼
         ┌───────────────────────────────────────────────┐
         │            Document Processing                 │
         │            AI & Content Analysis               │
         └───────────────────────────────────────────────┘
```

<br>

## 🛠️ Technology Stack

### Frontend
- **Next.js 13** - React framework with built-in API routes and server-side rendering
- **React 18** - UI component library for building interactive interfaces
- **TypeScript** - Type-safe JavaScript for improved developer experience
- **TailwindCSS** - Utility-first CSS framework for rapid UI development
- **Solana Wallet Adapter** - Connect and interact with blockchain wallets

### Blockchain
- **Solana Web3.js** - JavaScript API for interacting with the Solana blockchain
- **Solana/Anchor Framework** - Framework for Solana smart contract development
- **Arweave** - Permanent, decentralized file storage
- **IPFS** - Distributed file system for storing document content

### Backend
- **Next.js API Routes** - Serverless functions for API endpoints
- **MongoDB/Mongoose** - Document database for metadata storage
- **NextAuth.js** - Authentication framework for Next.js

<br>

## 🔄 Data Flow

The Blokdoc platform utilizes a comprehensive data flow to ensure secure document management:

```
┌─────────────────┐     ┌─────────────────┐     ┌────────────────────┐
│  Document       │     │   Processing     │     │  Storage Layer     │
│  Submission     │────►│   Pipeline      │────►│                    │
└─────────────────┘     └─────────────────┘     └────────────────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌─────────────────┐     ┌────────────────────┐
│  Blockchain     │     │  Document       │     │  Decentralized     │
│  Registration   │◄────│  Metadata       │◄────│  Storage           │
└─────────────────┘     └─────────────────┘     └────────────────────┘
        │
        ▼
┌─────────────────┐
│  Document       │
│  Access/Sharing │
└─────────────────┘
```

1. **Document Submission Flow**:
   - User uploads a document through the UI
   - Document is validated (size, type, virus scan)
   - Document metadata is extracted
   - File is processed based on type (PDF, Word, etc.)

2. **Storage Flow**:
   - Document is stored in decentralized storage (IPFS/Arweave)
   - Storage references (CID/transaction ID) are saved
   - Metadata is stored in the application database

3. **Blockchain Registration**:
   - Document hash is calculated for verification
   - Document reference is registered on Solana blockchain
   - Smart contract records ownership and timestamp

4. **Access & Sharing Flow**:
   - Access control is managed through blockchain verification
   - Sharing is enabled through permission grants
   - Collaboration is tracked with tokenized mechanisms

<br>

## 🧩 Implementation Logic

### Document Upload Process

```javascript
/* 
 * Upload document flow simplified from src/services/document/index.ts
 */
export const uploadDocument = async (
  file: File,
  wallet: any,
  metadata: { name?: string; description?: string; tags?: string[] } = {},
  options: { preferredStorage?: 'ipfs' | 'arweave'; registerOnChain?: boolean } = {}
): Promise<Document> => {
  // 1. Validate file
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.message);
  }
  
  // 2. Read file content
  const fileContent = await readFileAsBuffer(file);
  
  // 3. Create document hash for verification
  const documentHash = createDocumentHash(fileContent);
  
  // 4. Store document in decentralized storage
  const storageInfo: DocumentStorageInfo = {};
  if (!options.preferredStorage || options.preferredStorage === 'ipfs') {
    // Upload to IPFS
    const ipfsCid = await uploadToIPFS(fileContent, {/*...*/});
    storageInfo.ipfsCid = ipfsCid;
  } else if (options.preferredStorage === 'arweave') {
    // Upload to Arweave
    const arweaveTxId = await uploadToArweave(fileContent, /*...*/);
    storageInfo.arweaveTxId = arweaveTxId;
  }
  
  // 5. Register document on blockchain (optional)
  if (options.registerOnChain !== false) {
    const connection = new Connection(DEVNET_ENDPOINT);
    const solanaSignature = await registerDocument(
      connection, wallet, documentHash, /*...*/
    );
    storageInfo.solanaSignature = solanaSignature;
  }
  
  // 6. Create and return document object
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
    metadata: {/*...*/},
  };
  
  return document;
};
```

### Document Verification Process

```javascript
/*
 * Document verification flow simplified from blockchain integration
 */
export const verifyDocumentOnChain = async (
  connection: Connection,
  documentHash: string,
  options: VerificationOptions = {}
) => {
  try {
    // 1. Create program instance
    const program = new Program(IDL, PROGRAM_ID, {
      connection,
      // Additional provider config
    });
    
    // 2. Find the PDA for the document
    const [documentPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from('document'), Buffer.from(documentHash)],
      program.programId
    );
    
    // 3. Fetch the document account data
    const documentAccount = await program.account.document.fetch(documentPDA);
    
    // 4. Verify ownership and metadata
    const isOwner = documentAccount.owner.equals(wallet.publicKey);
    const isHashMatching = documentAccount.documentHash === documentHash;
    
    // 5. Return verification result
    return {
      verified: isHashMatching,
      timestamp: documentAccount.timestamp.toNumber(),
      owner: documentAccount.owner.toString(),
      metadata: documentAccount.metadata,
      // Additional verification info
    };
  } catch (error) {
    console.error('Verification error:', error);
    return { verified: false, error };
  }
};
```

<br>

## 📦 Key Components

### Document Type Definitions

The `Document` interface is the core data structure representing documents in the system:

```typescript
// From src/types/index.ts
export interface Document {
  id: string;                      // Unique document identifier
  name: string;                    // Document name
  description?: string;            // Optional description
  fileType: string;                // MIME type
  fileSize: number;                // Size in bytes
  createdAt: number;               // Creation timestamp
  updatedAt: number;               // Last update timestamp
  storageInfo: DocumentStorageInfo; // Storage references
  owner: string;                   // Owner's wallet address
  version: number;                 // Version number
  status: 'active' | 'archived';   // Document status
  collaborators?: string[];        // Optional collaborators list
  tags?: string[];                 // Optional tags
  metadata?: Record<string, any>;  // Additional metadata
}

export interface DocumentStorageInfo {
  ipfsCid?: string;                // IPFS Content Identifier
  arweaveTxId?: string;            // Arweave Transaction ID
  solanaSignature?: string;        // Solana blockchain signature
  documentPDA?: string;            // Document Program Derived Address
}
```

### API Structure

The API follows a RESTful structure with Next.js API routes:

- **GET /api/documents** - Retrieve documents with filtering options
- **POST /api/documents** - Create a new document
- **GET /api/documents/[id]** - Get a specific document
- **PUT /api/documents/[id]** - Update a document
- **DELETE /api/documents/[id]** - Delete/archive a document
- **POST /api/documents/upload** - Upload a document to decentralized storage
- **POST /api/documents/verify** - Verify a document on the blockchain

<br>

## 🚀 Getting Started

### Requirements
- Node.js 16+
- Yarn or npm
- Solana CLI (for development)

### Installation

1. Clone repository
```bash
git clone https://github.com/Blokdoc/Blokdoc.git
cd Blokdoc
```

2. Install dependencies
```bash
yarn install
```

3. Run development server
```bash
yarn dev
```

4. Visit [http://localhost:3000](http://localhost:3000) in your browser

### Environment Configuration

Create a `.env.local` file with the following variables:

```
# App Configuration
NEXT_PUBLIC_APP_NAME=Blokdoc

# Blockchain Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=your_program_id_here

# Storage Configuration
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
IPFS_API_KEY=your_ipfs_api_key
IPFS_API_SECRET=your_ipfs_api_secret
NEXT_PUBLIC_ARWEAVE_GATEWAY=https://arweave.net/

# Authentication
NEXTAUTH_SECRET=your_auth_secret_key
NEXTAUTH_URL=http://localhost:3000
```

<br>

## ⛓️ Blockchain Integration

### Solana Smart Contract Deployment

For full feature testing, you need to set up a Solana development environment:

1. Install [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
2. Set up local test network
```bash
solana-test-validator
```

3. Compile and deploy smart contracts
```bash
cd contracts/solana
anchor build
anchor deploy
```

4. Update your `.env.local` file with the deployed program ID

### Smart Contract Structure

The Solana program handles document verification through the following accounts:

- **Document Account**: Stores document hash, owner, and metadata
- **User Account**: Manages user permissions and document ownership
- **Version Account**: Tracks document versions with timestamps

<br>

## 📂 Project Structure

```
blokdoc/
├── contracts/             # Solana smart contracts
│   └── solana/            # Contract implementation
├── public/                # Static assets
│   └── images/            # Images including logo
├── src/
│   ├── blockchain/        # Blockchain interaction logic
│   │   └── solana/        # Solana-specific implementation
│   ├── components/        # React components
│   │   ├── home/          # Homepage components
│   │   └── layout/        # Layout components (Header, Footer)
│   ├── pages/             # Next.js pages
│   │   ├── api/           # API routes
│   │   │   └── documents/ # Document-related endpoints
│   │   ├── documents/     # Document pages
│   │   └── dashboard/     # Dashboard pages
│   ├── services/          # Application services
│   │   ├── document/      # Document processing services
│   │   └── storage/       # Storage services (IPFS, Arweave)
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions and constants
├── tests/                 # Test files
└── docs/                  # Project documentation
```

<br>

## 🤝 Contribution Guidelines

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Best Practices

- Follow TypeScript best practices for type safety
- Write tests for new features
- Keep components small and focused
- Use the existing file/folder structure
- Document new functionality in code and update README if needed

<br>

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

<br>

## 📬 Contact Us

- Website: [https://www.blokdoc.xyz](https://www.blokdoc.xyz)
- GitHub: [https://github.com/Blokdoc/Blokdoc](https://github.com/Blokdoc/Blokdoc)
- Twitter: [@Blok_doc_](https://x.com/Blok_doc_) 