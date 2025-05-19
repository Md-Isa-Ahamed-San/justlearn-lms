

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
      // {
      //   protocol: 'https',
      //   hostname: "i.pravatar.cc",
      //   pathname: '/**',
      // },
      {
        protocol: 'https',
        hostname: "res.cloudinary.com",
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
