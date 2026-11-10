/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
