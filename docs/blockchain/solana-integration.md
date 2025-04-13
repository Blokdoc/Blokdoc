# Solana Blockchain Integration

This document describes how Blokdoc integrates with the Solana blockchain to provide secure document verification and ownership tracking.

## Overview

Blokdoc leverages Solana's high-performance blockchain to store document verification information, including document hashes, timestamps, and ownership details. This integration provides a trustless and immutable record of document authenticity and history.

## Key Components

### 1. Smart Contract (Program)

The Blokdoc Solana program is deployed on the Solana devnet (and mainnet for production) and provides the following functionality:

- Document registration
- Ownership tracking
- Hash verification
- Document signing
- Archiving

### 2. Program Accounts

The program uses several account types to store document information:

#### DocumentManager

A singleton account that manages global program state, including:
- Total number of documents registered
- Program configuration
- Fee settings

#### Document

Stores information about each registered document:
- Document hash
- Name
- Document type
- Creation timestamp
- Owner's public key
- Version number
- Status (active/archived)

#### Signature

Stores information about document signatures:
- Signer's public key
- Signature hash
- Timestamp
- Status

## Integration Flow

### 1. Document Registration

When a user uploads a document and chooses to register it on the blockchain:

1. Document is processed and its hash is calculated using SHA-256
2. A transaction is created to call the `registerDocument` instruction
3. User signs the transaction with their connected wallet
4. Transaction is submitted to the Solana network
5. Upon successful execution, the document's metadata and hash are stored on-chain
6. The resulting transaction signature and PDA (Program Derived Address) are stored with the document metadata

```typescript
// Example code for registering a document
const tx = await program.methods
  .registerDocument(documentHash, documentName, documentType, new BN(timestamp))
  .accounts({
    documentManager: documentManagerPDA,
    document: documentPDA,
    authority: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### 2. Document Verification

To verify a document's authenticity:

1. The document is hashed using the same algorithm
2. The document's PDA is used to fetch on-chain data
3. The stored hash is compared with the calculated hash
4. Timestamp and ownership information are validated
5. Verification result is returned to the user

```typescript
// Example code for verifying a document
const documentAccount = await program.account.document.fetch(documentPDA);
const isAuthentic = documentAccount.documentHash === calculatedHash;
```

### 3. Document Signatures

Users can sign documents to indicate approval or review:

1. User initiates signing process
2. A signature hash is generated (including signer information)
3. Transaction is created calling the `signDocument` instruction
4. User signs the transaction with their wallet
5. Transaction is submitted to the Solana network
6. Signature record is stored on-chain

```typescript
// Example code for signing a document
const tx = await program.methods
  .signDocument(signatureHash)
  .accounts({
    document: documentPDA,
    signature: signaturePDA,
    signer: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

## Account Structure

### Document Account

```rust
#[account]
pub struct Document {
    pub authority: Pubkey,        // Document owner
    pub document_hash: String,    // SHA-256 hash of the document
    pub document_name: String,    // Name of the document
    pub document_type: String,    // Type/format of the document
    pub timestamp: i64,           // Creation timestamp
    pub version: u16,             // Document version
    pub status: DocumentStatus,   // Active or archived
    pub signature_count: u16,     // Number of signatures
}
```

### Signature Account

```rust
#[account]
pub struct Signature {
    pub document: Pubkey,         // Reference to document PDA
    pub signer: Pubkey,           // Signer's wallet address
    pub signature_hash: String,   // Hash of the signature data
    pub timestamp: i64,           // Signature timestamp
    pub status: SignatureStatus,  // Status of the signature
}
```

## Transaction Costs

Operations on the Solana blockchain require transaction fees, which are paid in SOL. The current estimated costs are:

| Operation | Approximate Cost (SOL) |
|-----------|------------------------|
| Document Registration | 0.00001 |
| Signature | 0.000005 |
| Status Update | 0.000001 |

These costs may vary based on network conditions and Solana's fee market.

## Development vs Production

### Devnet

For development and testing, Blokdoc uses the Solana devnet:
- Endpoint: `https://api.devnet.solana.com`
- Explorer: `https://explorer.solana.com/?cluster=devnet`
- Test tokens can be obtained from Solana's faucet

### Mainnet

For production use, Blokdoc connects to the Solana mainnet:
- Endpoint: `https://api.mainnet-beta.solana.com`
- Explorer: `https://explorer.solana.com/`
- Real SOL is required for transactions

## Security Considerations

- All transaction signing is done client-side, ensuring private keys never leave the user's device
- Document content is not stored on-chain, only its hash and metadata
- All blockchain interactions are logged for audit purposes
- Program upgrades require multisig authorization

## Future Enhancements

Planned improvements to the blockchain integration include:

1. Token-gated document access
2. DAO-based document governance
3. Integration with Solana SPL tokens for document tokenization
4. Cross-chain verification via wormhole
5. On-chain document revision history 