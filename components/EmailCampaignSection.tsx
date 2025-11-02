import React, { useState, useMemo, useEffect } from 'react';
import { EmailCampaign, RadioStation, RadioType, RadioProfile, Music, Artist, CityHall, Business } from '../types';
import { BRAZILIAN_STATES, BUSINESS_CATEGORIES, RADIO_PROFILES, DDD_REGIONS } from '../constants';
import { XMarkIcon, SparklesIcon } from './Icons';
import { getDddInfo } from '../utils';
import GeminiEmailModal from './GeminiEmailModal';

type RecipientCategory = 'Rádios' | 'Prefeituras' | 'Empresários';

interface EmailCampaignSectionProps {
    campaigns: EmailCampaign[];
    onSave: (campaign: Omit<EmailCampaign, 'id' | 'sentAt'>) => void;
    radioStations: RadioStation[];
    cityHalls: CityHall[];
    businesses: Business[];
    crowleyMarkets: string[];
    music: Music[];
    artists: Artist[];
    attachedCampaignData: { image: string | null; subject: string; body: string } | null;
    onClearAttachedCampaignData: () => void;
}

const EmailCampaignSection = ({ campaigns, onSave, radioStations, cityHalls, businesses, crowleyMarkets, music, artists, attachedCampaignData, onClearAttachedCampaignData }: EmailCampaignSectionProps) => {
    const [subject, setSubject] = useState('NOVIDADES');
    const [body, setBody] = useState('');
    const [downloadLink, setDownloadLink] = useState('');
    const [selectedMusicId, setSelectedMusicId] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [imageToAttach, setImageToAttach] = useState<string | null>(null);
    const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
    
    const [recipientCategory, setRecipientCategory] = useState<RecipientCategory>('Rádios');

    const [radioFilters, setRadioFilters] = useState({ state: '', profile: '', type: '', crowleyMarket: '', ddd: '' });
    const [cityHallFilters, setCityHallFilters] = useState({ state: '', ddd: '' });
    const [businessFilters, setBusinessFilters] = useState({ state: '', category: '', ddd: '' });

    useEffect(() => {
        if (attachedCampaignData) {
            setImageToAttach(attachedCampaignData.image);
            setSubject(attachedCampaignData.subject);
            setBody(attachedCampaignData.body);
            onClearAttachedCampaignData();
        }
    }, [attachedCampaignData, onClearAttachedCampaignData]);

    const artistMap = useMemo(() => new Map(artists.map(a => [a.id, a.name])), [artists]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        switch (recipientCategory) {
            case 'Rádios':
                setRadioFilters(prev => ({ ...prev, [name]: value }));
                break;
            case 'Prefeituras':
                setCityHallFilters(prev => ({ ...prev, [name]: value }));
                break;
            case 'Empresários':
                setBusinessFilters(prev => ({ ...prev, [name]: value }));
                break;
        }
    };
    
    const handleMusicSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const musicId = e.target.value;
        setSelectedMusicId(musicId);
        const selectedSong = music.find(m => m.id === musicId);
        setDownloadLink(selectedSong?.wavUrl || '');
    };

    const clearFilters = () => {
        setRadioFilters({ state: '', profile: '', type: '', crowleyMarket: '', ddd: '' });
        setCityHallFilters({ state: '', ddd: '' });
        setBusinessFilters({ state: '', category: '', ddd: '' });
    };

    const filteredRecipients = useMemo(() => {
        switch (recipientCategory) {
            case 'Rádios':
                return radioStations.filter(station => {
                    const stationDdd = getDddInfo(station.phone)?.ddd || getDddInfo(station.whatsapp)?.ddd;
                    return (!radioFilters.state || station.state === radioFilters.state) &&
                           (!radioFilters.profile || station.profile === radioFilters.profile) &&
                           (!radioFilters.type || station.type === radioFilters.type) &&
                           (!radioFilters.crowleyMarket || (station.crowleyMarkets || []).includes(radioFilters.crowleyMarket)) &&
                           (!radioFilters.ddd || stationDdd === radioFilters.ddd);
                });
            case 'Prefeituras':
                 return cityHalls.filter(ch => {
                    const chDdd = getDddInfo(ch.phone)?.ddd || getDddInfo(ch.whatsapp)?.ddd;
                    return (!cityHallFilters.state || ch.state === cityHallFilters.state) &&
                           (!cityHallFilters.ddd || chDdd === cityHallFilters.ddd);
                 });
            case 'Empresários':
                return businesses.filter(b => {
                    const bDdd = getDddInfo(b.phone)?.ddd || getDddInfo(b.whatsapp)?.ddd;
                    return (!businessFilters.state || b.state === businessFilters.state) &&
                           (!businessFilters.category || b.category === businessFilters.category) &&
                           (!businessFilters.ddd || bDdd === businessFilters.ddd);
                });
            default:
                return [];
        }
    }, [recipientCategory, radioStations, cityHalls, businesses, radioFilters, cityHallFilters, businessFilters]);

    const createFilterSummary = () => {
        switch (recipientCategory) {
            case 'Rádios':
                return [
                    radioFilters.state && `Estado: ${radioFilters.state}`,
                    radioFilters.ddd && `DDD: ${radioFilters.ddd}`,
                    radioFilters.profile && `Perfil: ${radioFilters.profile}`,
                    radioFilters.type && `Tipo: ${radioFilters.type}`,
                    radioFilters.crowleyMarket && `Praça Crowley: ${radioFilters.crowleyMarket}`,
                ].filter(Boolean).join(' | ') || 'Todas as Rádios';
            case 'Prefeituras':
                return [
                    cityHallFilters.state && `Estado: ${cityHallFilters.state}`,
                    cityHallFilters.ddd && `DDD: ${cityHallFilters.ddd}`,
                ].filter(Boolean).join(' | ') || 'Todas as Prefeituras';
            case 'Empresários':
                 return [
                    businessFilters.state && `Estado: ${businessFilters.state}`,
                    businessFilters.ddd && `DDD: ${businessFilters.ddd}`,
                    businessFilters.category && `Categoria: ${businessFilters.category}`,
                ].filter(Boolean).join(' | ') || 'Todos os Empresários';
            default:
                return 'N/A';
        }
    };

    const handleSend = () => {
        const recipientEmails = filteredRecipients.map(r => r.email).filter(Boolean).join(',');
        if (!recipientEmails) {
            alert(`Nenhum(a) ${recipientCategory.toLowerCase()} com e-mail válido encontrado(a) nos filtros atuais.`);
            return;
        }

        let fullBody = body;
        if (downloadLink) {
            fullBody += `\n\n---\nBaixe a música em alta qualidade (WAV):\n${downloadLink}`;
        }
        if (imageToAttach) {
            fullBody += `\n\n\n--- Imagem Anexada ---\n(Copie e cole a imagem abaixo no seu e-mail se ela não aparecer automaticamente)`;
        }
        
        const mailtoLink = `mailto:?bcc=${recipientEmails}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;
        
        const MAILTO_CHAR_LIMIT = 2000;

        if (mailtoLink.length > MAILTO_CHAR_LIMIT) {
            navigator.clipboard.writeText(recipientEmails);
            alert(
                `A lista de destinatários é muito grande (${filteredRecipients.length} e-mails) para abrir o cliente de e-mail diretamente.\n\n` +
                'A lista de e-mails foi copiada para sua área de transferência.\n\n' +
                'Por favor, cole-a manualmente no campo Cco (BCC) do seu programa de e-mail.'
            );
            // Open email client with just subject and body
            const shorterMailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`;
            window.location.href = shorterMailtoLink;
        } else {
            window.location.href = mailtoLink;
        }


        const campaignData = {
            subject,
            body: fullBody,
            recipientCategory,
            recipientFilter: createFilterSummary(),
            recipientCount: filteredRecipients.length,
            attachedMusicId: selectedMusicId,
            attachedArtistId: music.find(m => m.id === selectedMusicId)?.artistId,
            recipientIds: filteredRecipients.map(r => r.id),
        };

        onSave(campaignData);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
    };
    
    const selectedSong = music.find(m => m.id === selectedMusicId);
    const selectedArtistName = selectedSong ? artistMap.get(selectedSong.artistId) : '';

    const formFieldClass = "block w-full px-3 py-2 bg-white/50 dark:bg-slate-900/50 border border-slate-300/50 dark:border-slate-700/50 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    
    const dddOptions = Object.keys(DDD_REGIONS).map(ddd => ({
        value: ddd,
        label: `DDD ${ddd} (${DDD_REGIONS[ddd].cities[0]})`
    })).sort((a,b) => parseInt(a.value) - parseInt(b.value));

    const renderDddFilter = (value: string) => (
        <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">DDD</label>
            <select name="ddd" value={value} onChange={handleFilterChange} className={formFieldClass}>
                <option value="">Todos</option>
                {dddOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        </div>
    );

    const renderRadioFilters = () => (
        <>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
                <select name="state" value={radioFilters.state} onChange={handleFilterChange} className={formFieldClass}>
                    <option value="">Todos</option>
                    {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name}</option>)}
                </select>
            </div>
            {renderDddFilter(radioFilters.ddd)}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Perfil</label>
                <select name="profile" value={radioFilters.profile} onChange={handleFilterChange} className={formFieldClass}>
                    <option value="">Todos</option>
                    {RADIO_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tipo</label>
                <select name="type" value={radioFilters.type} onChange={handleFilterChange} className={formFieldClass}>
                    <option value="">Todos</option>
                    {Object.values(RadioType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Praça Crowley</label>
                <select name="crowleyMarket" value={radioFilters.crowleyMarket} onChange={handleFilterChange} className={formFieldClass}>
                    <option value="">Todas</option>
                    {crowleyMarkets.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
        </>
    );

    const renderCityHallFilters = () => (
        <>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
                <select name="state" value={cityHallFilters.state} onChange={handleFilterChange} className={formFieldClass}>
                    <option value="">Todos</option>
                    {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name}</option>)}
                </select>
            </div>
            {renderDddFilter(cityHallFilters.ddd)}
        </>
    );
    
    const renderBusinessFilters = () => (
         <>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Estado</label>
                <select name="state" value={businessFilters.state} onChange={handleFilterChange} className={formFieldClass}>
                    <option value="">Todos</option>
                    {BRAZILIAN_STATES.map(s => <option key={s.uf} value={s.uf}>{s.name}</option>)}
                </select>
            </div>
            {renderDddFilter(businessFilters.ddd)}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
                 <select name="category" value={businessFilters.category} onChange={handleFilterChange} className={formFieldClass}>
                    <option value="">Todas</option>
                    {BUSINESS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
        </>
    );
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">E-mail Marketing</h1>
            <div className="space-y-8">
                {/* Email Composer */}
                <div className="bg-white/30 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Compor E-mail</h2>
                        <button 
                            onClick={() => setIsGeminiModalOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full hover:bg-indigo-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            Gerar com IA
                        </button>
                    </div>
                    <div className="space-y-4">
                        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Assunto do E-mail" className={formFieldClass} />
                        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Corpo do e-mail..." rows={10} className={formFieldClass}></textarea>
                        
                        {imageToAttach && (
                            <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">Imagem Anexada</h4>
                                    <button onClick={() => setImageToAttach(null)} className="text-sm text-red-600 dark:text-red-400 hover:underline">Remover</button>
                                </div>
                                <img src={imageToAttach} alt="Anexo da campanha" className="max-w-full h-auto rounded-lg border border-slate-200 dark:border-slate-700" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Esta imagem será adicionada ao final do corpo do e-mail.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select value={selectedMusicId} onChange={handleMusicSelectChange} className={formFieldClass}>
                                <option value="">Anexar música (opcional)</option>
                                {music.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {artistMap.get(m.artistId)} - {m.title}
                                    </option>
                                ))}
                            </select>
                            <input type="text" value={downloadLink} onChange={e => setDownloadLink(e.target.value)} placeholder="Ou cole o link de download aqui" className={formFieldClass} />
                        </div>
                    </div>
                </div>

                {/* Filters & Sending */}
                <div className="space-y-6">
                    <div className="bg-white/30 dark:bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50">
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">Destinatários</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoria</label>
                                <select value={recipientCategory} onChange={e => { setRecipientCategory(e.target.value as RecipientCategory); clearFilters(); }} className={formFieldClass}>
                                    <option value="Rádios">Rádios</option>
                                    <option value="Prefeituras">Prefeituras</option>
                                    <option value="Empresários">Empresários</option>
                                </select>
                            </div>
                            <div className="p-4 bg-black/5 dark:bg-white/5 border border-slate-300/50 dark:border-slate-700/50 rounded-lg">
                                <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-2">Filtros</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {recipientCategory === 'Rádios' && renderRadioFilters()}
                                    {recipientCategory === 'Prefeituras' && renderCityHallFilters()}
                                    {recipientCategory === 'Empresários' && renderBusinessFilters()}
                                </div>
                            </div>
                            <div className="pt-2">
                                <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{filteredRecipients.length} destinatários encontrados</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{createFilterSummary()}</p>
                            </div>
                        </div>
                    </div>
                     <button onClick={handleSend} className="w-full px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
                        Enviar E-mail
                    </button>
                    {showSuccess && (
                        <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200 rounded-lg text-sm flex justify-between items-center">
                            <span>Campanha enviada e salva no histórico!</span>
                            <button onClick={() => setShowSuccess(false)}><XMarkIcon className="w-4 h-4" /></button>
                        </div>
                    )}
                </div>
            </div>
            <GeminiEmailModal
                isOpen={isGeminiModalOpen}
                onClose={() => setIsGeminiModalOpen(false)}
                onApply={(subject, body) => {
                    setSubject(subject);
                    setBody(body);
                }}
                initialPromptData={{
                    artistName: selectedArtistName || '',
                    songTitle: selectedSong?.title || ''
                }}
            />
        </div>
    );
};

export default EmailCampaignSection;