import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Modal from './Modal';
import { SparklesIcon, ArrowPathIcon } from './Icons';

interface GeminiBlitzModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (notes: string) => void;
    context: {
        artistName: string;
        songTitle: string;
        eventDate: string;
    };
}

const GeminiBlitzModal = ({ isOpen, onClose, onApply, context }: GeminiBlitzModalProps) => {
    const [prompt, setPrompt] = useState('Gerar uma nota de observação para esta ação de blitz.');
    const [generated, setGenerated] = useState<{ notes: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        setGenerated(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const blitzDate = context.eventDate ? new Date(context.eventDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'data a ser confirmada';

            const fullPrompt = `
                Sua tarefa é criar uma nota de observação para uma ação de "blitz musical".

                **Contexto da Blitz:**
                - Artista: ${context.artistName || 'Não especificado'}
                - Música: ${context.songTitle || 'Não especificada'}
                - Data: ${blitzDate}
                
                **Objetivo (definido pelo usuário):** 
                ${prompt}

                Gere um texto curto e informativo para o campo de observações (notes).
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    systemInstruction: `Você é um assistente de marketing musical. Crie notas concisas e informativas para agendamentos de blitz. Retorne apenas um JSON válido.`,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            notes: {
                                type: Type.STRING,
                                description: 'Um texto curto para o campo de observações da blitz.'
                            },
                        },
                        required: ['notes'],
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
            onApply(generated.notes);
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
        <Modal isOpen={isOpen} onClose={handleClose} title="Gerar Observações com IA" size="2xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Descreva o foco da blitz
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Focar em rádios do perfil sertanejo em Goiás."
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
                    {isLoading ? 'Gerando...' : 'Gerar Observação'}
                </button>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                
                {generated && (
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Resultado Gerado:</h3>
                        <div>
                             <textarea
                                value={generated.notes}
                                onChange={(e) => setGenerated(g => g ? { ...g, notes: e.target.value } : null)}
                                className={formFieldClass}
                                rows={4}
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

export default GeminiBlitzModal;
