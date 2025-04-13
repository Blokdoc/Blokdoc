import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, Idl } from '@project-serum/anchor';
import { PROGRAM_ID } from '@/utils/constants';

let programId: PublicKey | null = null;
let program: Program | null = null;

export const getProgramId = (): PublicKey => {
  if (!programId) {
    programId = new PublicKey(PROGRAM_ID);
  }
  return programId;
};

export const getProgram = async (
  connection: Connection,
  wallet: any
): Promise<Program> => {
  if (!program) {
    // Initialize the provider
    const provider = new AnchorProvider(
      connection,
      wallet,
      AnchorProvider.defaultOptions()
    );
    
    // Load the IDL from the network
    // In production, you would want to load this from a local file
    try {
      const idl = await Program.fetchIdl(getProgramId(), provider);
      if (!idl) {
        throw new Error('IDL not found for program');
      }
      
      program = new Program(idl, getProgramId(), provider);
    } catch (error) {
      console.error('Failed to load program:', error);
      throw error;
    }
  }
  
  return program;
};

export const findDocumentManagerPDA = async (): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('document-manager')],
    getProgramId()
  );
};

export const findDocumentPDA = async (
  authority: PublicKey,
  documentCount: number
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('document'),
      authority.toBuffer(),
      Buffer.from(new Uint8Array(documentCount.toString().split('').map(char => char.charCodeAt(0))))
    ],
    getProgramId()
  );
};

export const findSignaturePDA = async (
  document: PublicKey,
  signer: PublicKey
): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from('signature'),
      document.toBuffer(),
      signer.toBuffer()
    ],
    getProgramId()
  );
}; 