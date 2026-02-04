import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface BackgroundCategory {
    id: string;
    name: string;
    images: string[];
}

export async function GET() {
    try {
        const backgroundsDir = path.join(process.cwd(), 'public', 'images', 'backgrounds');

        // Se não existir, cria (segurança)
        if (!fs.existsSync(backgroundsDir)) {
            return NextResponse.json([]);
        }

        const categories: BackgroundCategory[] = [];
        const items = fs.readdirSync(backgroundsDir, { withFileTypes: true });

        for (const item of items) {
            if (item.isDirectory()) {
                const categoryPath = path.join(backgroundsDir, item.name);
                const images = fs.readdirSync(categoryPath)
                    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
                    .map(file => `/images/backgrounds/${item.name}/${file}`);

                if (images.length > 0) {
                    categories.push({
                        id: item.name,
                        name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
                        images,
                    });
                }
            }
        }

        return NextResponse.json(categories);
    } catch (error) {
        // console.error('Error listing backgrounds:', error);
        return NextResponse.json({ error: 'Failed to list backgrounds' }, { status: 500 });
    }
}
