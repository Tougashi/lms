/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',
    reactStrictMode: true,
    onDemandEntries: {
        maxInactiveAge: 15_000,
        pagesBufferLength: 2,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.youtube.com",
                pathname: "/vi/**",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                pathname: "/**",
            },
        ],
    },
    async rewrites() {
        let apiUrl =
            process.env.NEXT_PUBLIC_API_URL ||
            "https://lms-express-api-o5uk.vercel.app/api/v1";
        if (!apiUrl.endsWith("/api/v1")) {
            apiUrl += "/api/v1";
        }
        return [
            {
                source: "/api-backend/:path*",
                destination: `${apiUrl}/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
