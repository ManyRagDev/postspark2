import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // Adicione esta linha para facilitar o deploy na Hostinger
    output: 'standalone', 
    images: {
        unoptimized: true, // Importante para não depender de bibliotecas extras no servidor
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
        ],
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
    },
};

export default nextConfig;