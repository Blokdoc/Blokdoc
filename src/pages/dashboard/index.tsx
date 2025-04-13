import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Document } from '@/services/document';

// Mock data for demonstration purposes
const MOCK_DOCUMENTS: Document[] = [
  {
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
    },
    owner: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ',
    version: 2,
    status: 'active',
    tags: ['proposal', 'project', 'blockchain'],
  },
  {
    id: 'doc2',
    name: 'Meeting Notes.docx',
    description: 'Notes from the team meeting on blockchain security',
    fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    fileSize: 853000,
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    storageInfo: {
      ipfsCid: 'QmYXL4NpZA4PW4XzmPsxmvEWfEVNS6W6RF5rTh4QBKDJLe',
      arweaveTxId: 'ar:GDkzEnZXjP0n5OvpQ7FhyRMKMYzTvDHdLXgVZkVXkMc',
    },
    owner: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ',
    version: 1,
    status: 'active',
    tags: ['meeting', 'notes', 'security'],
  },
  {
    id: 'doc3',
    name: 'Smart Contract Audit.pdf',
    description: 'Security audit for the new smart contract',
    fileType: 'application/pdf',
    fileSize: 2548000,
    createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
    updatedAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
    storageInfo: {
      arweaveTxId: 'ar:XwPRHAYV_OhVXmSmPoy9n-LHNnXdPnVO_wPJCYRApJ8',
      solanaSignature: '4wry77oEhPS2MnKmALvjpRQKZgYvTjKZrRXmRLB7JqkzQ9Njy1jJXdBjxdvB1XHtKWwJqmzCBG4JYyGHnrZZMbdS',
    },
    owner: 'BWDKZpACPidQNXXK6K9HGLVWsrjhSPdBGDBHVt3JvjYJ',
    version: 1,
    status: 'active',
    tags: ['audit', 'security', 'smart-contract'],
  },
];

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { connected, publicKey } = useWallet();

  // Fetch user's documents
  useEffect(() => {
    // Check if user is connected
    if (!connected) {
      return;
    }

    // In a real app, we would fetch documents from an API or blockchain
    // For now, using mock data
    setIsLoading(true);
    setTimeout(() => {
      setDocuments(MOCK_DOCUMENTS);
      setIsLoading(false);
    }, 1000);
  }, [connected, publicKey]);

  // Redirect to login if not connected
  useEffect(() => {
    if (!connected && typeof window !== 'undefined') {
      // Add a small delay to prevent immediate redirect during initialization
      const timer = setTimeout(() => {
        router.push('/');
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [connected, router]);

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
    });
  };

  return (
    <>
      <Head>
        <title>Dashboard | Blokdoc</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-10">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Your Documents</h1>
              <div className="flex space-x-4">
                <button className="btn-primary">
                  Upload Document
                </button>
                {!connected && (
                  <WalletMultiButton />
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {documents.map((doc) => (
                  <div key={doc.id} className="card hover:shadow-lg transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white truncate">
                            {doc.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {formatFileSize(doc.fileSize)} • {doc.fileType.split('/')[1].toUpperCase()}
                          </p>
                        </div>
                        <div className="flex space-x-1">
                          <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                          <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-primary-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <button className="p-1 text-gray-600 dark:text-gray-400 hover:text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {doc.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-3 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-3 mb-4">
                        {doc.tags?.map((tag) => (
                          <span key={tag} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>Created: {formatDate(doc.createdAt)}</span>
                        <span>v{doc.version}</span>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button className="btn-primary py-2 px-4 text-sm w-full">
                          View Document
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-gray-100 dark:bg-gray-800 inline-flex p-5 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No documents yet</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Upload your first document to get started with secure blockchain storage.
                </p>
                <button className="btn-primary">
                  Upload Document
                </button>
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
} 