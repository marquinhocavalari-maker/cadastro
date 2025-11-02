import React, { useState, useMemo } from 'react';
import { AppEvent, Artist, Business } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, CalendarDaysIcon, UserIcon, BriefcaseIcon, XMarkIcon, EyeIcon } from './Icons';
import { BRAZILIAN_STATES } from '../constants';
import { normalizeString } from '../utils';

// Helper component for selecting multiple entities
const SearchableSelector = ({
    label,
    items,
    selectedIds,
    onAdd,
    onRemove,
    placeholder
}: {
    label: string;
    items: { id: string; name: string }[];
    selectedIds: string[];
    onAdd: (id: string) => void;
    onRemove: (id: string) => void;
    placeholder: string;
}) => {
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const selectedItems = useMemo(() => items.filter(i => selectedIds.includes(i.id)), [items, selectedIds]);
    const availableItems = useMemo(() => {
        const normalizedSearch = normalizeString(search);
        return items.filter(i => !selectedIds.includes(i.id) && (normalizedSearch === '' || normalizeString(i.name).includes(normalizedSearch)));
    }, [items, selectedIds, search]);

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                {selectedItems.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedItems.map(item => (
                            <span key={item.id} className="flex items-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-sm font-medium px-2.5 py-1 rounded-full">
                                {item.name}
                                <button type="button" onClick={() => onRemove(item.id)} className="ml-1.5 -mr-1 p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-700">
                                    <XMarkIcon className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                <div className="relative">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                        placeholder={placeholder}
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm"
                    />
                    {isOpen && (
                        <ul className="absolute z-10 w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg mt-1 max-h-40 overflow-y-auto shadow-lg">
                            {availableItems.length > 0 ? (
                                availableItems.slice(0, 50).map(item => (
                                    <li key={item.id} onMouseDown={() => { onAdd(item.id); setSearch(''); }} className="px-3 py-2 text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer">
                                        {item.name}
                                    </li>
                                ))
                            ) : (
                                <li className="px-3 py-2 text-sm text-slate-500">Nenhum item encontrado</li>
                            )}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};


const EventForm = ({
    onSave,
    onClose,
    initialData,
    artists,
    businesses
}: {
    onSave: (event: Omit<AppEvent, 'id'> | AppEvent) => void;
    onClose: () => void;
    initialData?: AppEvent | null;
    artists: Artist[];
    businesses: Business[];
}) => {
    const [event, setEvent] = useState(initialData || { name: '', date: '', city: '', state: '', venue: '', details: '', linkedArtistIds: [], linkedBusinessIds: [] });
    
    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setEvent(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(event);
        onClose();
    };

    const linkedArtistNames = (event.linkedArtistIds || []).map(id => artists.find(a => a.id === id)?.name).filter(Boolean).join(', ');

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Evento</label>
                    <input name="name" value={event.name} onChange={handleChange} className={formFieldClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data</label>
                    <input name="date" type="date" value={event.date} onChange={handleChange} className={formFieldClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Local (Venue)</label>
                    <input name="venue" value={event.venue} onChange={handleChange} placeholder="Ex: Estádio Morumbi" className={formFieldClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                    <input name="city" value={event.city} onChange={handleChange} className={formFieldClass} required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                    <select name="state" value={event.state} onChange={handleChange} className={formFieldClass} required>
                        <option value="">Selecione...</option>
                        {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                     <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detalhes Adicionais</label>
                    <textarea name="details" value={event.details || ''} onChange={handleChange} rows={3} className={formFieldClass}></textarea>
                </div>
            </div>
            <div className="space-y-4">
                <SearchableSelector
                    label="Artistas Vinculados"
                    items={artists}
                    selectedIds={event.linkedArtistIds || []}
                    onAdd={id => setEvent(p => ({...p, linkedArtistIds: [...(p.linkedArtistIds || []), id]}))}
                    onRemove={id => setEvent(p => ({...p, linkedArtistIds: (p.linkedArtistIds || []).filter(artistId => artistId !== id)}))}
                    placeholder="Buscar artista para adicionar..."
                />
                 <SearchableSelector
                    label="Empresários/Produtores Vinculados"
                    items={businesses}
                    selectedIds={event.linkedBusinessIds || []}
                    onAdd={id => setEvent(p => ({...p, linkedBusinessIds: [...(p.linkedBusinessIds || []), id]}))}
                    onRemove={id => setEvent(p => ({...p, linkedBusinessIds: (p.linkedBusinessIds || []).filter(businessId => businessId !== id)}))}
                    placeholder="Buscar empresário para adicionar..."
                />
            </div>
             <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Salvar Evento</button>
            </div>
        </form>
    );
};

interface EventSectionProps {
    events: AppEvent[];
    artists: Artist[];
    businesses: Business[];
    onSave: (event: Omit<AppEvent, 'id'> | AppEvent) => void;
    onArchive: (id: string, type: string, name: string) => void;
}

const EventSection = ({ events, artists, businesses, onSave, onArchive }: EventSectionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const artistMap = useMemo(() => new Map(artists.map(a => [a.id, a.name])), [artists]);
    const businessMap = useMemo(() => new Map(businesses.map(b => [b.id, b.name])), [businesses]);

    const handleEdit = (event: AppEvent) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingEvent(null);
        setIsModalOpen(true);
    };

    const filteredEvents = useMemo(() => {
        const normalizedSearch = normalizeString(searchTerm);
        if (!normalizedSearch) return events;
        return events.filter(event => 
            normalizeString(event.name).includes(normalizedSearch) ||
            normalizeString(event.venue).includes(normalizedSearch) ||
            normalizeString(event.city).includes(normalizedSearch) ||
            (event.linkedArtistIds || []).some(id => normalizeString(artistMap.get(id)).includes(normalizedSearch))
        );
    }, [events, searchTerm, artistMap]);

    const noResults = (
        <div className="text-center py-16 px-4">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Nenhum evento encontrado</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adicione um novo evento para começar.</p>
            <button onClick={openAddModal} className="mt-6 flex mx-auto items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                <PlusIcon className="w-5 h-5"/>
                <span>Adicionar Evento</span>
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Eventos ({events.length})</h1>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                     <input
                        type="text"
                        placeholder="Buscar por nome, artista, cidade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full sm:w-64 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <button onClick={openAddModal} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Novo Evento</span>
                    </button>
                </div>
            </div>

            {filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredEvents.map(event => {
                        const linkedArtists = (event.linkedArtistIds || []).map(id => artistMap.get(id)).filter(Boolean);
                        const linkedBusinesses = (event.linkedBusinessIds || []).map(id => businessMap.get(id)).filter(Boolean);
                        const eventDate = new Date(`${event.date}T00:00:00`);

                        return (
                        <div key={event.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col transition-all shadow-xl rounded-2xl hover:shadow-2xl hover:scale-[1.02]">
                            <div className="p-5 flex-grow">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white pr-2">{event.name}</h3>
                                    <div className="text-right flex-shrink-0">
                                        <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{eventDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{eventDate.toLocaleDateString('pt-BR', { weekday: 'long' })}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{event.venue}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{event.city}, {event.state}</p>

                                {(linkedArtists.length > 0 || linkedBusinesses.length > 0) && (
                                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                        {linkedArtists.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                {linkedArtists.map(name => <span key={name} className="bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200 text-xs font-medium px-2 py-0.5 rounded-full">{name}</span>)}
                                            </div>
                                        )}
                                         {linkedBusinesses.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                <BriefcaseIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                                                {linkedBusinesses.map(name => <span key={name} className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 text-xs font-medium px-2 py-0.5 rounded-full">{name}</span>)}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="p-3 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end items-center gap-2 rounded-b-2xl">
                                <button onClick={() => handleEdit(event)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg" title="Editar"><PencilIcon /></button>
                                <button onClick={() => onArchive(event.id, 'events', event.name)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg" title="Arquivar"><TrashIcon /></button>
                            </div>
                        </div>
                    )})}
                </div>
            ) : (
                noResults
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingEvent ? 'Editar Evento' : 'Adicionar Novo Evento'} size="3xl">
                <EventForm 
                    onSave={onSave} 
                    onClose={() => setIsModalOpen(false)} 
                    initialData={editingEvent} 
                    artists={artists}
                    businesses={businesses}
                />
            </Modal>
        </div>
    );
};

export default EventSection;
