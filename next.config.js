/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  images: {
    unoptimized: true,
  },
  poweredByHeader: false,
  // Prevent browser caching of pages during development
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
  webpack(config, { isServer }) {
    config.resolve.alias['@'] = path.join(__dirname, 'src');
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false, net: false, tls: false, dns: false,
        child_process: false, buffer: false, stream: false,
        crypto: false, os: false, path: false, http: false,
        https: false, zlib: false, util: false, url: false,
        querystring: false, events: false, assert: false,
        constants: false, timers: false, string_decoder: false,
        punycode: false, process: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
