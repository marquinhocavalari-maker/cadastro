import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Modal from './Modal';
import { SparklesIcon, ArrowPathIcon } from './Icons';
import { MusicGenre } from '../types';

interface GeminiBioModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (bio: string) => void;
    context: {
        artistName: string;
        genre: MusicGenre;
    };
}

const GeminiBioModal = ({ isOpen, onClose, onApply, context }: GeminiBioModalProps) => {
    const [prompt, setPrompt] = useState('Criar uma biografia curta e impactante para divulgação, destacando os principais pontos da carreira.');
    const [generated, setGenerated] = useState<{ bio: string } | null>(null);
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
                Sua tarefa é criar uma biografia artística.

                **Contexto:**
                - Nome do Artista: ${context.artistName || 'Não especificado'}
                - Gênero Musical: ${context.genre || 'Não especificado'}
                
                **Instruções (definidas pelo usuário):** 
                ${prompt}

                Gere uma biografia (bio) para este artista. O texto deve ser bem escrito, envolvente e adequado para materiais de imprensa e redes sociais.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    systemInstruction: `Você é um assessor de imprensa especializado em música brasileira. Crie biografias de artistas que sejam profissionais, cativantes e informativas. Retorne apenas um JSON válido.`,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            bio: {
                                type: Type.STRING,
                                description: 'A biografia do artista, com 2 a 4 parágrafos.'
                            },
                        },
                        required: ['bio'],
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
            onApply(generated.bio);
            handleClose();
        }
    };

    const handleClose = () => {
        setGenerated(null);
        setError('');
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Gerar Biografia com IA" size="2xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Descreva o que a biografia deve destacar
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Focar no início da carreira, mencionar o último sucesso, usar um tom mais jovem..."
                        className={formFieldClass}
                        rows={3}
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                >
                    {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                    {isLoading ? 'Gerando...' : 'Gerar Biografia'}
                </button>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                
                {generated && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Resultado Gerado:</h3>
                        <div>
                             <textarea
                                value={generated.bio}
                                onChange={(e) => setGenerated(g => g ? { ...g, bio: e.target.value } : null)}
                                className={formFieldClass}
                                rows={10}
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

export default GeminiBioModal;