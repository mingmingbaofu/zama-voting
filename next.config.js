/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      http: false,
      https: false,
      zlib: false,
      path: false,
      os: false,
    };
    
    // Add support for WASM files
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      syncWebAssembly: true,
    };
    
    // Handle WASM files with multiple rules
    config.module.rules.push(
      {
        test: /\.wasm$/,
        type: 'webassembly/async',
      },
      {
        test: /\.wasm$/,
        type: 'asset/resource',
      }
    );
    
    // Ignore specific problematic modules on client side
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
      
      // Add externals for problematic WASM modules
      config.externals = config.externals || [];
      config.externals.push({
        '@zama-fhe/relayer-sdk/lib/kms_lib_bg.wasm': 'commonjs @zama-fhe/relayer-sdk/lib/kms_lib_bg.wasm',
        '@zama-fhe/relayer-sdk/lib/tfhe_bg.wasm': 'commonjs @zama-fhe/relayer-sdk/lib/tfhe_bg.wasm',
      });
    }
    
    return config;
  },
};

module.exports = nextConfig;