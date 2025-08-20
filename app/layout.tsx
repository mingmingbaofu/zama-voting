import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Zama FHE Voting DApp',
  description: 'A privacy-preserving voting application using Zama\'s Fully Homomorphic Encryption',
  keywords: ['voting', 'privacy', 'blockchain', 'FHE', 'Zama', 'encryption'],
  authors: [{ name: 'Zama Voting Team' }],
  openGraph: {
    title: 'Zama FHE Voting DApp',
    description: 'Vote privately with fully homomorphic encryption',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* 添加CDN脚本 */}
        <script 
          type="module" 
          dangerouslySetInnerHTML={{
            __html: `
              import { initSDK, createInstance, SepoliaConfig } from "https://cdn.zama.ai/relayer-sdk-js/0.1.2/relayer-sdk-js.js";
              
              window.zamaSDK = {
                initSDK,
                createInstance,
                SepoliaConfig
              };
              
              // 全局初始化
              window.initZamaFHE = async () => {
                await initSDK();
                const config = { ...SepoliaConfig, network: window.ethereum };
                const instance = await createInstance(config);
                window.zamaInstance = instance;
                return instance;
              };
            `
          }}
        />
      </head>
      <body className="font-sans">
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <header className="bg-white shadow-sm border-b">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2L3 7v11a1 1 0 001 1h3v-8h6v8h3a1 1 0 001-1V7l-7-5z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Zama FHE Voting</h1>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-600">
                      Privacy-First Voting
                    </div>
                  </div>
                </div>
              </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <footer className="bg-white border-t mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center text-gray-600">
                  <p className="mb-2">Powered by Zama&apos;s Fully Homomorphic Encryption</p>
                  <p className="text-sm">Your votes are encrypted and remain private throughout the entire process</p>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  )
}