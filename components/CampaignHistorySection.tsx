import React, { useState, useMemo } from 'react';
import { EmailCampaign, RadioStation, Music, Artist, CityHall, Business } from '../types';
import Modal from './Modal';
import { ArchiveBoxIcon, PrinterIcon, TrashIcon } from './Icons';

interface CampaignHistorySectionProps {
    campaigns: EmailCampaign[];
    radioStations: RadioStation[];
    cityHalls: CityHall[];
    businesses: Business[];
    artists: Artist[];
    music: Music[];
    onArchive: (id: string, type: string, name: string) => void;
}

interface GenericRecipient {
    id: string;
    name: string;
    city?: string;
    state?: string;
    email?: string;
    type?: string; // For RadioType
}

const CampaignDetailView = ({ 
    campaign, 
    radioStations,
    cityHalls,
    businesses,
    artists,
    music,
    onClose,
}: { 
    campaign: EmailCampaign; 
    radioStations: RadioStation[];
    cityHalls: CityHall[];
    businesses: Business[];
    artists: Artist[];
    music: Music[];
    onClose: () => void;
}) => {
    
    const recipients = useMemo((): GenericRecipient[] => {
        switch (campaign.recipientCategory) {
            case 'Rádios':
                return radioStations.filter(r => campaign.recipientIds.includes(r.id))
                    .map(r => ({ id: r.id, name: r.name, city: r.city, state: r.state, email: r.email, type: r.type }));
            case 'Prefeituras':
                return cityHalls.filter(c => campaign.recipientIds.includes(c.id))
                    .map(c => ({ id: c.id, name: `Prefeitura de ${c.cityName}`, city: c.cityName, state: c.state, email: c.email }));
            case 'Empresários':
                 return businesses.filter(b => campaign.recipientIds.includes(b.id))
                    .map(b => ({ id: b.id, name: b.name, city: b.city, state: b.state, email: b.email }));
            default:
                return [];
        }
    }, [campaign, radioStations, cityHalls, businesses]);

    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `Relatorio_Campanha_${campaign.subject}_${new Date(campaign.sentAt).toLocaleDateString('pt-BR').replace(/\//g, '-')}`;
        window.print();
        document.title = originalTitle;
    };
    
    const attachedMusic = useMemo(() => {
        if (!campaign.attachedMusicId) return null;
        return music.find(m => m.id === campaign.attachedMusicId);
    }, [campaign.attachedMusicId, music]);

    const attachedArtist = useMemo(() => {
        const artistId = campaign.attachedArtistId || attachedMusic?.artistId;
        if (!artistId) return null;
        return artists.find(a => a.id === artistId);
    }, [campaign.attachedArtistId, attachedMusic, artists]);

    return (
        <div>
            <div className="printable-section">
                <div className="text-center mb-6 hidden print:block">
                    <h1 className="text-2xl font-bold text-black">Relatório de Campanha de E-mail</h1>
                </div>
                <div className="mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{campaign.subject}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enviado em: {new Date(campaign.sentAt).toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Filtros: {campaign.recipientFilter}</p>
                     {attachedArtist && attachedMusic && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                            <strong>Música Divulgada:</strong> {attachedArtist.name} - {attachedMusic.title}
                        </p>
                    )}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-300/50 dark:border-slate-700/50">
                    <h4 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Destinatários ({recipients.length}):</h4>
                    <div className="max-h-60 overflow-y-auto border border-slate-300/50 dark:border-slate-700/50 rounded-lg">
                        <table className="min-w-full divide-y divide-slate-300/50 dark:divide-slate-700/50">
                             <thead className="bg-black/5 dark:bg-white/5 sticky top-0">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Nome</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Cidade</th>
                                    {campaign.recipientCategory === 'Rádios' &&
                                      <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">Tipo</th>
                                    }
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase">E-mail</th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-slate-300/50 dark:divide-slate-700/50">
                                {recipients.map(recipient => (
                                    <tr key={recipient.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{recipient.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{recipient.city}, {recipient.state}</td>
                                        {campaign.recipientCategory === 'Rádios' &&
                                          <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{recipient.type}</td>
                                        }
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{recipient.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
             <div className="flex justify-end mt-6 pt-4 border-t border-slate-300/50 dark:border-slate-700/50 print-hidden">
                <button onClick={handlePrint} className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">
                    <PrinterIcon className="w-4 h-4" />
                    <span>Imprimir / Salvar PDF</span>
                </button>
            </div>
        </div>
    );
};

const CampaignHistorySection = ({ campaigns, radioStations, cityHalls, businesses, artists, music, onArchive }: CampaignHistorySectionProps) => {
    const [viewingCampaign, setViewingCampaign] = useState<EmailCampaign | null>(null);

    const artistMap = useMemo(() => new Map(artists.map(a => [a.id, a.name])), [artists]);
    const musicMap = useMemo(() => new Map(music.map(m => [m.id, { title: m.title, artistId: m.artistId }])), [music]);

    const noResults = (
        <div className="text-center py-16 px-4">
            <ArchiveBoxIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Nenhuma campanha encontrada</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">O histórico de suas campanhas de e-mail aparecerá aqui após o primeiro envio.</p>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campanhas</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Veja o histórico de todas as campanhas de e-mail enviadas.</p>
            </div>

            <div className="bg-white/30 dark:bg-slate-800/40 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden border border-white/20 dark:border-slate-700/50">
                 {/* Mobile Card View */}
                <div className="md:hidden">
                    {campaigns.length > 0 ? (
                        <ul className="divide-y divide-slate-300/50 dark:divide-slate-700/50">
                            {campaigns.map(campaign => {
                                const musicInfo = campaign.attachedMusicId ? musicMap.get(campaign.attachedMusicId) : null;
                                const artistName = musicInfo ? artistMap.get(musicInfo.artistId) : null;
                                return (
                                <li key={campaign.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setViewingCampaign(campaign)}>
                                            <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{campaign.subject}</p>
                                            {artistName && musicInfo && <p className="text-sm text-slate-800 dark:text-slate-300 truncate">{artistName} - {musicInfo.title}</p>}
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{campaign.recipientCategory} ({campaign.recipientCount})</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(campaign.sentAt).toLocaleString('pt-BR')}</p>
                                        </div>
                                        <div className="flex-shrink-0 ml-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onArchive(campaign.id, 'campaigns', campaign.subject); }} 
                                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg" 
                                                title="Arquivar"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                                );
                            })}
                        </ul>
                    ) : (
                        noResults
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block">
                    {campaigns.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-300/50 dark:divide-slate-700/50">
                            <thead className="bg-black/5 dark:bg-white/5">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Campanha</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Artista / Música</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Destinatários</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Data de Envio</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-slate-300/50 dark:divide-slate-700/50">
                                {campaigns.map(campaign => {
                                    const musicInfo = campaign.attachedMusicId ? musicMap.get(campaign.attachedMusicId) : null;
                                    const artistName = musicInfo ? artistMap.get(musicInfo.artistId) : null;
                                    return (
                                        <tr key={campaign.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                                            <td onClick={() => setViewingCampaign(campaign)} className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white cursor-pointer">{campaign.subject}</td>
                                            <td onClick={() => setViewingCampaign(campaign)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 dark:text-slate-300 cursor-pointer">
                                                {artistName && musicInfo ? (
                                                    <div>
                                                        <div className="font-medium">{artistName}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{musicInfo.title}</div>
                                                    </div>
                                                ) : <span className="text-xs text-slate-500 dark:text-slate-400">N/A</span>}
                                            </td>
                                            <td onClick={() => setViewingCampaign(campaign)} className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer">
                                                <div className="text-slate-800 dark:text-slate-300">{campaign.recipientCategory} ({campaign.recipientCount})</div>
                                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate max-w-xs">{campaign.recipientFilter}</div>
                                            </td>
                                            <td onClick={() => setViewingCampaign(campaign)} className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 cursor-pointer">{new Date(campaign.sentAt).toLocaleString('pt-BR')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button 
                                                    onClick={() => onArchive(campaign.id, 'campaigns', campaign.subject)} 
                                                    className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg" 
                                                    title="Arquivar"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
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
             <Modal isOpen={!!viewingCampaign} onClose={() => setViewingCampaign(null)} title="Detalhes da Campanha" size="3xl">
                {viewingCampaign && <CampaignDetailView 
                    campaign={viewingCampaign} 
                    radioStations={radioStations} 
                    cityHalls={cityHalls} 
                    businesses={businesses} 
                    artists={artists}
                    music={music}
                    onClose={() => setViewingCampaign(null)} 
                />}
            </Modal>
        </div>
    );
};

export default CampaignHistorySection;