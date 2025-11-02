import React, { useState, useMemo, useEffect } from 'react';
import { Promotion, Artist, RadioStation, PromotionType, Business, Music } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, MegaphoneIcon, MusicalNoteIcon, DocumentDuplicateIcon, XMarkIcon } from './Icons';
import { PROMOTION_TYPES } from '../constants';
import { normalizeString, formatCurrency } from '../utils';

const calculateDaysLeft = (endDateString: string) => {
    // FIX: Using Date constructor with a full ISO-like string ensures it's parsed in the local timezone,
    // preventing off-by-one errors that can occur when `new Date('YYYY-MM-DD')` is parsed as UTC.
    const end = new Date(endDateString + 'T23:59:59.999'); // Consider the very end of the target day in local time.
    const now = new Date(); // Current local time.

    // If the promotion has already ended, show "Encerrada".
    if (end < now) {
        return { text: "Encerrada", className: "text-gray-500 dark:text-gray-400 font-medium" };
    }

    // To accurately count "days left", we compare the start of today with the start of the end day.
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfEndDay = new Date(endDateString + 'T00:00:00');

    const diffTime = startOfEndDay.getTime() - startOfToday.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Encerrada", className: "text-gray-500 dark:text-gray-400 font-medium" };
    }

    let text;
    if (diffDays === 0) {
        text = "Termina hoje";
    } else if (diffDays === 1) {
        text = "Termina amanhã";
    } else {
        text = `Faltam ${diffDays} dias`;
    }

    if (diffDays <= 1) {
        return { text, className: "text-red-600 dark:text-red-400 font-bold" };
    }
    if (diffDays <= 30) {
        return { text, className: "text-red-600 dark:text-red-400 font-semibold" };
    }
    if (diffDays <= 60) {
        return { text, className: "text-yellow-600 dark:text-yellow-400 font-semibold" };
    }
    return { text, className: "text-green-600 dark:text-green-400 font-semibold" };
};

interface PromotionFormProps {
    onSave: (promotion: any) => void;
    onClose: () => void;
    mode: 'add' | 'edit' | 'clone';
    initialData?: Promotion | null;
    artists: Artist[];
    radioStations: RadioStation[];
    music: Music[];
}

const PromotionForm = ({ onSave, onClose, mode, initialData, artists, radioStations, music }: PromotionFormProps) => {
    
    const [selectedRadioIds, setSelectedRadioIds] = useState<string[]>([]);
    const [radioSearch, setRadioSearch] = useState('');
    const [isRadioDropdownOpen, setIsRadioDropdownOpen] = useState(false);

    const [promotion, setPromotion] = useState(() => {
        if (initialData) {
            const { id, value, radioStationId, ...rest } = initialData;
            setSelectedRadioIds(mode === 'clone' ? [] : [radioStationId]);
            return {
                ...rest,
                value: value?.toString().replace('.', ',') || '',
            };
        }

        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 90);

        return {
            name: '',
            artistId: artists[0]?.id || '',
            musicId: '',
            type: PromotionType.VERBA,
            details: '',
            startDate: today.toISOString().split('T')[0],
            endDate: futureDate.toISOString().split('T')[0],
            value: '',
        };
    });
    
    const artistSongs = useMemo(() => {
        if (!promotion.artistId) return [];
        return music.filter(m => m.artistId === promotion.artistId);
    }, [promotion.artistId, music]);
    
    const radioStationMap = useMemo(() => new Map(radioStations.map(r => [r.id, r])), [radioStations]);

    const filteredRadios = useMemo(() => {
        if (!isRadioDropdownOpen) return [];
        const normalizedSearch = normalizeString(radioSearch);
        return radioStations.filter(r => 
            !selectedRadioIds.includes(r.id) &&
            (normalizeString(r.name).includes(normalizedSearch) || normalizeString(r.city).includes(normalizedSearch))
        );
    }, [radioSearch, radioStations, selectedRadioIds, isRadioDropdownOpen]);
    
    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'type' && value !== PromotionType.VERBA) {
             setPromotion(prev => ({ ...prev, type: value as PromotionType, value: '' }));
        } else if (name === 'artistId') {
            setPromotion(prev => ({ ...prev, artistId: value, musicId: '' }));
        } else {
             setPromotion(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleAddRadio = (radioId: string) => {
        if (mode === 'edit') {
            setSelectedRadioIds([radioId]);
        } else {
            setSelectedRadioIds(prev => [...prev, radioId]);
        }
        setRadioSearch('');
        setIsRadioDropdownOpen(false);
    };

    const handleRemoveRadio = (radioId: string) => {
        setSelectedRadioIds(prev => prev.filter(id => id !== radioId));
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/[^\d]/g, '');
        if (!rawValue) {
            setPromotion(prev => ({...prev, value: ''}));
            return;
        }
        const numberValue = parseInt(rawValue, 10) / 100;
        const formattedValue = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(numberValue);
        setPromotion(prev => ({ ...prev, value: formattedValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedRadioIds.length === 0) {
            alert('Por favor, selecione pelo menos uma rádio.');
            return;
        }
        const submissionData = {
            ...promotion,
            radioStationIds: selectedRadioIds,
            id: mode === 'edit' ? initialData?.id : undefined,
        };
        onSave(submissionData);
        onClose();
    };

    const isMultiRadio = mode === 'add' || mode === 'clone';

    const artistName = artists.find(a => a.id === promotion.artistId)?.name || '';
    const musicTitle = music.find(m => m.id === promotion.musicId)?.title || '';

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <fieldset className="space-y-4">
                <legend className="text-lg font-medium text-slate-900 dark:text-white">Detalhes da Promoção</legend>
                <input name="name" value={promotion.name} onChange={handleChange} placeholder="Nome da Promoção" className={formFieldClass} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select name="artistId" value={promotion.artistId} onChange={handleChange} className={formFieldClass} required>
                        <option value="" disabled>Selecione um artista</option>
                        {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <select name="musicId" value={promotion.musicId} onChange={handleChange} className={formFieldClass} disabled={artistSongs.length === 0}>
                        <option value="">{artistSongs.length > 0 ? 'Selecione uma música (opcional)' : 'Artista sem músicas'}</option>
                        {artistSongs.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                </div>
                <textarea name="details" value={promotion.details} onChange={handleChange} rows={3} placeholder="Descreva a promoção..." className={formFieldClass}></textarea>
            </fieldset>

            <fieldset className="space-y-4">
                 <legend className="text-lg font-medium text-slate-900 dark:text-white">Rádios Participantes</legend>
                { !isMultiRadio && <p className="text-xs text-slate-500 dark:text-slate-400">Modo de edição: apenas uma rádio por vez.</p>}
                <div className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                     {selectedRadioIds.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                           {selectedRadioIds.map(id => {
                               const radio = radioStationMap.get(id);
                               return (
                                <span key={id} className="flex items-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-sm font-medium px-2.5 py-1 rounded-full">
                                    {radio?.name || 'Rádio não encontrada'}
                                    <button type="button" onClick={() => handleRemoveRadio(id)} className="ml-1.5 -mr-1 p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-700">
                                        <XMarkIcon className="w-3 h-3" />
                                    </button>
                                </span>
                               );
                           })}
                        </div>
                     )}
                     <div className="relative">
                        <input type="text" value={radioSearch} onChange={e => setRadioSearch(e.target.value)} onFocus={() => setIsRadioDropdownOpen(true)} onBlur={() => setTimeout(() => setIsRadioDropdownOpen(false), 200)} placeholder="Pesquisar rádio para adicionar..." className={formFieldClass} autoComplete="off" />
                        {isRadioDropdownOpen && (
                            <ul className="absolute z-10 w-full bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                                {filteredRadios.length > 0 ? filteredRadios.slice(0, 100).map(radio => (
                                    <li key={radio.id} onMouseDown={() => handleAddRadio(radio.id)} className="px-3 py-2 text-sm text-slate-800 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-900 cursor-pointer">
                                        {radio.name} <span className="text-xs text-slate-500 dark:text-slate-400">({radio.city})</span>
                                    </li>
                                )) : <li className="px-3 py-2 text-sm text-slate-500">Nenhuma rádio encontrada</li>}
                            </ul>
                        )}
                    </div>
                </div>
            </fieldset>

            <fieldset className="space-y-4">
                <legend className="text-lg font-medium text-slate-900 dark:text-white">Valores e Prazos</legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select name="type" value={promotion.type} onChange={handleChange} className={formFieldClass}>
                        {PROMOTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {promotion.type === PromotionType.VERBA && (
                        <input name="value" value={promotion.value as string} onChange={handleValueChange} placeholder="Valor R$" className={formFieldClass} />
                    )}
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Data de Início</label>
                        <input type="date" name="startDate" value={promotion.startDate} onChange={handleChange} className={formFieldClass} required />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Data de Fim</label>
                        <input type="date" name="endDate" value={promotion.endDate} onChange={handleChange} className={formFieldClass} required />
                    </div>
                </div>
            </fieldset>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Salvar</button>
            </div>
        </form>
    );
};

interface PromotionSectionProps {
    promotions: Promotion[];
    artists: Artist[];
    radioStations: RadioStation[];
    businesses: Business[];
    music: Music[];
    onSave: (promotion: any) => void;
    onArchive: (id: string, type: string, name: string) => void;
    crowleyMarkets: string[];
}

const PromotionSection = ({ promotions, artists, radioStations, businesses, music, onSave, onArchive, crowleyMarkets }: PromotionSectionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'clone'>('add');
    const [currentPromotion, setCurrentPromotion] = useState<Promotion | null>(null);
    
    const initialFilters = { artist: '', state: '', crowleyMarket: '', type: '', city: '' };
    const [filters, setFilters] = useState(initialFilters);

    const artistMap = useMemo(() => new Map(artists.map(a => [a.id, a])), [artists]);
    const radioStationMap = useMemo(() => new Map(radioStations.map(r => [r.id, r])), [radioStations]);
    const musicMap = useMemo(() => new Map(music.map(m => [m.id, m.title])), [music]);

    const filterOptions = useMemo(() => {
        const radioIdsInPromos = new Set(promotions.map(p => p.radioStationId));
        const radiosInUse = radioStations.filter(r => radioIdsInPromos.has(r.id));
        const states = [...new Set(radiosInUse.map(r => r.state))].sort();
        const cities = [...new Set(radiosInUse.map(r => r.city))].sort();
        const types = [...new Set(promotions.map(p => p.type))].sort();
        const markets = [...new Set(radiosInUse.flatMap(r => r.crowleyMarkets || []))].sort();
        return { states, cities, types, markets };
    }, [promotions, radioStations]);

    const sortedAndFilteredPromotions = useMemo(() => {
        const normalizedCityFilter = normalizeString(filters.city);
        return promotions
            .filter(promo => {
                const radio = radioStationMap.get(promo.radioStationId);
                if (!radio) return false;

                if (filters.artist && promo.artistId !== filters.artist) return false;
                if (filters.type && promo.type !== filters.type) return false;
                if (filters.state && radio.state !== filters.state) return false;
                if (filters.crowleyMarket && !(radio.crowleyMarkets || []).includes(filters.crowleyMarket)) return false;
                if (normalizedCityFilter && !normalizeString(radio.city).includes(normalizedCityFilter)) return false;
                
                return true;
            })
            .sort((a, b) => {
                if (a.type === PromotionType.VERBA && b.type !== PromotionType.VERBA) return -1;
                if (a.type !== PromotionType.VERBA && b.type === PromotionType.VERBA) return 1;
                return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
            });
    }, [promotions, filters, radioStationMap]);
    
    const totalVerba = useMemo(() => {
        return sortedAndFilteredPromotions
            .filter(p => p.type === PromotionType.VERBA && typeof p.value === 'number')
            .reduce((sum, p) => sum + (p.value || 0), 0);
    }, [sortedAndFilteredPromotions]);

    const handleOpenModal = (mode: 'add' | 'edit' | 'clone', promo?: Promotion) => {
        setModalMode(mode);
        setCurrentPromotion(promo || null);
        setIsModalOpen(true);
    };

    const getModalTitle = () => {
        if (modalMode === 'add') return 'Adicionar Nova Promoção';
        if (modalMode === 'edit') return 'Editar Promoção';
        if (modalMode === 'clone') return `Clonar Promoção: ${currentPromotion?.name}`;
        return '';
    };

    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500";

    const noResults = (
        <div className="text-center py-16 px-4">
            <MegaphoneIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Nenhuma promoção encontrada</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adicione uma nova promoção ou ajuste os filtros para começar.</p>
            <button onClick={() => handleOpenModal('add')} className="mt-6 flex mx-auto items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                <PlusIcon className="w-5 h-5"/>
                <span>Adicionar Promoção</span>
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Promoções ({promotions.length})</h1>
                     {totalVerba > 0 && (
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400 mt-1">
                            Total em Verbas (Filtro Atual): {formatCurrency(totalVerba)}
                        </p>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    <button onClick={() => handleOpenModal('add')} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Nova Promoção</span>
                    </button>
                </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <select value={filters.artist} onChange={e => setFilters(f => ({...f, artist: e.target.value}))} className={formFieldClass}><option value="">Todos Artistas</option>{artists.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select>
                    <select value={filters.state} onChange={e => setFilters(f => ({...f, state: e.target.value}))} className={formFieldClass}><option value="">Todos Estados</option>{filterOptions.states.map(s=><option key={s} value={s}>{s}</option>)}</select>
                    <select value={filters.crowleyMarket} onChange={e => setFilters(f => ({...f, crowleyMarket: e.target.value}))} className={formFieldClass}><option value="">Todas Praças</option>{filterOptions.markets.map(m=><option key={m} value={m}>{m}</option>)}</select>
                    <select value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))} className={formFieldClass}><option value="">Todos Tipos</option>{filterOptions.types.map(t=><option key={t} value={t}>{t}</option>)}</select>
                    <div className="lg:col-span-2 flex items-center gap-2">
                        <input type="text" value={filters.city} onChange={e => setFilters(f => ({...f, city: e.target.value}))} placeholder="Buscar por cidade..." className={formFieldClass} />
                        <button onClick={() => setFilters(initialFilters)} className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">Limpar</button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="overflow-x-auto">
                    {sortedAndFilteredPromotions.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-100 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Promoção</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Rádio / Artista</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Duração</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Tipo / Valor</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-slate-200 dark:divide-slate-800">
                                {sortedAndFilteredPromotions.map(promo => {
                                    const artist = artistMap.get(promo.artistId);
                                    const radio = radioStationMap.get(promo.radioStationId);
                                    const musicTitle = promo.musicId ? musicMap.get(promo.musicId) : null;
                                    const daysLeft = calculateDaysLeft(promo.endDate);
                                    return (
                                    <tr key={promo.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{promo.name}</p>
                                            {musicTitle && <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1"><MusicalNoteIcon className="w-3 h-3"/> {musicTitle}</p>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-slate-800 dark:text-slate-300">{radio ? `${radio.name} (${radio.city})` : 'Rádio desconhecida'}</p>
                                            <p className="text-sm text-slate-800 dark:text-slate-300">{artist?.name || 'Artista desconhecido'}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-300">
                                            <div>{new Date(promo.startDate + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(promo.endDate + 'T00:00:00').toLocaleDateString('pt-BR')}</div>
                                            <div className={`text-xs mt-1 ${daysLeft.className}`}>{daysLeft.text}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${promo.type === PromotionType.VERBA ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'}`}>{promo.type}</span>
                                            {promo.type === PromotionType.VERBA && promo.value && <div className="text-sm mt-1 font-semibold text-green-700 dark:text-green-400">{formatCurrency(promo.value)}</div>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button onClick={() => handleOpenModal('clone', promo)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg" title="Clonar"><DocumentDuplicateIcon /></button>
                                                <button onClick={() => handleOpenModal('edit', promo)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg" title="Editar"><PencilIcon /></button>
                                                <button onClick={() => onArchive(promo.id, 'promotions', promo.name)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg" title="Arquivar"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    ) : (
                        noResults
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={getModalTitle()} size="3xl">
                <PromotionForm 
                    onSave={onSave} 
                    onClose={() => setIsModalOpen(false)} 
                    mode={modalMode}
                    initialData={currentPromotion}
                    artists={artists} 
                    radioStations={radioStations} 
                    music={music} />
            </Modal>
        </div>
    );
};

export default PromotionSection;