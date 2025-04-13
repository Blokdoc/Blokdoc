import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Document, getDocumentFromBlockchain, downloadDocument } from '@/services/document';
import { getSolanaExplorerUrl, getSolanaTransactionUrl } from '@/blockchain/solana';
import { getIPFSUrl } from '@/services/storage/ipfs';
import { getArweaveUrl } from '@/services/storage/arweave';
import { DEVNET_ENDPOINT } from '@/utils/constants';

// Mock document for demonstration
const MOCK_DOCUMENT: Document = {
  id: 'doc1',
  name: 'Project Proposal.pdf',
  description: 'Proposal for the new blockchain project',
  fileType: 'application/pdf',
  fileSize: 1204000,
  createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
  updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  storageInfo: {
    ipfsCid: 'QmX5hgmdkLZ6EGdELVMmfLJAKLUuXjdKGGn8G4xqhqKJ4r',
    solanaSignature: '5KZbHjKFuLUFVqsaHKaULDbP4Zy5SW46WXTRzKhxEJgM3KjMQwJK7t5F9n3mXYtU3EamdK5KPQHs4GaNL2YrJxDt',
    documentPDA: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ',
  },
  owner: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ',
  version: 2,
  status: 'active',
  tags: ['proposal', 'project', 'blockchain'],
};

export default function DocumentView() {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [blockchainData, setBlockchainData] = useState<any>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const router = useRouter();
  const { id } = router.query;
  const { connected } = useWallet();
  
  // Fetch document data
  useEffect(() => {
    if (!id) return;
    
    const fetchDocument = async () => {
      setIsLoading(true);
      
      try {
        // In a real app, we would fetch from an API
        // For now, using mock data
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDocument(MOCK_DOCUMENT);
        
        // If document has PDA, fetch blockchain data
        if (MOCK_DOCUMENT.storageInfo.documentPDA) {
          const connection = new Connection(DEVNET_ENDPOINT);
          try {
            const data = await getDocumentFromBlockchain(
              MOCK_DOCUMENT.storageInfo.documentPDA,
              connection
            );
            setBlockchainData(data);
          } catch (error) {
            console.error('Error fetching blockchain data:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        setErrorMessage('Document not found or access denied');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocument();
  }, [id]);
  
  // Handle download
  const handleDownload = async () => {
    if (!document) return;
    
    setIsDownloading(true);
    
    try {
      // In a real app, we would fetch from IPFS or Arweave
      // For now, simulating download
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a mock file download
      const blob = new Blob(['Simulated Document Content'], { type: document.fileType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Error downloading document. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };
  
  // Format date for display
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Shorten address for display
  const shortenAddress = (address: string, chars = 4): string => {
    if (!address) return '';
    return `${address.substring(0, chars)}...${address.substring(address.length - chars)}`;
  };
  
  if (isLoading) {
    return (
      <>
        <Head>
          <title>Loading Document | Blokdoc</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-10">
            <div className="container mx-auto px-4 flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }
  
  if (errorMessage || !document) {
    return (
      <>
        <Head>
          <title>Error | Blokdoc</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-10">
            <div className="container mx-auto px-4 max-w-2xl text-center py-20">
              <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-lg mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {errorMessage || 'Document Not Found'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  The document you're looking for may have been moved, deleted, or you don't have permission to view it.
                </p>
              </div>
              <Link href="/dashboard" className="btn-primary">
                Return to Dashboard
              </Link>
            </div>
          </main>
          <Footer />
        </div>
      </>
    );
  }
  
  return (
    <>
      <Head>
        <title>{document.name} | Blokdoc</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-10">
          <div className="container mx-auto px-4">
            {/* Document Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Link href="/dashboard" className="text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                      Dashboard
                    </Link>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-700 dark:text-gray-300 truncate">{document.name}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{document.name}</h1>
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                  <button onClick={handleDownload} className="btn-primary" disabled={isDownloading}>
                    {isDownloading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Downloading...
                      </>
                    ) : (
                      'Download Document'
                    )}
                  </button>
                  <button className="btn-outline">
                    Share
                  </button>
                </div>
              </div>
              
              {document.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {document.description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-4">
                {document.tags?.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Preview */}
              <div className="lg:col-span-2">
                <div className="card overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
                    <h2 className="font-medium text-gray-900 dark:text-white">Preview</h2>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Version {document.version}
                    </div>
                  </div>
                  
                  <div className="p-4 flex justify-center items-center bg-gray-100 dark:bg-gray-800 h-80">
                    {document.fileType.includes('image') ? (
                      <img 
                        src={document.storageInfo.ipfsCid ? 
                          getIPFSUrl(document.storageInfo.ipfsCid) : 
                          '/images/document-placeholder.png'
                        } 
                        alt={document.name} 
                        className="max-h-full object-contain rounded" 
                      />
                    ) : document.fileType.includes('pdf') ? (
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400">PDF document preview not available</p>
                        <button onClick={handleDownload} className="mt-4 text-primary-600 dark:text-primary-400 hover:underline">
                          Download to view
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-600 dark:text-gray-400">Preview not available for this file type</p>
                        <button onClick={handleDownload} className="mt-4 text-primary-600 dark:text-primary-400 hover:underline">
                          Download to view
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Document Details */}
              <div className="space-y-6">
                <div className="card">
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                    <h2 className="font-medium text-gray-900 dark:text-white">Document Details</h2>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">File Type</div>
                      <div className="text-gray-900 dark:text-white">{document.fileType.split('/')[1].toUpperCase()}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Size</div>
                      <div className="text-gray-900 dark:text-white">{formatFileSize(document.fileSize)}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Owner</div>
                      <div className="text-gray-900 dark:text-white">
                        {shortenAddress(document.owner)}
                        {document.owner && (
                          <a 
                            href={getSolanaExplorerUrl(document.owner, 'devnet')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-primary-600 hover:underline"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Created</div>
                      <div className="text-gray-900 dark:text-white">{formatDate(document.createdAt)}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
                      <div className="text-gray-900 dark:text-white">{formatDate(document.updatedAt)}</div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                      <div className="flex items-center">
                        <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                          document.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                        }`}></span>
                        <span className="text-gray-900 dark:text-white capitalize">
                          {document.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="card">
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                    <h2 className="font-medium text-gray-900 dark:text-white">Blockchain Verification</h2>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    {document.storageInfo.ipfsCid && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">IPFS Content ID</div>
                        <div className="text-gray-900 dark:text-white break-all">
                          {shortenAddress(document.storageInfo.ipfsCid, 8)}
                          <a 
                            href={getIPFSUrl(document.storageInfo.ipfsCid)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-primary-600 hover:underline"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {document.storageInfo.arweaveTxId && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Arweave Transaction ID</div>
                        <div className="text-gray-900 dark:text-white break-all">
                          {shortenAddress(document.storageInfo.arweaveTxId, 8)}
                          <a 
                            href={getArweaveUrl(document.storageInfo.arweaveTxId)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-primary-600 hover:underline"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {document.storageInfo.solanaSignature && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Solana Transaction</div>
                        <div className="text-gray-900 dark:text-white break-all">
                          {shortenAddress(document.storageInfo.solanaSignature, 8)}
                          <a 
                            href={getSolanaTransactionUrl(document.storageInfo.solanaSignature, 'devnet')} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-primary-600 hover:underline"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                    
                    {blockchainData && (
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">Blockchain Data</div>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded p-2 mt-1 overflow-auto max-h-36">
                          <pre className="text-xs text-gray-900 dark:text-gray-200 whitespace-pre-wrap">
                            {JSON.stringify(blockchainData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {!document.storageInfo.ipfsCid && !document.storageInfo.arweaveTxId && !document.storageInfo.solanaSignature && (
                      <div className="text-gray-600 dark:text-gray-400 text-sm">
                        This document has not been verified on the blockchain.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
} 