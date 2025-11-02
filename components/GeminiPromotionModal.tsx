import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Modal from './Modal';
import { SparklesIcon, ArrowPathIcon } from './Icons';

interface GeminiPromotionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (name: string, details: string) => void;
    context: {
        artistName: string;
        songTitle: string;
    };
}

const GeminiPromotionModal = ({ isOpen, onClose, onApply, context }: GeminiPromotionModalProps) => {
    const [prompt, setPrompt] = useState('');
    const [generated, setGenerated] = useState<{ name: string; details: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGenerated(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const fullPrompt = `
                Sua tarefa é criar o nome e a descrição de uma promoção para uma rádio.

                **Contexto:**
                - Artista: ${context.artistName || 'Não especificado'}
                - Música: ${context.songTitle || 'Não especificada'}
                
                **Objetivo da Promoção (definido pelo usuário):** 
                ${prompt}

                Gere um nome (name) e uma descrição detalhada (details) para esta promoção. O nome deve ser curto e cativante. A descrição deve explicar como a promoção funciona de forma clara.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    systemInstruction: `Você é um especialista em marketing de rádio no Brasil. Sua tarefa é criar nomes e descrições para promoções musicais. O tom deve ser empolgante e fácil de entender para os ouvintes. Retorne apenas um JSON válido.`,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            name: {
                                type: Type.STRING,
                                description: 'O nome da promoção, curto e chamativo.'
                            },
                            details: {
                                type: Type.STRING,
                                description: 'A descrição detalhada de como a promoção funciona, o que o ouvinte precisa fazer e qual é o prêmio.'
                            },
                        },
                        required: ['name', 'details'],
                    }
                }
            });

            const jsonString = response.text.trim();
            const parsed = JSON.parse(jsonString);
            setGenerated(parsed);
        } catch (e) {
            console.error(e);
            setError('Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleApply = () => {
        if (generated) {
            onApply(generated.name, generated.details);
            handleClose();
        }
    };

    const handleClose = () => {
        setPrompt('');
        setGenerated(null);
        setError('');
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Gerar Promoção com IA" size="2xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Qual é o prêmio ou objetivo da promoção?
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Sortear um violão autografado pelo artista."
                        className={formFieldClass}
                        rows={3}
                    />
                     <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        O artista ({context.artistName || 'Nenhum'}) e a música ({context.songTitle || 'Nenhuma'}) serão usados como contexto.
                    </p>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                >
                    {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                    {isLoading ? 'Gerando...' : 'Gerar Ideia de Promoção'}
                </button>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                
                {generated && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Resultado Gerado:</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Promoção</label>
                            <input
                                value={generated.name}
                                onChange={(e) => setGenerated(g => g ? { ...g, name: e.target.value } : null)}
                                className={formFieldClass}
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                             <textarea
                                value={generated.details}
                                onChange={(e) => setGenerated(g => g ? { ...g, details: e.target.value } : null)}
                                className={formFieldClass}
                                rows={6}
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">
                    Cancelar
                </button>
                <button type="button" onClick={handleApply} disabled={!generated} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600">
                    Aplicar
                </button>
            </div>
        </Modal>
    );
};

export default GeminiPromotionModal;
