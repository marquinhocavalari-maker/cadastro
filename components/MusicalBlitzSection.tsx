import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MusicalBlitz, Music, Artist, ActiveView } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, BoltIcon, CameraIcon, ArrowPathIcon, SparklesIcon } from './Icons';
import { normalizeString, capitalizeFirstLetter } from '../utils';
import GeminiBlitzModal from './GeminiBlitzModal';

type BlitzFormData = Omit<MusicalBlitz, 'id' | 'isArchived'>;

const BlitzForm = ({ onSave, onClose, initialData, music, artists, editingBlitz }: { onSave: (data: BlitzFormData) => void; onClose: () => void; initialData?: BlitzFormData | null; music: Music[]; artists: Artist[]; editingBlitz: MusicalBlitz | null; }) => {
    const [blitz, setBlitz] = useState(initialData || { musicId: '', eventDate: '', notes: '' });
    const [weekendError, setWeekendError] = useState<{ show: boolean, day: string }>({ show: false, day: '' });
    const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
    
    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setBlitz(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!blitz.musicId) {
            alert('Por favor, selecione uma música.');
            return;
        }

        const selectedDate = new Date(blitz.eventDate + 'T00:00:00');
        const dayOfWeek = selectedDate.getDay();

        if (dayOfWeek === 6 || dayOfWeek === 0) { // 6 = Saturday, 0 = Sunday
            const dayName = dayOfWeek === 6 ? 'Sábado' : 'Domingo';
            setWeekendError({ show: true, day: dayName });
            return;
        }
        
        onSave(blitz);
        onClose();
    };
    
    const handleCloseWeekendModal = () => {
        setWeekendError({ show: false, day: '' });
        setBlitz(p => ({ ...p, eventDate: '' })); // Clear the invalid date
    };

    const sortedMusic = useMemo(() => {
        const artistMap = new Map(artists.map(a => [a.id, a.name]));
        return [...music].sort((a,b) => {
            const artistA = artistMap.get(a.artistId) || '';
            const artistB = artistMap.get(b.artistId) || '';
            const artistComparison = artistA.localeCompare(artistB);
            if (artistComparison !== 0) return artistComparison;
            return a.title.localeCompare(b.title);
        });
    }, [music, artists]);
    
    const musicInfo = music.find(m => m.id === blitz.musicId);
    const artistInfo = musicInfo ? artists.find(a => a.id === musicInfo.artistId) : null;

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {editingBlitz ? (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Música</label>
                        <p className="px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm">
                            {artistInfo?.name || 'Artista desconhecido'} - {musicInfo?.title || 'Música desconhecida'}
                        </p>
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Música</label>
                        <select name="musicId" value={blitz.musicId} onChange={handleChange} className={formFieldClass} required>
                            <option value="">Selecione a música</option>
                            {sortedMusic.map(song => {
                                const artistName = artists.find(a => a.id === song.artistId)?.name || 'Desconhecido';
                                return <option key={song.id} value={song.id}>{artistName} - {song.title}</option>
                            })}
                        </select>
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data da Ação</label>
                    <input name="eventDate" type="date" value={blitz.eventDate} onChange={handleChange} className={formFieldClass} required />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Observações (opcional)</label>
                        <button 
                            type="button"
                            onClick={() => setIsGeminiModalOpen(true)}
                            disabled={!blitz.musicId}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full hover:bg-indigo-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            title={!blitz.musicId ? "Selecione uma música primeiro" : "Gerar observações com IA"}
                        >
                            <SparklesIcon className="w-3 h-3" />
                            Gerar com IA
                        </button>
                    </div>
                    <textarea id="notes" name="notes" value={blitz.notes || ''} onChange={handleChange} placeholder="Observações..." rows={3} className={formFieldClass}></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Salvar</button>
                </div>
            </form>
             <GeminiBlitzModal
                isOpen={isGeminiModalOpen}
                onClose={() => setIsGeminiModalOpen(false)}
                onApply={(notes) => setBlitz(p => ({ ...p, notes }))}
                context={{
                    artistName: artistInfo?.name || '',
                    songTitle: musicInfo?.title || '',
                    eventDate: blitz.eventDate
                }}
            />
            <Modal isOpen={weekendError.show} onClose={handleCloseWeekendModal} title="Data Inválida" size="md">
                <p>A data selecionada é um(a) <strong>{weekendError.day}</strong>.</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Não é permitido agendar lançamentos ou blitz aos sábados e domingos. Por favor, escolha um dia útil.</p>
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleCloseWeekendModal}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                    >
                        Entendi
                    </button>
                </div>
            </Modal>
        </>
    );
};

const daysUntil = (dateStr: string) => {
    if (!dateStr) return { days: 9999, color: '', text: 'Sem data' };
    const target = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return { days, color: 'text-slate-500 dark:text-slate-400', text: 'Realizada' };
    if (days === 0) return { days, color: 'text-red-500 dark:text-red-400 font-bold', text: 'Hoje' };
    if (days <= 10) return { days, color: 'text-yellow-500 dark:text-yellow-400', text: `Em ${days} dias` };
    return { days, color: 'text-green-500 dark:text-green-400', text: `Em ${days} dias` };
};

const formatDateWithWeekday = (dateString?: string) => {
    if (!dateString) return { date: '-', weekday: '' };
    const date = new Date(dateString + 'T00:00:00');
    return {
        date: date.toLocaleDateString('pt-BR'),
        weekday: capitalizeFirstLetter(date.toLocaleDateString('pt-BR', { weekday: 'long' })),
    };
};

interface MusicalBlitzSectionProps {
    musicalBlitzes: MusicalBlitz[];
    music: Music[];
    artists: Artist[];
    onSave: (blitz: Omit<MusicalBlitz, 'id'> | MusicalBlitz) => void;
    onArchive: (id: string, type: string, name: string) => void;
    setActiveView: (view: ActiveView) => void;
    onExportAndAttach: (imageDataUrl: string, subject: string, body: string) => void;
}

const MusicalBlitzSection = ({ musicalBlitzes, music, artists, onSave, onArchive, setActiveView, onExportAndAttach }: MusicalBlitzSectionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlitz, setEditingBlitz] = useState<MusicalBlitz | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const agendaTableRef = useRef<HTMLDivElement>(null);
    const [exportState, setExportState] = useState<'loading' | 'ready' | 'error' | 'exporting'>('loading');

    useEffect(() => {
        const scriptId = 'html2canvas-script';

        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.async = true;
            document.body.appendChild(script);
        }

        const intervalId = setInterval(() => {
            if (typeof (window as any).html2canvas !== 'undefined') {
                clearInterval(intervalId);
                setExportState('ready');
            }
        }, 100);

        const timeoutId = setTimeout(() => {
            clearInterval(intervalId);
            if (typeof (window as any).html2canvas === 'undefined') {
                setExportState('error');
            }
        }, 10000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, []);
    
    const handleOpenModal = (blitz: MusicalBlitz | null = null) => {
        setEditingBlitz(blitz);
        setIsModalOpen(true);
    };

    const handleSave = (data: BlitzFormData) => {
        if (editingBlitz) {
            onSave({ ...editingBlitz, ...data });
        } else {
            onSave(data);
        }
    };
    
    const { weekBlitzes, futureBlitzes, dateRange } = useMemo(() => {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

        const offsetToMonday = isWeekend 
            ? (dayOfWeek === 6 ? 2 : 1)
            : 1 - dayOfWeek;

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() + offsetToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 4);
        endOfWeek.setHours(23, 59, 59, 999);
        
        const rangeString = `${startOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${endOfWeek.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;

        const artistMap = new Map(artists.map(a => [a.id, a]));
        const songMap = new Map(music.map(m => [m.id, m]));

        const allBlitzesWithDetails = musicalBlitzes.map(blitz => {
            const song = songMap.get(blitz.musicId);
            if (!song) return null;
            const artist = artistMap.get(song.artistId);
            if (!artist) return null;
            return { ...blitz, song, artist, eventDateObj: new Date(blitz.eventDate + 'T00:00:00') };
        }).filter((item): item is NonNullable<typeof item> => item !== null);

        const normalizedSearch = normalizeString(searchTerm);
        const filteredBlitzes = !normalizedSearch 
            ? allBlitzesWithDetails
            : allBlitzesWithDetails.filter(item => 
                normalizeString(item.artist.name).includes(normalizedSearch) ||
                normalizeString(item.song.title).includes(normalizedSearch)
            );

        const weekItems = filteredBlitzes
            .filter(item => item.eventDateObj >= startOfWeek && item.eventDateObj <= endOfWeek)
            .sort((a, b) => a.eventDateObj.getTime() - b.eventDateObj.getTime());
            
        const futureItems = filteredBlitzes
            .filter(item => item.eventDateObj > endOfWeek)
            .sort((a, b) => a.eventDateObj.getTime() - b.eventDateObj.getTime());
        
        return {
            weekBlitzes: weekItems,
            futureBlitzes: futureItems,
            dateRange: rangeString
        };
    }, [musicalBlitzes, music, artists, searchTerm]);
    
    const handleExportAndAttachToEmail = async () => {
        const html2canvasLib = (window as any).html2canvas;
        if (!agendaTableRef.current || !html2canvasLib) {
            alert('Erro: A funcionalidade de exportação não está pronta. Tente novamente em alguns segundos.');
            return;
        }

        setExportState('exporting');

        try {
            const elementToCapture = agendaTableRef.current;
            const canvas = await html2canvasLib(elementToCapture, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#f8fafc',
                onclone: (clonedDoc: Document) => {
                    clonedDoc.documentElement.classList.remove('dark');
                    clonedDoc.querySelectorAll('.export-hide').forEach(el => {
                        if (el instanceof HTMLElement) {
                            el.style.display = 'none';
                        }
                    });
                }
            });

            const footerHeight = 60;
            const newCanvas = document.createElement('canvas');
            newCanvas.width = canvas.width;
            newCanvas.height = canvas.height + footerHeight;
            const ctx = newCanvas.getContext('2d');
            if (!ctx) throw new Error('Não foi possível obter o contexto do canvas.');

            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
            ctx.drawImage(canvas, 0, 0);

            const now = new Date();
            const dateTimeString = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
            const footerText = `EMITIDO POR : Marcos Cavalari | ${dateTimeString}`;
            
            ctx.fillStyle = '#64748b';
            ctx.font = '24px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(footerText, newCanvas.width / 2, newCanvas.height - 20);

            const imageDataUrl = newCanvas.toDataURL('image/png');
            
            const subject = `Agenda de eventos futuros - ${dateRange}`;
            const body = 'Olá tudo bem?\n\nSegue em anexo as datas de eventos da próxima semana!\n\nQualquer dúvida me chame no WhatsApp.\n\nTenha um abençoado final de semana\n\nAtt,\nMarcos Cavalari';

            // Action 1: Download the image
            const link = document.createElement('a');
            link.download = `agenda-semana-${dateRange.replace(/ a /g, '-').replace(/\//g, '.')}.png`;
            link.href = imageDataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Action 2: Pass image and text to email component and switch view
            onExportAndAttach(imageDataUrl, subject, body);

        } catch (error) {
            console.error('Erro ao gerar a imagem:', error);
            alert(`Ocorreu um erro inesperado ao gerar a imagem. Detalhes: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setExportState('ready');
        }
    };

    const BlitzTable = ({ blitzes, title, subtitle, noResultsMessage, isAgendaSemana = false }: { blitzes: typeof weekBlitzes, title: string, subtitle?: string, noResultsMessage: string, isAgendaSemana?: boolean }) => {
        
        const exportButtonContent = useMemo(() => {
            switch (exportState) {
                case 'loading':
                    return <><ArrowPathIcon className="w-4 h-4 animate-spin" /> <span className="hidden sm:inline">Carregando...</span></>;
                case 'exporting':
                    return <><ArrowPathIcon className="w-4 h-4 animate-spin" /> <span className="hidden sm:inline">Exportando...</span></>;
                case 'error':
                    return <><span>Erro</span></>;
                case 'ready':
                    return <><CameraIcon className="w-4 h-4" /> <span className="hidden sm:inline">Exportar e Anexar</span></>;
            }
        }, [exportState]);

        if (blitzes.length === 0 && !searchTerm) {
            return (
                <div className="rounded-t-2xl">
                    <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <div>
                          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
                          {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
                        </div>
                        {isAgendaSemana && (
                            <div className="flex items-center gap-2 export-hide">
                                 <button 
                                    onClick={handleExportAndAttachToEmail} 
                                    disabled={exportState !== 'ready'}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                                    title={exportState === 'error' ? "Falha ao carregar a biblioteca de exportação." : "Exportar como Imagem e anexar ao e-mail"}
                                >
                                    {exportButtonContent}
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="text-center py-8 px-4" ref={isAgendaSemana ? agendaTableRef : null}>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{noResultsMessage}</p>
                    </div>
                </div>
            );
        }

        if (blitzes.length === 0 && searchTerm) {
            return null;
        }

        return (
            <div className="rounded-t-2xl">
                 <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
                        {subtitle && <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
                    </div>
                     {isAgendaSemana && (
                        <div className="flex items-center gap-2 export-hide">
                            <button 
                                onClick={handleExportAndAttachToEmail} 
                                disabled={exportState !== 'ready' || blitzes.length === 0}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed" 
                                title={
                                    exportState === 'error' ? "Falha ao carregar a biblioteca de exportação." :
                                    blitzes.length === 0 ? "Nenhuma blitz na agenda da semana para exportar." :
                                    "Exportar como Imagem e anexar ao e-mail"
                                }
                            >
                                {exportButtonContent}
                            </button>
                        </div>
                    )}
                </div>
                <div className="overflow-x-auto" ref={isAgendaSemana ? agendaTableRef : null}>
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Artista / Música</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Data Lançamento</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Data Blitz</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Observações</th>
                                <th className="relative px-4 py-3 export-hide"><span className="sr-only">Ações</span></th>
                            </tr>
                        </thead>
                        <tbody className="bg-transparent divide-y divide-slate-200 dark:divide-slate-800">
                            {blitzes.map(blitz => {
                                const releaseDateInfo = formatDateWithWeekday(blitz.song.releaseDate);
                                const blitzDateInfo = formatDateWithWeekday(blitz.eventDate);
                                const status = daysUntil(blitz.eventDate);

                                return (
                                    <tr key={blitz.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 whitespace-nowrap align-top">
                                            <div className="font-medium text-slate-900 dark:text-white">{blitz.artist.name}</div>
                                            <div className="text-sm text-slate-500 dark:text-slate-400">{blitz.song.title}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800 dark:text-slate-300 align-top">
                                            <div>{releaseDateInfo.date}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{releaseDateInfo.weekday}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm align-top">
                                            <div className="font-semibold text-red-600 dark:text-red-500">{blitzDateInfo.date}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">{blitzDateInfo.weekday}</div>
                                            <div className={`text-xs font-medium ${status.color}`}>{status.text}</div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate align-top" title={blitz.notes || ''}>
                                            {blitz.notes}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right align-top export-hide">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => handleOpenModal(blitz)} className="p-2 text-slate-500 hover:text-indigo-600"><PencilIcon /></button>
                                                <button onClick={() => onArchive(blitz.id, 'blitz', `${blitz.artist.name} - ${blitz.song.title}`)} className="p-2 text-slate-500 hover:text-red-600"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Lançamentos e Blitz</h1>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Buscar por artista ou música..." className="block w-full sm:w-64 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm" />
                    <button onClick={() => handleOpenModal(null)} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Nova Blitz</span>
                    </button>
                </div>
            </div>
            
            <div className="space-y-8">
                <div className="bg-slate-50 dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <BlitzTable blitzes={weekBlitzes} title="Agenda da Semana" subtitle={`Exibindo eventos de ${dateRange}`} noResultsMessage="Nenhuma blitz agendada para a semana atual." isAgendaSemana />
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <BlitzTable blitzes={futureBlitzes} title="Próximas Agendas" subtitle="Eventos futuros após a semana atual" noResultsMessage="Nenhuma blitz futura agendada." />
                </div>
            </div>

            {(weekBlitzes.length === 0 && futureBlitzes.length === 0 && searchTerm) && (
                 <div className="text-center py-16 px-4">
                    <BoltIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                    <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Nenhum resultado encontrado</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Nenhuma blitz corresponde à sua busca.</p>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBlitz ? "Editar Ação" : "Agendar Nova Blitz"}>
                <BlitzForm 
                    onSave={handleSave} 
                    onClose={() => setIsModalOpen(false)} 
                    initialData={editingBlitz ? { musicId: editingBlitz.musicId, eventDate: editingBlitz.eventDate, notes: editingBlitz.notes } : null} 
                    music={music}
                    artists={artists}
                    editingBlitz={editingBlitz}
                />
            </Modal>
        </div>
    );
};

export default MusicalBlitzSection;