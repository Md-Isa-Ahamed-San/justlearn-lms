

// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn1.iconfinder.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: "avatars.githubusercontent.com",
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: "i.pravatar.cc",
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
