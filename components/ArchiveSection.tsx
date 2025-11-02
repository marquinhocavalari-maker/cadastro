import React, { useState, useMemo } from 'react';
import { RadioStation, CityHall, Business, Artist, Promotion, EmailCampaign, Music, AppEvent as Event, MusicalBlitz } from '../types';
import { ArchiveBoxIcon, ArrowUturnLeftIcon, TrashIcon } from './Icons';

type Archiveable = RadioStation | CityHall | Business | Artist | Promotion | EmailCampaign | Music | Event | MusicalBlitz;

interface ArchiveSectionProps {
    radios: RadioStation[];
    onRestoreRadio: (id: string) => void;
    onDeleteRadio: (id: string, type: string, name: string) => void;

    cityHalls: CityHall[];
    onRestoreCityHall: (id: string) => void;
    onDeleteCityHall: (id: string, type: string, name: string) => void;

    businesses: Business[];
    onRestoreBusiness: (id: string) => void;
    onDeleteBusiness: (id: string, type: string, name: string) => void;

    artists: Artist[];
    onRestoreArtist: (id: string) => void;
    onDeleteArtist: (id: string, type: string, name: string) => void;
    
    promotions: Promotion[];
    onRestorePromotion: (id: string) => void;
    onDeletePromotion: (id: string, type: string, name: string) => void;

    campaigns: EmailCampaign[];
    onRestoreCampaign: (id: string) => void;
    onDeleteCampaign: (id: string, type: string, name: string) => void;

    music: Music[];
    onRestoreMusic: (id: string) => void;
    onDeleteMusic: (id: string, type: string, name: string) => void;

    events: Event[];
    onRestoreEvent: (id: string) => void;
    onDeleteEvent: (id: string, type: string, name: string) => void;

    blitzes: MusicalBlitz[];
    onRestoreBlitz: (id: string) => void;
    onDeleteBlitz: (id: string, type: string, name: string) => void;

    allArtists: Artist[];
    allMusic: Music[];
    onDeleteAll: (info: { category: string, label: string, itemsCount: number }) => void;
}

const ArchiveSection = (props: ArchiveSectionProps) => {
    const [activeTab, setActiveTab] = useState('radios');
    const { allArtists, allMusic, onDeleteAll } = props;

    const artistMap = useMemo(() => new Map(allArtists.map(a => [a.id, a.name])), [allArtists]);
    const musicMap = useMemo(() => new Map(allMusic.map(m => [m.id, { title: m.title, artistId: m.artistId }])), [allMusic]);
    
    const getDisplayName = (item: Archiveable, itemType: string): string => {
        switch (itemType) {
            case 'radios': return (item as RadioStation).name;
            case 'cityHalls': return `Prefeitura de ${(item as CityHall).cityName}`;
            case 'businesses': return (item as Business).name;
            case 'artists': return (item as Artist).name;
            case 'promotions': return (item as Promotion).name;
            case 'campaigns': return (item as EmailCampaign).subject;
            case 'music': return (item as Music).title;
            case 'events': return (item as Event).name;
            case 'blitz': {
                const blitz = item as MusicalBlitz;
                const musicInfo = musicMap.get(blitz.musicId);
                const artistName = musicInfo ? artistMap.get(musicInfo.artistId) : 'Artista desconhecido';
                return `${artistName} - ${musicInfo?.title || 'Música desconhecida'}`;
            }
            default: return 'Item';
        }
    };

    const tabs = [
        { id: 'radios', label: 'Rádios', items: props.radios, onRestore: props.onRestoreRadio, onDelete: props.onDeleteRadio },
        { id: 'cityHalls', label: 'Prefeituras', items: props.cityHalls, onRestore: props.onRestoreCityHall, onDelete: props.onDeleteCityHall },
        { id: 'businesses', label: 'Empresários', items: props.businesses, onRestore: props.onRestoreBusiness, onDelete: props.onDeleteBusiness },
        { id: 'artists', label: 'Artistas', items: props.artists, onRestore: props.onRestoreArtist, onDelete: props.onDeleteArtist },
        { id: 'music', label: 'Músicas', items: props.music, onRestore: props.onRestoreMusic, onDelete: props.onDeleteMusic },
        { id: 'promotions', label: 'Promoções', items: props.promotions, onRestore: props.onRestorePromotion, onDelete: props.onDeletePromotion },
        { id: 'events', label: 'Eventos', items: props.events, onRestore: props.onRestoreEvent, onDelete: props.onDeleteEvent },
        { id: 'blitz', label: 'Lançamentos e Blitz', items: props.blitzes, onRestore: props.onRestoreBlitz, onDelete: props.onDeleteBlitz },
        { id: 'campaigns', label: 'Campanhas', items: props.campaigns, onRestore: props.onRestoreCampaign, onDelete: props.onDeleteCampaign },
    ];

    const currentTabData = tabs.find(t => t.id === activeTab);

    const noResults = (
        <div className="text-center py-16 px-4">
            <ArchiveBoxIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Nenhum item arquivado aqui</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Quando você arquivar um item de outra seção, ele aparecerá aqui.</p>
        </div>
    );
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Arquivo</h1>

            <div className="border-b border-slate-300/50 dark:border-slate-700/50">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab.label} <span className="bg-slate-200 dark:bg-slate-700 text-xs font-semibold ml-1.5 px-2 py-0.5 rounded-full">{tab.items.length}</span>
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-6 bg-white/30 dark:bg-slate-800/40 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border border-white/20 dark:border-slate-700/50">
                {/* Mobile Card View */}
                <div className="md:hidden">
                    {currentTabData && currentTabData.items.length > 0 ? (
                        <ul className="divide-y divide-slate-300/50 dark:divide-slate-700/50">
                            {currentTabData.items.map(item => {
                                const displayName = getDisplayName(item, activeTab);
                                return (
                                    <li key={item.id} className="p-4 flex justify-between items-center">
                                        <span className="text-sm text-slate-800 dark:text-slate-300 truncate pr-2">{displayName}</span>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            <button onClick={() => currentTabData.onRestore(item.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg" title="Restaurar"><ArrowUturnLeftIcon /></button>
                                            <button onClick={() => currentTabData.onDelete(item.id, activeTab, displayName)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg" title="Excluir Permanentemente"><TrashIcon /></button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : noResults}
                </div>

                 {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block">
                    {currentTabData && currentTabData.items.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-300/50 dark:divide-slate-700/50">
                            <thead className="bg-black/5 dark:bg-white/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Nome</th>
                                    <th className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-slate-300/50 dark:divide-slate-700/50">
                                {currentTabData.items.map(item => {
                                    const displayName = getDisplayName(item, activeTab);
                                    return (
                                        <tr key={item.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-300">{displayName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button onClick={() => currentTabData.onRestore(item.id)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 rounded-lg transition-colors" title="Restaurar">
                                                        <ArrowUturnLeftIcon />
                                                    </button>
                                                    <button onClick={() => currentTabData.onDelete(item.id, activeTab, displayName)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors" title="Excluir Permanentemente">
                                                        <TrashIcon />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                         noResults
                    )}
                </div>
            </div>

            {currentTabData && currentTabData.items.length > 0 && (
                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => onDeleteAll({ category: activeTab, label: currentTabData.label, itemsCount: currentTabData.items.length })}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-900"
                    >
                        <TrashIcon className="w-5 h-5" />
                        <span>Excluir Todos Permanentemente ({currentTabData.items.length})</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ArchiveSection;