'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    RotateCcw,
    Image,
    Palette,
    Layout,
    Type,
} from 'lucide-react';
import { ImageTab } from './ImageTab';
import { DesignTab } from './DesignTab';
import { LayoutTab } from './LayoutTab';
import { TextTab } from './TextTab';
import type {
    EditSettings,
    ImageSettings,
    DesignSettings,
    LayoutSettings,
    TextSettings,
} from '@/types/editor';
import type { AmbientConfig } from '@/types/ambient';

type TabId = 'image' | 'design' | 'layout' | 'text';

interface Tab {
    id: TabId;
    label: string;
    icon: React.ElementType;
}

const TABS: Tab[] = [
    { id: 'image', label: 'Imagem', icon: Image },
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'text', label: 'Texto', icon: Type },
];

export interface EditPanelProps {
    isOpen: boolean;
    onClose: () => void;
    settings: EditSettings;
    ambientConfig: AmbientConfig;
    onUpdateImage: (updates: Partial<ImageSettings>) => void;
    onUpdateDesign: (updates: Partial<DesignSettings>) => void;
    onUpdateLayout: (updates: Partial<LayoutSettings>) => void;
    onUpdateText: (updates: Partial<TextSettings>) => void;
    onReset: () => void;
    generatedHeadline?: string;
    generatedBody?: string;
}

export function EditPanel({
    isOpen,
    onClose,
    settings,
    ambientConfig,
    onUpdateImage,
    onUpdateDesign,
    onUpdateLayout,
    onUpdateText,
    onReset,
    generatedHeadline,
    generatedBody,
}: EditPanelProps) {
    const [activeTab, setActiveTab] = useState<TabId>('image');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'image':
                return (
                    <ImageTab
                        settings={settings.image}
                        onChange={onUpdateImage}
                    />
                );
            case 'design':
                return (
                    <DesignTab
                        settings={settings.design}
                        onChange={onUpdateDesign}
                        ambientConfig={ambientConfig}
                    />
                );
            case 'layout':
                return (
                    <LayoutTab
                        settings={settings.layout}
                        onChange={onUpdateLayout}
                    />
                );
            case 'text':
                return (
                    <TextTab
                        settings={settings.text}
                        onChange={onUpdateText}
                        generatedHeadline={generatedHeadline}
                        generatedBody={generatedBody}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: -400 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -400 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="fixed left-0 top-0 h-full w-full max-w-md bg-[#12121a] border-r border-white/10 z-50 flex flex-col shadow-2xl"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div>
                            <h3 className="text-lg font-semibold text-white">
                                Controle Total
                            </h3>
                            <p className="text-xs text-white/50">
                                Ajuste fino do seu post
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-white/60" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10 bg-black/20">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex-1 flex flex-col items-center gap-1 py-3 px-2 transition-all relative
                                    ${activeTab === tab.id
                                        ? 'text-violet-400'
                                        : 'text-white/50 hover:text-white/70'
                                    }
                                `}
                            >
                                <tab.icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-violet-500 rounded-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-white/10 bg-black/20">
                        {/* Override Indicator */}
                        {settings.isManualOverride && (
                            <p className="text-xs text-amber-400 mb-3 flex items-center gap-1">
                                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                                Voce fez alteracoes manuais
                            </p>
                        )}

                        <button
                            onClick={onReset}
                            className="w-full flex items-center justify-center gap-2 py-3
                                       bg-white/5 hover:bg-white/10 rounded-lg
                                       text-white/70 font-medium transition-all"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Resetar para Automatico
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
