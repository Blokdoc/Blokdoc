import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const Hero = () => {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted to avoid hydration issues with wallet adapter
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 md:pr-10 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Decentralized Document Management
              <span className="text-primary-600 dark:text-primary-400"> Reimagined</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl">
              Secure your documents on the blockchain, collaborate seamlessly, and maintain immutable records
              with our cutting-edge decentralized platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              {mounted && (
                <>
                  {connected ? (
                    <Link
                      href="/dashboard"
                      className="btn-primary py-3 px-8 text-center rounded-lg text-lg"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <div className="flex">
                      <WalletMultiButton className="bg-primary-600 hover:bg-primary-700 text-white py-3 px-8 rounded-lg text-lg" />
                    </div>
                  )}
                </>
              )}
              <Link
                href="/documents"
                className="btn-secondary py-3 px-8 text-center rounded-lg text-lg"
              >
                Explore Documents
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 mt-12 md:mt-0">
            <div className="relative w-full h-[400px] md:h-[500px]">
              <Image
                src="/images/hero-illustration.svg"
                alt="Document Management Illustration"
                fill
                style={{objectFit: 'contain'}}
                priority
              />
            </div>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">100%</div>
            <div className="text-gray-600 dark:text-gray-300">Decentralized</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">256-bit</div>
            <div className="text-gray-600 dark:text-gray-300">Encryption</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">10K+</div>
            <div className="text-gray-600 dark:text-gray-300">Documents Stored</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">99.9%</div>
            <div className="text-gray-600 dark:text-gray-300">Uptime</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero; 