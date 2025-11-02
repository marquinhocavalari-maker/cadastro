

import React from 'react';
import { RadioSubmission } from '../types';
import { PencilIcon, TrashIcon, LinkIcon, ArrowPathIcon } from './Icons';

interface OnlineFormSectionProps {
    submissions: RadioSubmission[];
    onReview: (submission: RadioSubmission) => void;
    onDelete: (submissionId: string) => void;
}

const OnlineFormSection = ({ submissions, onReview, onDelete }: OnlineFormSectionProps) => {

    const noResults = (
        <div className="text-center py-16 px-4">
            <LinkIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">Nenhuma submissão pendente</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Novas submissões do formulário aparecerão aqui automaticamente.</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Submissões do Formulário Web</h1>
            <p className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
                <ArrowPathIcon className="w-4 h-4 animate-[spin_3s_linear_infinite]" />
                <span>Sincronização automática com Google Sheets ativada. A lista é atualizada a cada minuto.</span>
            </p>
            
            <div className="bg-white/30 dark:bg-slate-800/40 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border border-white/20 dark:border-slate-700/50">
                 {/* Mobile Card View */}
                <div className="md:hidden">
                    {submissions.length > 0 ? (
                        <ul className="divide-y divide-slate-300/50 dark:divide-slate-700/50">
                            {submissions.map(sub => (
                                <li key={sub.submissionId} className="p-4 flex justify-between items-center">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{sub.name}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{sub.city}, {sub.state}</p>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                        <button onClick={() => onReview(sub)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-md" title="Revisar"><PencilIcon /></button>
                                        <button onClick={() => onDelete(sub.submissionId)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md" title="Excluir"><TrashIcon /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : noResults}
                </div>
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block">
                    {submissions.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-300/50 dark:divide-slate-700/50">
                            <thead className="bg-black/5 dark:bg-white/5">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nome da Rádio</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Localização</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-slate-300/50 dark:divide-slate-700/50">
                                {submissions.map(sub => (
                                    <tr key={sub.submissionId} className="hover:bg-black/5 dark:hover:bg-white/5">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{sub.name}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{sub.frequency}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-300">
                                            {sub.city}, {sub.state}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => onReview(sub)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-green-500" title="Revisar e Importar">
                                                    <PencilIcon />
                                                </button>
                                                <button onClick={() => onDelete(sub.submissionId)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-md" title="Excluir"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : noResults}
                </div>
            </div>
        </div>
    );
};

export default OnlineFormSection;