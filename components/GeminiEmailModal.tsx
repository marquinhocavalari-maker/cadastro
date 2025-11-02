import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

import Modal from './Modal';
import { SparklesIcon, ArrowPathIcon } from './Icons';

interface GeminiEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (subject: string, body: string) => void;
    initialPromptData: {
        artistName: string;
        songTitle: string;
    };
}

const GeminiEmailModal = ({ isOpen, onClose, onApply, initialPromptData }: GeminiEmailModalProps) => {
    const [prompt, setPrompt] = useState('');
    const [generated, setGenerated] = useState<{ subject: string; body: string } | null>(null);
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
                Considerando as seguintes informações:
                - Artista: ${initialPromptData.artistName || 'Não especificado'}
                - Música: ${initialPromptData.songTitle || 'Não especificada'}
                - Objetivo do e-mail: ${prompt}

                Gere um assunto (subject) e corpo (body) para um e-mail de marketing.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    systemInstruction: `Você é um especialista em marketing para a indústria musical brasileira. Sua tarefa é criar textos de e-mail (assunto e corpo) para divulgar músicas e artistas para estações de rádio. O tom deve ser profissional, direto e convidativo. Retorne apenas um JSON válido.`,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            subject: {
                                type: Type.STRING,
                                description: 'O assunto do e-mail, conciso e chamativo.'
                            },
                            body: {
                                type: Type.STRING,
                                description: 'O corpo do e-mail, com uma saudação, apresentação da música/artista, um call-to-action (ex: pedir para incluir na programação) e uma despedida cordial.'
                            },
                        },
                        required: ['subject', 'body'],
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
            onApply(generated.subject, generated.body);
            handleClose();
        }
    };

    const handleClose = () => {
        // Reset state on close
        setPrompt('');
        setGenerated(null);
        setError('');
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Gerar E-mail com IA" size="2xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Descreva o objetivo do e-mail
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Anunciar o lançamento do novo single e pedir para adicioná-lo à programação."
                        className={formFieldClass}
                        rows={3}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Informações da música selecionada ({initialPromptData.artistName || 'Nenhum'} - {initialPromptData.songTitle || 'Nenhuma'}) serão enviadas como contexto para a IA.
                    </p>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                >
                    {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                    {isLoading ? 'Gerando...' : 'Gerar Texto'}
                </button>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                
                {generated && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Resultado Gerado:</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Assunto</label>
                            <input
                                value={generated.subject}
                                onChange={(e) => setGenerated(g => g ? { ...g, subject: e.target.value } : null)}
                                className={formFieldClass}
                            />
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Corpo do E-mail</label>
                             <textarea
                                value={generated.body}
                                onChange={(e) => setGenerated(g => g ? { ...g, body: e.target.value } : null)}
                                className={formFieldClass}
                                rows={8}
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
                    Aplicar Texto
                </button>
            </div>
        </Modal>
    );
};

export default GeminiEmailModal;