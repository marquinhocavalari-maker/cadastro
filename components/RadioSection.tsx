import React, { useState, useMemo } from 'react';
import { RadioStation } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, RadioIcon, WhatsAppIcon, EmailIcon, WebsiteIcon, InstagramIcon, FacebookIcon, MapPinIcon } from './Icons';
import { createWhatsAppLink, normalizeString, getDddInfo } from '../utils';
import { RadioForm } from './RadioForm';

const CrowleyBadge = () => (
    <div className="group relative flex items-center">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold" aria-label="Rádio auditada pela Crowley">
            C
        </div>
        <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-slate-700">
            Rádio auditada pela Crowley
        </div>
    </div>
);

const RadioDetailView = ({ station, onEdit }: { station: RadioStation; onEdit: () => void; }) => {
    const contactLinks = [
        { href: createWhatsAppLink(station.whatsapp), icon: WhatsAppIcon, text: `${station.whatsapp} (Comercial)`, condition: station.whatsapp },
        { href: createWhatsAppLink(station.listenersWhatsapp), icon: WhatsAppIcon, text: `${station.listenersWhatsapp} (Ouvintes)`, condition: station.listenersWhatsapp },
        { href: `mailto:${station.email}`, icon: EmailIcon, text: station.email, condition: station.email },
        { href: `https://${station.website}`, icon: WebsiteIcon, text: station.website, condition: station.website },
        { href: `https://www.instagram.com/${station.instagram}`, icon: InstagramIcon, text: `@${station.instagram}`, condition: station.instagram },
        { href: `https://www.facebook.com/${station.facebook}`, icon: FacebookIcon, text: `/${station.facebook}`, condition: station.facebook },
    ];
    
    const dddInfo = getDddInfo(station.phone) || getDddInfo(station.whatsapp);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-grow space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        {station.name}
                        {station.isCrowleyAudited && <CrowleyBadge />}
                    </h3>
                    <p className="text-md text-slate-500 dark:text-slate-400">{station.slogan}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{station.type}</p>
                </div>

                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Informações Artísticas</h4>
                    <p><strong>Diretor(a) Artístico(a):</strong> {station.artisticDirector || 'Não informado'}</p>
                    <p><strong>Perfil da Emissora:</strong> {station.profile || 'Não informado'}</p>
                </div>
                
                <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Contato</h4>
                    <ul className="space-y-2">
                        {contactLinks.map(({ href, icon: Icon, text, condition }) =>
                            condition && (
                                <li key={text} className="flex items-center">
                                    <Icon className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline break-all">{text}</a>
                                </li>
                            )
                        )}
                        {station.phone && <li className="flex items-center"><span className="w-5 h-5 mr-3" /><span>{station.phone} (Comercial)</span></li>}
                    </ul>
                </div>

                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Endereço</h4>
                    <p>{station.street}, {station.number}</p>
                    {station.complement && <p>{station.complement}</p>}
                    <p>{station.neighborhood}</p>
                    <p>{station.city}, {station.state} - {station.zipCode}</p>
                     {dddInfo && (
                        <div className="flex items-center gap-2 pt-2">
                            <MapPinIcon className="w-4 h-4 text-slate-400" />
                            <span className="text-sm font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 px-2 py-0.5 rounded-full">
                                DDD {dddInfo.ddd} ({dddInfo.region})
                            </span>
                        </div>
                    )}
                </div>
                
                {station.isCrowleyAudited && (station.crowleyMarkets?.length || 0) > 0 && (
                     <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Praças Crowley</h4>
                        <p>{station.crowleyMarkets?.join(', ')}</p>
                    </div>
                )}

            </div>

            <div className="md:w-1/4 flex-shrink-0 flex flex-col items-center space-y-4">
                {station.logoUrl ? (
                    <img src={station.logoUrl} alt={`${station.name} logo`} className="w-32 h-32 rounded-xl object-cover bg-slate-100 dark:bg-slate-700 shadow-md" />
                ) : (
                    <div className="w-32 h-32 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md">
                        <RadioIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                    </div>
                )}
                <button onClick={onEdit} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <PencilIcon className="w-4 h-4" />
                    <span>Editar Cadastro</span>
                </button>
            </div>
        </div>
    );
};


interface RadioSectionProps {
    stations: RadioStation[];
    onSave: (station: Omit<RadioStation, 'id'> | RadioStation) => void;
    onArchive: (id: string, type: string, name: string) => void;
    crowleyMarkets: string[];
}

const RadioSection = ({ stations, onSave, onArchive, crowleyMarkets }: RadioSectionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<RadioStation | null>(null);
    const [viewingStation, setViewingStation] = useState<RadioStation | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleEdit = (station: RadioStation) => {
        setEditingStation(station);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingStation(null);
        setIsModalOpen(true);
    };
    
    const filteredStations = useMemo(() => {
        const normalizedSearch = normalizeString(searchTerm);
        if (!normalizedSearch) return stations;
        
        return stations.filter(station => {
            const dddInfo = getDddInfo(station.phone) || getDddInfo(station.whatsapp);
            const dddSearchMatch = dddInfo ? 
                dddInfo.ddd.includes(normalizedSearch) || normalizeString(dddInfo.region).includes(normalizedSearch) : 
                false;

            return normalizeString(station.name).includes(normalizedSearch) ||
                normalizeString(station.city).includes(normalizedSearch) ||
                normalizeString(station.frequency).includes(normalizedSearch) ||
                dddSearchMatch;
        });
    }, [stations, searchTerm]);
    
    const noResults = (
        <div className="text-center py-16 px-4">
            <RadioIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Nenhuma rádio encontrada</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tente ajustar os filtros ou adicione uma nova rádio.</p>
            <button onClick={openAddModal} className="mt-6 flex mx-auto items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                <PlusIcon className="w-5 h-5"/>
                <span>Adicionar Rádio</span>
            </button>
        </div>
    );
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Rádios ({stations.length})</h1>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <input type="text" placeholder="Buscar por nome, cidade, DDD..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full sm:w-64 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500"/>
                    <button onClick={openAddModal} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Nova Rádio</span>
                    </button>
                </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Mobile Card View */}
                <div className="md:hidden">
                    {filteredStations.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                            {filteredStations.map(station => {
                                const dddInfo = getDddInfo(station.phone) || getDddInfo(station.whatsapp);
                                return (
                                <li key={station.id} className="p-4">
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setViewingStation(station)}>
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {station.logoUrl ? <img className="h-10 w-10 rounded-full object-cover" src={station.logoUrl} alt="" /> : <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><RadioIcon className="w-6 h-6 text-slate-400" /></div>}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{station.name}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{station.type}</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{station.city}, {station.state}</p>
                                                {dddInfo && (
                                                    <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-1 font-semibold">
                                                        DDD {dddInfo.ddd} ({dddInfo.region})
                                                    </p>
                                                )}
                                            </div>
                                            {station.isCrowleyAudited && <CrowleyBadge />}
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                             <button onClick={() => handleEdit(station)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"><PencilIcon /></button>
                                             <button onClick={() => onArchive(station.id, 'radios', station.name)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg"><TrashIcon /></button>
                                        </div>
                                    </div>
                                </li>
                                );
                            })}
                        </ul>
                    ) : ( noResults )}
                </div>
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block">
                    {filteredStations.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-100 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Rádio</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Localização / DDD</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Contato</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Diretor Artístico</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">E-mail</th>
                                    <th scope="col" className="relative px-4 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredStations.map(station => {
                                    const dddInfo = getDddInfo(station.phone) || getDddInfo(station.whatsapp);
                                    return (
                                    <tr key={station.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    {station.logoUrl ? <img className="h-10 w-10 rounded-full object-cover" src={station.logoUrl} alt="" /> : <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><RadioIcon className="w-6 h-6 text-slate-400" /></div>}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-2" onClick={() => setViewingStation(station)}>
                                                        <span>{station.name}</span>
                                                        {station.isCrowleyAudited && <CrowleyBadge />}
                                                    </div>
                                                    <div className="text-xs text-slate-600 dark:text-slate-400">{station.type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 dark:text-slate-300">
                                            <div>{`${station.city}, ${station.state}`}</div>
                                            {dddInfo && (
                                                <div className="text-indigo-600 dark:text-indigo-400 mt-1 font-semibold">
                                                    DDD {dddInfo.ddd} ({dddInfo.region})
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            {station.whatsapp ? (
                                                <a href={createWhatsAppLink(station.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline flex items-center gap-1.5">
                                                    <WhatsAppIcon className="w-4 h-4" />
                                                    {station.whatsapp}
                                                </a>
                                            ) : (station.phone || '-')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 dark:text-slate-300">{station.artisticDirector || '-'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            {station.email ? (
                                                <a href={`mailto:${station.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                    {station.email}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleEdit(station)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"><PencilIcon /></button>
                                                <button onClick={() => onArchive(station.id, 'radios', station.name)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" title="Arquivar"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    ) : ( noResults )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStation ? 'Editar Rádio' : 'Adicionar Nova Rádio'} size="3xl">
                <RadioForm onSave={onSave} onClose={() => setIsModalOpen(false)} initialData={editingStation} crowleyMarketsList={crowleyMarkets} />
            </Modal>

            <Modal isOpen={!!viewingStation} onClose={() => setViewingStation(null)} title="Detalhes da Rádio" size="2xl">
                {viewingStation && (
                    <RadioDetailView 
                        station={viewingStation} 
                        onEdit={() => {
                            const stationToEdit = viewingStation;
                            setViewingStation(null);
                            handleEdit(stationToEdit);
                        }} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default RadioSection;