import { useState, useRef, useCallback, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useWallet } from '@solana/wallet-adapter-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { uploadDocument, validateFile } from '@/services/document';
import { SUPPORTED_FILE_TYPES } from '@/utils/constants';

export default function UploadDocument() {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentTags, setDocumentTags] = useState('');
  const [storageOption, setStorageOption] = useState<'ipfs' | 'arweave'>('ipfs');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { connected, publicKey, signTransaction } = useWallet();

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file
      const validation = validateFile(selectedFile);
      
      if (!validation.valid) {
        setFileError(validation.message || 'Invalid file');
        setFile(null);
      } else {
        setFileError(null);
        setFile(selectedFile);
        
        // Auto-populate document name if not already set
        if (!documentName) {
          setDocumentName(selectedFile.name);
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setFileError('Please select a file to upload');
      return;
    }
    
    if (!connected || !publicKey) {
      alert('Please connect your wallet to upload documents');
      return;
    }
    
    try {
      setIsUploading(true);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      // Parse tags
      const tags = documentTags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Upload document
      const wallet = { publicKey, signTransaction };
      const document = await uploadDocument(
        file,
        wallet,
        {
          name: documentName || file.name,
          description: documentDescription,
          tags,
        },
        {
          preferredStorage: storageOption,
          registerOnChain: true,
        }
      );
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Redirect to document view page
      setTimeout(() => {
        router.push(`/documents/${document.id}`);
      }, 1000);
    } catch (error) {
      console.error('Error uploading document:', error);
      setFileError('Error uploading document. Please try again.');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Validate file
      const validation = validateFile(droppedFile);
      
      if (!validation.valid) {
        setFileError(validation.message || 'Invalid file');
        setFile(null);
      } else {
        setFileError(null);
        setFile(droppedFile);
        
        // Auto-populate document name if not already set
        if (!documentName) {
          setDocumentName(droppedFile.name);
        }
      }
    }
  }, [documentName]);

  // Format supported file types for display
  const formatSupportedTypes = () => {
    return SUPPORTED_FILE_TYPES.map(type => type.split('/')[1].toUpperCase()).join(', ');
  };

  return (
    <>
      <Head>
        <title>Upload Document | Blokdoc</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-10">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Upload Document</h1>
            
            <div className="card p-6">
              <form onSubmit={handleSubmit}>
                {/* File Upload */}
                <div className="mb-6">
                  <label className="label">Document File</label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      fileError ? 'border-red-400 dark:border-red-600' : 'border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      onChange={handleFileChange}
                      accept={SUPPORTED_FILE_TYPES.join(',')}
                    />
                    
                    {file ? (
                      <div className="py-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">{file.name}</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                        </p>
                        <button
                          type="button"
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            if (fileInputRef.current) {
                              fileInputRef.current.value = '';
                            }
                          }}
                        >
                          Choose a different file
                        </button>
                      </div>
                    ) : (
                      <div className="py-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 dark:text-white">Drag and drop your file here</p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          or <span className="text-primary-600 dark:text-primary-400">browse files</span>
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-2">
                          Supported formats: {formatSupportedTypes()}
                        </p>
                      </div>
                    )}
                  </div>
                  {fileError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{fileError}</p>
                  )}
                </div>
                
                {/* Document Details */}
                <div className="space-y-4">
                  <div>
                    <label htmlFor="documentName" className="label">Document Name</label>
                    <input
                      type="text"
                      id="documentName"
                      className="input"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="Enter document name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="documentDescription" className="label">Description (optional)</label>
                    <textarea
                      id="documentDescription"
                      className="input min-h-[100px]"
                      value={documentDescription}
                      onChange={(e) => setDocumentDescription(e.target.value)}
                      placeholder="Enter document description"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="documentTags" className="label">Tags (comma separated, optional)</label>
                    <input
                      type="text"
                      id="documentTags"
                      className="input"
                      value={documentTags}
                      onChange={(e) => setDocumentTags(e.target.value)}
                      placeholder="e.g. contract, legal, draft"
                    />
                  </div>
                  
                  <div>
                    <label className="label">Storage Option</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`p-4 border rounded-lg text-center transition ${
                          storageOption === 'ipfs'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-300 dark:border-gray-700'
                        }`}
                        onClick={() => setStorageOption('ipfs')}
                      >
                        <div className="font-medium mb-1">IPFS</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Distributed file storage with content addressing
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        className={`p-4 border rounded-lg text-center transition ${
                          storageOption === 'arweave'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'border-gray-300 dark:border-gray-700'
                        }`}
                        onClick={() => setStorageOption('arweave')}
                      >
                        <div className="font-medium mb-1">Arweave</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Permanent storage on the Arweave blockchain
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
                
                {isUploading && (
                  <div className="mt-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">Uploading...</span>
                      <span className="text-gray-700 dark:text-gray-300">{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => router.back()}
                    disabled={isUploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={!file || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
} 