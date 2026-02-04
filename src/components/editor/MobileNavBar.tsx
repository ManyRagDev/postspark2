'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Eye } from 'lucide-react';

interface MobileNavBarProps {
    editorSectionId?: string;
    previewSectionId?: string;
}

export function MobileNavBar({ 
    editorSectionId = 'editor-section', 
    previewSectionId = 'preview-section' 
}: MobileNavBarProps) {
    const [activeSection, setActiveSection] = useState<'editor' | 'preview'>('editor');

    // Track scroll position to update active tab
    useEffect(() => {
        const handleScroll = () => {
            const editorSection = document.getElementById(editorSectionId);
            const previewSection = document.getElementById(previewSectionId);
            
            if (!editorSection || !previewSection) return;

            const editorRect = editorSection.getBoundingClientRect();
            const previewRect = previewSection.getBoundingClientRect();
            const viewportMiddle = window.innerHeight / 2;

            // Determine which section is more visible in the viewport
            if (previewRect.top <= viewportMiddle && previewRect.bottom >= viewportMiddle) {
                setActiveSection('preview');
            } else if (editorRect.top <= viewportMiddle && editorRect.bottom >= viewportMiddle) {
                setActiveSection('editor');
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial check
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, [editorSectionId, previewSectionId]);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 lg:hidden"
        >
            <div className="flex items-center gap-1 p-1.5 bg-black/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
                {/* Edição Tab */}
                <button
                    onClick={() => {
                        setActiveSection('editor');
                        scrollToSection(editorSectionId);
                    }}
                    className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${activeSection === 'editor'
                            ? 'bg-white/15 text-white shadow-lg'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                        }
                    `}
                >
                    <Edit3 className="w-4 h-4" />
                    <span>edição</span>
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10" />

                {/* Visualização Tab */}
                <button
                    onClick={() => {
                        setActiveSection('preview');
                        scrollToSection(previewSectionId);
                    }}
                    className={`
                        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${activeSection === 'preview'
                            ? 'bg-white/15 text-white shadow-lg'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                        }
                    `}
                >
                    <Eye className="w-4 h-4" />
                    <span>visualização</span>
                </button>
            </div>
        </motion.div>
    );
}
