//! Document verification program
//!
//! This program provides document verification functionality on the Solana blockchain.
//! It allows users to:
//! 1. Register document hashes for verification
//! 2. Verify document ownership
//! 3. Transfer document ownership
//! 4. Store metadata for documents

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
};
use borsh::{BorshDeserialize, BorshSerialize};
use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Program entrypoint
entrypoint!(process_instruction);

/// Instructions supported by the Document Verification program
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum DocumentInstruction {
    /// Register a new document hash
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Owner account
    /// 1. `[writable]` Document account (to be created)
    /// 2. `[]` System program
    RegisterDocument {
        /// Document hash (SHA-256 hash of document content)
        document_hash: String,
        /// Optional metadata (JSON string)
        metadata: Option<String>,
    },

    /// Update metadata for an existing document
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Owner account
    /// 1. `[writable]` Document account
    UpdateMetadata {
        /// New metadata (JSON string)
        metadata: String,
    },

    /// Transfer document ownership
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Current owner account
    /// 1. `[writable]` Document account
    /// 2. `[]` New owner account
    TransferOwnership,
}

/// Document account data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Document {
    /// Owner public key
    pub owner: Pubkey,
    /// Document hash
    pub document_hash: String,
    /// Timestamp when document was registered
    pub timestamp: u64,
    /// Optional metadata
    pub metadata: Option<String>,
}

/// Process program instruction
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruction
    let instruction = DocumentInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        DocumentInstruction::RegisterDocument { document_hash, metadata } => {
            process_register_document(program_id, accounts, document_hash, metadata)
        }
        DocumentInstruction::UpdateMetadata { metadata } => {
            process_update_metadata(program_id, accounts, metadata)
        }
        DocumentInstruction::TransferOwnership => {
            process_transfer_ownership(program_id, accounts)
        }
    }
}

/// Process RegisterDocument instruction
fn process_register_document(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    document_hash: String,
    metadata: Option<String>,
) -> ProgramResult {
    // Get account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Extract accounts
    let owner_account = next_account_info(account_info_iter)?;
    let document_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Verify owner is signer
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Create document data
    let document = Document {
        owner: *owner_account.key,
        document_hash,
        timestamp: solana_program::clock::Clock::get()?.unix_timestamp as u64,
        metadata,
    };

    // Create document account (In a real implementation, this would handle
    // account creation using system program instruction)
    msg!("Creating document account...");
    // In a real implementation, we would create the account here

    // Serialize and save document data to account
    document.serialize(&mut *document_account.data.borrow_mut())?;

    msg!("Document registered successfully");
    Ok(())
}

/// Process UpdateMetadata instruction
fn process_update_metadata(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    metadata: String,
) -> ProgramResult {
    // Get account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Extract accounts
    let owner_account = next_account_info(account_info_iter)?;
    let document_account = next_account_info(account_info_iter)?;

    // Verify owner is signer
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Verify document account is owned by program
    if document_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize document data
    let mut document = Document::try_from_slice(&document_account.data.borrow())?;

    // Verify ownership
    if document.owner != *owner_account.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // Update metadata
    document.metadata = Some(metadata);

    // Serialize and save updated document data
    document.serialize(&mut *document_account.data.borrow_mut())?;

    msg!("Document metadata updated successfully");
    Ok(())
}

/// Process TransferOwnership instruction
fn process_transfer_ownership(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    // Get account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Extract accounts
    let current_owner = next_account_info(account_info_iter)?;
    let document_account = next_account_info(account_info_iter)?;
    let new_owner = next_account_info(account_info_iter)?;

    // Verify current owner is signer
    if !current_owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Verify document account is owned by program
    if document_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize document data
    let mut document = Document::try_from_slice(&document_account.data.borrow())?;

    // Verify ownership
    if document.owner != *current_owner.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // Update owner
    document.owner = *new_owner.key;

    // Serialize and save updated document data
    document.serialize(&mut *document_account.data.borrow_mut())?;

    msg!("Document ownership transferred successfully");
    Ok(())
}

#[program]
pub mod blokdoc {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let document_manager = &mut ctx.accounts.document_manager;
        document_manager.authority = ctx.accounts.authority.key();
        document_manager.document_count = 0;
        Ok(())
    }

    pub fn register_document(
        ctx: Context<RegisterDocument>,
        document_hash: String,
        document_name: String,
        document_type: String,
        timestamp: i64,
    ) -> Result<()> {
        let document_manager = &mut ctx.accounts.document_manager;
        let document = &mut ctx.accounts.document;
        
        document.authority = ctx.accounts.authority.key();
        document.document_hash = document_hash;
        document.document_name = document_name;
        document.document_type = document_type;
        document.timestamp = timestamp;
        document.status = DocumentStatus::Active;
        document.version = 1;
        document.signatures_count = 0;
        
        document_manager.document_count += 1;
        
        emit!(DocumentRegistered {
            document_id: document.key(),
            authority: document.authority,
            document_hash: document.document_hash.clone(),
            timestamp: document.timestamp,
        });
        
        Ok(())
    }
    
    pub fn update_document(
        ctx: Context<UpdateDocument>,
        document_hash: String,
        timestamp: i64,
    ) -> Result<()> {
        let document = &mut ctx.accounts.document;
        
        require!(
            document.authority == ctx.accounts.authority.key(),
            DocumentError::Unauthorized
        );
        
        document.document_hash = document_hash;
        document.timestamp = timestamp;
        document.version += 1;
        
        emit!(DocumentUpdated {
            document_id: document.key(),
            authority: document.authority,
            document_hash: document.document_hash.clone(),
            version: document.version,
            timestamp,
        });
        
        Ok(())
    }
    
    pub fn sign_document(ctx: Context<SignDocument>, signature_hash: String) -> Result<()> {
        let document = &mut ctx.accounts.document;
        let signature = &mut ctx.accounts.signature;
        
        signature.document = document.key();
        signature.signer = ctx.accounts.signer.key();
        signature.signature_hash = signature_hash;
        signature.timestamp = Clock::get()?.unix_timestamp;
        
        document.signatures_count += 1;
        
        emit!(DocumentSigned {
            document_id: document.key(),
            signer: signature.signer,
            signature_id: signature.key(),
            timestamp: signature.timestamp,
        });
        
        Ok(())
    }
    
    pub fn archive_document(ctx: Context<ArchiveDocument>) -> Result<()> {
        let document = &mut ctx.accounts.document;
        
        require!(
            document.authority == ctx.accounts.authority.key(),
            DocumentError::Unauthorized
        );
        
        document.status = DocumentStatus::Archived;
        
        emit!(DocumentArchived {
            document_id: document.key(),
            authority: document.authority,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8,
        seeds = [b"document-manager"],
        bump
    )]
    pub document_manager: Account<'info, DocumentManager>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterDocument<'info> {
    #[account(
        mut,
        seeds = [b"document-manager"],
        bump
    )]
    pub document_manager: Account<'info, DocumentManager>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 256 + 100 + 50 + 8 + 1 + 4 + 8,
        seeds = [b"document", authority.key().as_ref(), &document_manager.document_count.to_le_bytes()],
        bump
    )]
    pub document: Account<'info, Document>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateDocument<'info> {
    #[account(mut)]
    pub document: Account<'info, Document>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SignDocument<'info> {
    #[account(mut)]
    pub document: Account<'info, Document>,
    
    #[account(
        init,
        payer = signer,
        space = 8 + 32 + 32 + 64 + 8,
        seeds = [b"signature", document.key().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub signature: Account<'info, DocumentSignature>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ArchiveDocument<'info> {
    #[account(mut)]
    pub document: Account<'info, Document>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct DocumentManager {
    pub authority: Pubkey,
    pub document_count: u64,
}

#[account]
pub struct Document {
    pub authority: Pubkey,
    pub document_hash: String,
    pub document_name: String,
    pub document_type: String,
    pub timestamp: i64,
    pub status: DocumentStatus,
    pub version: u32,
    pub signatures_count: u64,
}

#[account]
pub struct DocumentSignature {
    pub document: Pubkey,
    pub signer: Pubkey,
    pub signature_hash: String,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum DocumentStatus {
    Active,
    Archived,
}

#[error_code]
pub enum DocumentError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
}

// Events
#[event]
pub struct DocumentRegistered {
    pub document_id: Pubkey,
    pub authority: Pubkey,
    pub document_hash: String,
    pub timestamp: i64,
}

#[event]
pub struct DocumentUpdated {
    pub document_id: Pubkey,
    pub authority: Pubkey,
    pub document_hash: String,
    pub version: u32,
    pub timestamp: i64,
}

#[event]
pub struct DocumentSigned {
    pub document_id: Pubkey,
    pub signer: Pubkey,
    pub signature_id: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DocumentArchived {
    pub document_id: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
} 
    msg!("Document ownership transferred successfully");
    Ok(())
}

#[program]
pub mod blokdoc {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let document_manager = &mut ctx.accounts.document_manager;
        document_manager.authority = ctx.accounts.authority.key();
        document_manager.document_count = 0;
        Ok(())
    }

    pub fn register_document(
        ctx: Context<RegisterDocument>,
        document_hash: String,
        document_name: String,
        document_type: String,
        timestamp: i64,
    ) -> Result<()> {
        let document_manager = &mut ctx.accounts.document_manager;
        let document = &mut ctx.accounts.document;
        
        document.authority = ctx.accounts.authority.key();
        document.document_hash = document_hash;
        document.document_name = document_name;
        document.document_type = document_type;
        document.timestamp = timestamp;
        document.status = DocumentStatus::Active;
        document.version = 1;
        document.signatures_count = 0;
        
        document_manager.document_count += 1;
        
        emit!(DocumentRegistered {
            document_id: document.key(),
            authority: document.authority,
            document_hash: document.document_hash.clone(),
            timestamp: document.timestamp,
        });
        
        Ok(())
    }
    
    pub fn update_document(
        ctx: Context<UpdateDocument>,
        document_hash: String,
        timestamp: i64,
    ) -> Result<()> {
        let document = &mut ctx.accounts.document;
        
        require!(
            document.authority == ctx.accounts.authority.key(),
            DocumentError::Unauthorized
        );
        
        document.document_hash = document_hash;
        document.timestamp = timestamp;
        document.version += 1;
        
        emit!(DocumentUpdated {
            document_id: document.key(),
            authority: document.authority,
            document_hash: document.document_hash.clone(),
            version: document.version,
            timestamp,
        });
        
        Ok(())
    }
    
    pub fn sign_document(ctx: Context<SignDocument>, signature_hash: String) -> Result<()> {
        let document = &mut ctx.accounts.document;
        let signature = &mut ctx.accounts.signature;
        
        signature.document = document.key();
        signature.signer = ctx.accounts.signer.key();
        signature.signature_hash = signature_hash;
        signature.timestamp = Clock::get()?.unix_timestamp;
        
        document.signatures_count += 1;
        
        emit!(DocumentSigned {
            document_id: document.key(),
            signer: signature.signer,
            signature_id: signature.key(),
            timestamp: signature.timestamp,
        });
        
        Ok(())
    }
    
    pub fn archive_document(ctx: Context<ArchiveDocument>) -> Result<()> {
        let document = &mut ctx.accounts.document;
        
        require!(
            document.authority == ctx.accounts.authority.key(),
            DocumentError::Unauthorized
        );
        
        document.status = DocumentStatus::Archived;
        
        emit!(DocumentArchived {
            document_id: document.key(),
            authority: document.authority,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 8,
        seeds = [b"document-manager"],
        bump
    )]
    pub document_manager: Account<'info, DocumentManager>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterDocument<'info> {
    #[account(
        mut,
        seeds = [b"document-manager"],
        bump
    )]
    pub document_manager: Account<'info, DocumentManager>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + 32 + 256 + 100 + 50 + 8 + 1 + 4 + 8,
        seeds = [b"document", authority.key().as_ref(), &document_manager.document_count.to_le_bytes()],
        bump
    )]
    pub document: Account<'info, Document>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateDocument<'info> {
    #[account(mut)]
    pub document: Account<'info, Document>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SignDocument<'info> {
    #[account(mut)]
    pub document: Account<'info, Document>,
    
    #[account(
        init,
        payer = signer,
        space = 8 + 32 + 32 + 64 + 8,
        seeds = [b"signature", document.key().as_ref(), signer.key().as_ref()],
        bump
    )]
    pub signature: Account<'info, DocumentSignature>,
    
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ArchiveDocument<'info> {
    #[account(mut)]
    pub document: Account<'info, Document>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[account]
pub struct DocumentManager {
    pub authority: Pubkey,
    pub document_count: u64,
}

#[account]
pub struct Document {
    pub authority: Pubkey,
    pub document_hash: String,
    pub document_name: String,
    pub document_type: String,
    pub timestamp: i64,
    pub status: DocumentStatus,
    pub version: u32,
    pub signatures_count: u64,
}

#[account]
pub struct DocumentSignature {
    pub document: Pubkey,
    pub signer: Pubkey,
    pub signature_hash: String,
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum DocumentStatus {
    Active,
    Archived,
}

#[error_code]
pub enum DocumentError {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
}

// Events
#[event]
pub struct DocumentRegistered {
    pub document_id: Pubkey,
    pub authority: Pubkey,
    pub document_hash: String,
    pub timestamp: i64,
}

#[event]
pub struct DocumentUpdated {
    pub document_id: Pubkey,
    pub authority: Pubkey,
    pub document_hash: String,
    pub version: u32,
    pub timestamp: i64,
}

#[event]
pub struct DocumentSigned {
    pub document_id: Pubkey,
    pub signer: Pubkey,
    pub signature_id: Pubkey,
    pub timestamp: i64,
}

#[event]
pub struct DocumentArchived {
    pub document_id: Pubkey,
    pub authority: Pubkey,
    pub timestamp: i64,
} 
//!
//! This program provides document verification functionality on the Solana blockchain.
//! It allows users to:
//! 1. Register document hashes for verification
//! 2. Verify document ownership
//! 3. Transfer document ownership
//! 4. Store metadata for documents

use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
    sysvar::{rent::Rent, Sysvar},
};
use borsh::{BorshDeserialize, BorshSerialize};

/// Program entrypoint
entrypoint!(process_instruction);

/// Instructions supported by the Document Verification program
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum DocumentInstruction {
    /// Register a new document hash
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Owner account
    /// 1. `[writable]` Document account (to be created)
    /// 2. `[]` System program
    RegisterDocument {
        /// Document hash (SHA-256 hash of document content)
        document_hash: String,
        /// Optional metadata (JSON string)
        metadata: Option<String>,
    },

    /// Update metadata for an existing document
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Owner account
    /// 1. `[writable]` Document account
    UpdateMetadata {
        /// New metadata (JSON string)
        metadata: String,
    },

    /// Transfer document ownership
    /// 
    /// Accounts expected:
    /// 0. `[signer]` Current owner account
    /// 1. `[writable]` Document account
    /// 2. `[]` New owner account
    TransferOwnership,
}

/// Document account data
#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct Document {
    /// Owner public key
    pub owner: Pubkey,
    /// Document hash
    pub document_hash: String,
    /// Timestamp when document was registered
    pub timestamp: u64,
    /// Optional metadata
    pub metadata: Option<String>,
}

/// Process program instruction
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    // Deserialize instruction
    let instruction = DocumentInstruction::try_from_slice(instruction_data)
        .map_err(|_| ProgramError::InvalidInstructionData)?;

    match instruction {
        DocumentInstruction::RegisterDocument { document_hash, metadata } => {
            process_register_document(program_id, accounts, document_hash, metadata)
        }
        DocumentInstruction::UpdateMetadata { metadata } => {
            process_update_metadata(program_id, accounts, metadata)
        }
        DocumentInstruction::TransferOwnership => {
            process_transfer_ownership(program_id, accounts)
        }
    }
}

/// Process RegisterDocument instruction
fn process_register_document(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    document_hash: String,
    metadata: Option<String>,
) -> ProgramResult {
    // Get account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Extract accounts
    let owner_account = next_account_info(account_info_iter)?;
    let document_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    // Verify owner is signer
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Create document data
    let document = Document {
        owner: *owner_account.key,
        document_hash,
        timestamp: solana_program::clock::Clock::get()?.unix_timestamp as u64,
        metadata,
    };

    // Create document account (In a real implementation, this would handle
    // account creation using system program instruction)
    msg!("Creating document account...");
    // In a real implementation, we would create the account here

    // Serialize and save document data to account
    document.serialize(&mut *document_account.data.borrow_mut())?;

    msg!("Document registered successfully");
    Ok(())
}

/// Process UpdateMetadata instruction
fn process_update_metadata(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    metadata: String,
) -> ProgramResult {
    // Get account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Extract accounts
    let owner_account = next_account_info(account_info_iter)?;
    let document_account = next_account_info(account_info_iter)?;

    // Verify owner is signer
    if !owner_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Verify document account is owned by program
    if document_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize document data
    let mut document = Document::try_from_slice(&document_account.data.borrow())?;

    // Verify ownership
    if document.owner != *owner_account.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // Update metadata
    document.metadata = Some(metadata);

    // Serialize and save updated document data
    document.serialize(&mut *document_account.data.borrow_mut())?;

    msg!("Document metadata updated successfully");
    Ok(())
}

/// Process TransferOwnership instruction
fn process_transfer_ownership(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
) -> ProgramResult {
    // Get account iterator
    let account_info_iter = &mut accounts.iter();
    
    // Extract accounts
    let current_owner = next_account_info(account_info_iter)?;
    let document_account = next_account_info(account_info_iter)?;
    let new_owner = next_account_info(account_info_iter)?;

    // Verify current owner is signer
    if !current_owner.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    // Verify document account is owned by program
    if document_account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Deserialize document data
    let mut document = Document::try_from_slice(&document_account.data.borrow())?;

    // Verify ownership
    if document.owner != *current_owner.key {
        return Err(ProgramError::InvalidAccountData);
    }

    // Update owner
    document.owner = *new_owner.key;

    // Serialize and save updated document data
    document.serialize(&mut *document_account.data.borrow_mut())?;

    msg!("Document ownership transferred successfully");
    Ok(())
} 