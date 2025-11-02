import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import Modal from './Modal';
import { SparklesIcon, ArrowPathIcon, PlusIcon } from './Icons';
import { MusicGenre } from '../types';

interface SongIdea {
    title: string;
    composers: string;
}

interface GeminiArtistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSong: (song: { title: string, composers: string }) => void;
    context: {
        artistName: string;
        genre: MusicGenre;
    };
}

const GeminiArtistModal = ({ isOpen, onClose, onAddSong, context }: GeminiArtistModalProps) => {
    const [prompt, setPrompt] = useState('');
    const [generated, setGenerated] = useState<SongIdea[] | null>(null);
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
                Para o artista "${context.artistName}", que é do gênero musical "${context.genre}", gere 5 ideias de títulos de músicas com nomes de compositores fictícios. 
                O tema para as músicas é: "${prompt}".
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    systemInstruction: `Você é um assistente criativo para compositores e artistas da indústria musical brasileira. Sua tarefa é gerar ideias para novas músicas. Retorne apenas um JSON válido contendo um array de objetos.`,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: {
                                    type: Type.STRING,
                                    description: 'Um título de música criativo e apropriado para o gênero.'
                                },
                                composers: {
                                    type: Type.STRING,
                                    description: 'Nomes de compositores fictícios (ex: "J. Silva / M. Andrade").'
                                },
                            },
                            required: ['title', 'composers'],
                        },
                    }
                }
            });

            const jsonString = response.text.trim();
            const parsed = JSON.parse(jsonString);
            setGenerated(parsed);
        } catch (e) {
            console.error(e);
            setError('Ocorreu um erro ao gerar as ideias. Por favor, tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAdd = (song: SongIdea) => {
        onAddSong(song);
        // Remove the added song from the list to give user feedback
        setGenerated(prev => prev ? prev.filter(s => s.title !== song.title) : null);
    };

    const handleClose = () => {
        setPrompt('');
        setGenerated(null);
        setError('');
        setIsLoading(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Gerar Ideias de Músicas com IA" size="2xl">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Qual é o tema para as novas músicas?
                    </label>
                    <input
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ex: Superação, amor de verão, a vida na estrada..."
                        className={formFieldClass}
                    />
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600"
                >
                    {isLoading ? <ArrowPathIcon className="w-5 h-5 animate-spin"/> : <SparklesIcon className="w-5 h-5"/>}
                    {isLoading ? 'Gerando...' : 'Gerar Ideias'}
                </button>

                {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
                
                {generated && generated.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                        <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200">Ideias Geradas:</h3>
                        <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                           {generated.map((song, index) => (
                               <li key={index} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800/50 rounded-lg">
                                   <div>
                                       <p className="font-medium text-slate-900 dark:text-white">{song.title}</p>
                                       <p className="text-xs text-slate-500 dark:text-slate-400">Compositores: {song.composers}</p>
                                   </div>
                                   <button 
                                        onClick={() => handleAdd(song)}
                                        className="flex-shrink-0 flex items-center gap-1.5 ml-2 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full hover:bg-indigo-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                                    >
                                       <PlusIcon className="w-3 h-3" />
                                       Adicionar
                                   </button>
                               </li>
                           ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
                <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">
                    Fechar
                </button>
            </div>
        </Modal>
    );
};

export default GeminiArtistModal;
