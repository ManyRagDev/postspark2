'use client';

import { MagicInterface } from '@/components/editor/MagicInterface';

export default function Dashboard() {
    const handleGenerate = async (text: string) => {
        // Será implementado com a Pipeline de Especialistas
        // console.log('Generating post:', text);
    };

    return (
        <main className="min-h-screen">
            <MagicInterface onGenerate={handleGenerate} />
        </main>
    );
}
