/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'http',
          hostname: 'localhost',
          port: '5001',
          pathname: '/images/**',
        },
      ],
    },
};


  

export default nextConfig;
