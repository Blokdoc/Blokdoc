import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold text-primary-600">Blokdoc</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md">
              Decentralized Intelligent Document Management and Collaboration Platform
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Product</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/features" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Pricing</Link></li>
                <li><Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">About</Link></li>
                <li><Link href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Blog</Link></li>
                <li><Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Contact</Link></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Connect</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="https://x.com/Blok_doc_" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">Twitter</a></li>
                <li><a href="https://github.com/Blokdoc/Blokdoc" className="text-gray-600 dark:text-gray-400 hover:text-primary-600">GitHub</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Blokdoc. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
