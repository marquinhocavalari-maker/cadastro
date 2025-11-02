import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Modal from './Modal';
import { SparklesIcon, ArrowPathIcon } from './Icons';

interface GeminiEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (details: string) => void;
    context: {
        eventName: string;
        artists: string;
        venue: string;
        date: string;
    };
}

const GeminiEventModal = ({ isOpen, onClose, onApply, context }: GeminiEventModalProps) => {
    const [prompt, setPrompt] = useState('Criar um texto para divulgação nas redes sociais e rádios.');
    const [generated, setGenerated] = useState<{ details: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGenerated(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const eventDate = context.date ? new Date(context.date + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'data a ser confirmada';

            const fullPrompt = `
                Sua tarefa é criar um texto promocional para um evento.

                **Contexto do Evento:**
                - Nome do Evento: ${context.eventName || 'Não especificado'}
                - Artistas: ${context.artists || 'Atrações a confirmar'}
                - Local: ${context.venue || 'Local a ser confirmado'}
                - Data: ${eventDate}
                
                **Objetivo do Texto (definido pelo usuário):** 
                ${prompt}

                Gere uma descrição (details) para este evento. O texto deve ser empolgante, informativo e convidar o público a participar.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    systemInstruction: `Você é um redator publicitário especializado em eventos musicais no Brasil. Crie textos vibrantes e persuasivos. Retorne apenas um JSON válido.`,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            details: {
                                type: Type.STRING,
                                description: 'O texto promocional para o evento, contendo as informações principais de forma atrativa.'
                            },
                        },
                        required: ['details'],
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
            onApply(generated.details);
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
        <Modal isOpen={isOpen} onClose={handleClose} title="Gerar Descrição de Evento com IA" size="2xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Qual o tom ou objetivo da descrição?
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Um texto curto para post de Instagram."
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
                    {isLoading ? 'Gerando...' : 'Gerar Descrição'}
                </button>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                
                {generated && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Resultado Gerado:</h3>
                        <div>
                             <textarea
                                value={generated.details}
                                onChange={(e) => setGenerated(g => g ? { ...g, details: e.target.value } : null)}
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
                    Aplicar
                </button>
            </div>
        </Modal>
    );
};

export default GeminiEventModal;
