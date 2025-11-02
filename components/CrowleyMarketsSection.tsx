import React, { useState, useMemo } from 'react';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, ChartPieIcon } from './Icons';
import { normalizeString } from '../utils';

const MarketForm = ({
    onSave,
    onClose,
    initialData,
}: {
    onSave: (marketName: string) => void;
    onClose: () => void;
    initialData?: string | null;
}) => {
    const [name, setName] = useState(initialData || '');
    const formFieldClass = "block w-full px-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-300/50 dark:border-slate-700/50 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name);
        onClose();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome da Praça</label>
                <input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Centro Paulista" className={formFieldClass} required autoFocus/>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-300/50 dark:border-slate-700/50 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Salvar Praça</button>
            </div>
        </form>
    );
};

interface CrowleyMarketsSectionProps {
    markets: string[];
    onAdd: (market: string) => void;
    onEdit: (oldMarket: string, newMarket: string) => void;
    onDelete: (market: string) => void;
}

const CrowleyMarketsSection = ({ markets, onAdd, onEdit, onDelete }: CrowleyMarketsSectionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMarket, setEditingMarket] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const handleEdit = (market: string) => {
        setEditingMarket(market);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingMarket(null);
        setIsModalOpen(true);
    };
    
    const handleSave = (marketName: string) => {
        if (editingMarket) {
            onEdit(editingMarket, marketName);
        } else {
            onAdd(marketName);
        }
    };

    const filteredMarkets = useMemo(() => {
        const normalizedSearch = normalizeString(searchTerm);
        if (!normalizedSearch) return markets;
        return markets.filter(market => normalizeString(market).includes(normalizedSearch));
    }, [markets, searchTerm]);

    const noResults = (
        <div className="text-center py-16 px-4">
            <ChartPieIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Nenhuma praça encontrada</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adicione uma nova praça para começar a gerenciar.</p>
            <button onClick={openAddModal} className="mt-6 flex mx-auto items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                <PlusIcon className="w-5 h-5"/>
                <span>Adicionar Praça</span>
            </button>
        </div>
    );
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Praças Crowley ({markets.length})</h1>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full sm:w-64 px-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-300/50 dark:border-slate-700/50 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <button onClick={openAddModal} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Nova Praça</span>
                    </button>
                </div>
            </div>

            <div className="bg-white/30 dark:bg-slate-800/40 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border border-white/20 dark:border-slate-700/50">
                <div className="overflow-x-auto">
                    {filteredMarkets.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-300/50 dark:divide-slate-700/50">
                            <thead className="bg-black/5 dark:bg-white/5">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Nome da Praça</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-slate-300/50 dark:divide-slate-700/50">
                                {filteredMarkets.map(market => (
                                    <tr key={market} className="hover:bg-black/5 dark:hover:bg-white/5">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{market}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleEdit(market)} title="Editar" className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"><PencilIcon /></button>
                                                <button onClick={() => onDelete(market)} title="Excluir" className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        noResults
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMarket ? 'Editar Praça' : 'Adicionar Nova Praça'} size="lg">
                <MarketForm onSave={handleSave} onClose={() => setIsModalOpen(false)} initialData={editingMarket} />
            </Modal>
        </div>
    );
};

export default CrowleyMarketsSection;