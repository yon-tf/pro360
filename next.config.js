/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: "/professional/:id",
        destination: "/pro360/:id",
        permanent: true,
      },
      {
        source: "/professionals/:id",
        destination: "/professionals/:id/profile",
        permanent: true,
      },
      {
        source: "/professionals/:id/edit",
        destination: "/professionals/:id/profile/edit",
        permanent: true,
      },
      {
        source: "/professionals/:id/account",
        destination: "/professionals/:id/profile",
        permanent: true,
      },
      {
        source: "/professionals/:id/account/edit",
        destination: "/professionals/:id/profile/edit",
        permanent: true,
      },
      {
        source: "/professionals/:id/performance",
        destination: "/pro360/:id",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
        pathname: "/**",
      },
    ],
  },
  webpack: (config) => {
    // Suppress benign webpack cache resolution warnings (e.g. vendor-chunks in .next/server
    // from a previous or partial build). Build still succeeds; this keeps the log clean.
    config.infrastructureLogging = { level: 'error' };
    return config;
  },
};

module.exports = nextConfig;
