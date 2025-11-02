



import React, { useState, useMemo, useEffect } from 'react';
import { Artist, MusicGenre, Music, Business, ActiveView, MusicalBlitz } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, CloudArrowDownIcon, BriefcaseIcon, EyeIcon, EyeSlashIcon } from './Icons';
import { MUSIC_GENRES } from '../constants';
import { normalizeString, getReleaseStatus, getExpirationStatus } from '../utils';

const isValidUrl = (urlString?: string): boolean => {
    if (!urlString || urlString.trim() === '') return true; // Optional field, so an empty string is valid.
    try {
        const url = new URL(urlString);
        return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
        return false;
    }
};

const ArtistForm = ({
    onSave,
    onClose,
    initialData,
    allMusic,
    businesses,
}: {
    onSave: (
        artist: Omit<Artist, 'id' | 'createdAt'> | Artist,
        finalArtistSongs: Music[],
        musicToDeleteIds: string[]
    ) => void;
    onClose: () => void;
    initialData?: Artist | null;
    allMusic: Music[];
    businesses: Business[];
}) => {
    const [artist, setArtist] = useState<Omit<Artist, 'id' | 'createdAt'>>(
        initialData ? { name: initialData.name, genre: initialData.genre, businessId: initialData.businessId || '' } : { name: '', genre: MusicGenre.SERTANEJO, businessId: '' }
    );
    const [artistMusic, setArtistMusic] = useState<Music[]>(initialData ? allMusic.filter(m => m.artistId === initialData.id) : []);
    const [newSongData, setNewSongData] = useState({ title: '', composers: '', wavUrl: '', releaseDate: '' });
    const [editingSongId, setEditingSongId] = useState<string | null>(null);
    const [musicToDeleteIds, setMusicToDeleteIds] = useState<string[]>([]);
    const [weekendError, setWeekendError] = useState<{ show: boolean, day: string }>({ show: false, day: '' });

    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    
    const handleEditSong = (song: Music) => {
        setEditingSongId(song.id);
        setNewSongData({
            title: song.title,
            composers: song.composers || '',
            wavUrl: song.wavUrl || '',
            releaseDate: song.releaseDate || '',
        });
    };
    
    const handleCancelEdit = () => {
        setEditingSongId(null);
        setNewSongData({ title: '', composers: '', wavUrl: '', releaseDate: '' });
    };

    const handleAddOrUpdateSong = () => {
        if (!newSongData.title.trim()) return;
        if (!isValidUrl(newSongData.wavUrl)) {
            alert('O Link em WAV fornecido não é uma URL válida. Por favor, insira um link completo, começando com "http://" ou "https://".');
            return;
        }
        
        if (newSongData.releaseDate) {
            const selectedDate = new Date(newSongData.releaseDate + 'T00:00:00');
            const dayOfWeek = selectedDate.getDay();
            if (dayOfWeek === 6 || dayOfWeek === 0) { // 6 = Saturday, 0 = Sunday
                const dayName = dayOfWeek === 6 ? 'Sábado' : 'Domingo';
                setWeekendError({ show: true, day: dayName });
                return;
            }
        }

        if (editingSongId) { // Update existing song
            setArtistMusic(prev => prev.map(s => s.id === editingSongId ? { ...s, ...newSongData } : s));
        } else { // Add new song
            const newSong: Music = {
                id: `temp-${Date.now()}`,
                artistId: initialData?.id || 'temp',
                createdAt: new Date().toISOString(),
                ...newSongData,
                hideFromDashboard: false,
            };
            setArtistMusic(prev => [...prev, newSong]);
        }
        handleCancelEdit();
    };

    const handleRemoveSong = (songToRemove: Music) => {
        setArtistMusic(prev => prev.filter(s => s.id !== songToRemove.id));
        if (!songToRemove.id.startsWith('temp-')) {
            setMusicToDeleteIds(prev => [...prev, songToRemove.id]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const artistDataToSave = initialData ? { ...initialData, ...artist } : artist;
        onSave(artistDataToSave, artistMusic, musicToDeleteIds);
        onClose();
    };
    
    const handleCloseWeekendModal = () => {
        setWeekendError({ show: false, day: '' });
        setNewSongData(p => ({ ...p, releaseDate: '' })); // Clear the invalid date
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Nome do Artista</label>
                        <input value={artist.name} onChange={e => setArtist(p => ({ ...p, name: e.target.value }))} className={formFieldClass} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Gênero Musical</label>
                        <select value={artist.genre} onChange={e => setArtist(p => ({ ...p, genre: e.target.value as MusicGenre }))} className={formFieldClass}>
                            {MUSIC_GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Empresário Vinculado</label>
                        <select value={artist.businessId} onChange={e => setArtist(p => ({ ...p, businessId: e.target.value }))} className={formFieldClass}>
                            <option value="">Nenhum</option>
                            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>
                </div>
                {initialData && <p className="text-xs text-slate-500 dark:text-slate-400">Cadastrado em: {new Date(initialData.createdAt).toLocaleString('pt-BR')}</p>}

                <hr className="my-4 border-slate-200 dark:border-slate-800" />
                
                <div>
                    <h3 className="text-lg font-medium mb-3 text-slate-900 dark:text-white">Músicas de Trabalho</h3>
                    {artistMusic.length > 0 && (
                        <ul className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-2 border border-slate-200 dark:border-slate-800 rounded-lg p-2">
                            {artistMusic.map(song => (
                                <li key={song.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                                    <div className="flex items-center gap-2 flex-grow min-w-0">
                                        <div className="min-w-0">
                                            <p className="text-sm text-slate-800 dark:text-slate-200 truncate">{song.title}</p>
                                            {song.releaseDate && <p className="text-xs text-slate-500 dark:text-slate-400">Lança em: {new Date(song.releaseDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>}
                                        </div>
                                        {song.wavUrl && <CloudArrowDownIcon className="w-4 h-4 text-blue-500 flex-shrink-0" title="Link em WAV" />}
                                    </div>
                                    <div className="flex items-center flex-shrink-0">
                                        <button type="button" onClick={() => handleEditSong(song)} className="p-1 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-full" aria-label={`Editar ${song.title}`}>
                                            <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button type="button" onClick={() => handleRemoveSong(song)} className="p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 rounded-full" aria-label={`Remover ${song.title}`}>
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg space-y-3">
                        <h4 className="text-md font-medium text-slate-800 dark:text-slate-200">{editingSongId ? 'Editando Música' : 'Adicionar Nova Música'}</h4>
                        <input value={newSongData.title} onChange={e => setNewSongData(p => ({ ...p, title: e.target.value }))} placeholder="Título da música" className={formFieldClass} />
                        <input value={newSongData.composers} onChange={e => setNewSongData(p => ({...p, composers: e.target.value }))} placeholder="Compositor(es)" className={formFieldClass} />
                        <input value={newSongData.wavUrl} onChange={e => setNewSongData(p => ({ ...p, wavUrl: e.target.value }))} placeholder="Link do arquivo WAV" className={formFieldClass} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-slate-500 dark:text-slate-400">Data de Lançamento</label>
                                <input type="date" value={newSongData.releaseDate} onChange={e => setNewSongData(p => ({ ...p, releaseDate: e.target.value }))} className={formFieldClass} title="Data de Lançamento" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {editingSongId && (
                                <button type="button" onClick={handleCancelEdit} className="w-full px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">
                                    Cancelar Edição
                                </button>
                            )}
                            <button type="button" onClick={handleAddOrUpdateSong} disabled={!newSongData.title.trim()} className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600">
                                {editingSongId ? 'Atualizar Música' : 'Adicionar à Lista'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500">Cancelar</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Salvar Artista e Músicas</button>
                </div>
            </form>
            <Modal isOpen={weekendError.show} onClose={handleCloseWeekendModal} title="Data Inválida" size="md">
                <p>A data selecionada é um(a) <strong>{weekendError.day}</strong>.</p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Não é permitido agendar lançamentos aos sábados e domingos. Por favor, escolha um dia útil.</p>
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

interface ArtistMusicSectionProps {
    artists: Artist[];
    businesses: Business[];
    music: Music[];
    musicalBlitzes: MusicalBlitz[];
    onSave: (artist: Omit<Artist, 'id' | 'createdAt'> | Artist, finalArtistSongs: Music[], musicToDeleteIds: string[]) => void;
    onArchiveArtist: (id: string, type: string, name: string) => void;
    onToggleMusicDashboardVisibility: (musicId: string) => void;
    onNavigateToBusiness: (view: ActiveView, term: string) => void;
    initialSearchTerm?: string;
}

const ArtistMusicSection = ({ artists, businesses, music, musicalBlitzes, onSave, onArchiveArtist, onToggleMusicDashboardVisibility, onNavigateToBusiness, initialSearchTerm }: ArtistMusicSectionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');
    const [expandedArtistId, setExpandedArtistId] = useState<string | null>(null);

    useEffect(() => {
        // Only update the search term if a NEW initial term is provided.
        // This prevents the term from being cleared when the parent component re-renders.
        if (initialSearchTerm) {
            setSearchTerm(initialSearchTerm);
        }
    }, [initialSearchTerm]);

    const businessMap = useMemo(() => new Map(businesses.map(b => [b.id, b.name])), [businesses]);

    const handleEdit = (artist: Artist) => {
        setEditingArtist(artist);
        setIsModalOpen(true);
    };
    
    const openAddModal = () => {
        setEditingArtist(null);
        setIsModalOpen(true);
    };

    const toggleExpand = (artistId: string) => {
        setExpandedArtistId(prevId => prevId === artistId ? null : artistId);
    };
    
    const filteredArtists = useMemo(() => {
        const normalizedSearch = normalizeString(searchTerm);
        if (!normalizedSearch) return artists;
        return artists.filter(artist => 
            normalizeString(artist.name).includes(normalizedSearch) || 
            normalizeString(artist.genre).includes(normalizedSearch) ||
            normalizeString(businessMap.get(artist.businessId || '')).includes(normalizedSearch)
        );
    }, [artists, searchTerm, businessMap]);
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Artistas e Músicas ({artists.length})</h1>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <input type="text" placeholder="Buscar por nome, gênero ou empresário..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="block w-full sm:w-64 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500" />
                    <button onClick={openAddModal} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Novo Artista</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {filteredArtists.length > 0 ? (
                    filteredArtists.map(artist => {
                        const artistSongs = music.filter(m => m.artistId === artist.id);
                        const artistBlitzHistory = musicalBlitzes.filter(blitz => 
                            artistSongs.some(song => song.id === blitz.musicId) && !blitz.isArchived
                        ).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
                        const isExpanded = expandedArtistId === artist.id;
                        const linkedBusinessName = artist.businessId ? businessMap.get(artist.businessId) : null;
                        return (
                            <div key={artist.id} className="bg-slate-50 dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                                <div className="px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors" onClick={() => toggleExpand(artist.id)}>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-900 dark:text-white">{artist.name}</p>
                                        <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                                            <span>{artist.genre} - {artistSongs.length} música(s)</span>
                                            {linkedBusinessName && (
                                                <button onClick={(e) => { e.stopPropagation(); onNavigateToBusiness('empresarios', linkedBusinessName); }} className="flex items-center gap-1.5 hover:text-indigo-600 dark:hover:text-indigo-400" title="Empresário">
                                                    <BriefcaseIcon className="w-4 h-4 text-slate-400" />
                                                    {linkedBusinessName}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={(e) => { e.stopPropagation(); handleEdit(artist); }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg" title="Editar"><PencilIcon /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onArchiveArtist(artist.id, 'artists', artist.name); }} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg" title="Arquivar"><TrashIcon /></button>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-100 dark:bg-slate-800/50">
                                        {artistSongs.length > 0 && (
                                            <div className="mb-4">
                                                <h4 className="text-md font-semibold mb-2 text-slate-700 dark:text-slate-300">Músicas</h4>
                                                <ul className="space-y-2">
                                                    {artistSongs.map(song => {
                                                        const releaseStatus = getReleaseStatus(song.releaseDate);
                                                        const expirationStatus = getExpirationStatus(song.releaseDate);
                                                        return (
                                                            <li key={song.id} className="flex flex-col sm:flex-row justify-between sm:items-center text-sm p-2 bg-white dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                                                <div className="flex-grow flex items-center gap-2">
                                                                    {song.wavUrl && <a href={song.wavUrl} target="_blank" rel="noopener noreferrer" title="Link em WAV"><CloudArrowDownIcon className="w-5 h-5 text-blue-500"/></a>}
                                                                    <div>
                                                                        <p className="font-medium text-slate-800 dark:text-slate-200">{song.title}</p>
                                                                        {song.composers && <p className="text-xs text-slate-500 dark:text-slate-400">Compositor(es): {song.composers}</p>}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center flex-wrap justify-start sm:justify-end gap-2 mt-2 sm:mt-0">
                                                                    {releaseStatus && (
                                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${releaseStatus.className}`}>
                                                                            {releaseStatus.text}
                                                                        </span>
                                                                    )}
                                                                    {expirationStatus && (
                                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${expirationStatus.className}`}>
                                                                            ({expirationStatus.text})
                                                                        </span>
                                                                    )}
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onToggleMusicDashboardVisibility(song.id); }}
                                                                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full"
                                                                        title={song.hideFromDashboard ? "Mostrar no Dashboard" : "Ocultar do Dashboard"}
                                                                    >
                                                                        {song.hideFromDashboard ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                                                                    </button>
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                        {artistBlitzHistory && artistBlitzHistory.length > 0 && (
                                            <div>
                                                <h4 className="text-md font-semibold mb-2 text-slate-700 dark:text-slate-300">Histórico de Blitz</h4>
                                                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                                    {artistBlitzHistory.map(blitz => {
                                                        const song = music.find(m => m.id === blitz.musicId);
                                                        const blitzDate = new Date(blitz.eventDate + 'T00:00:00').toLocaleDateString('pt-BR');
                                                        return (
                                                            <li key={blitz.id} className="text-sm p-2 bg-white dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-700">
                                                                <p className="font-medium text-slate-800 dark:text-slate-200">{song?.title || 'Música desconhecida'}</p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                    Data: {blitzDate}
                                                                    {blitz.notes && ` - ${blitz.notes}`}
                                                                </p>
                                                            </li>
                                                        )
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                        {artistSongs.length === 0 && artistBlitzHistory.length === 0 && (
                                            <p className="text-sm text-center text-slate-500 dark:text-slate-400 py-4">Nenhuma música ou blitz cadastrada para este artista.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 px-4 bg-slate-50 dark:bg-slate-900 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800">
                        <UserIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                        <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Nenhum artista encontrado</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adicione um novo artista para começar.</p>
                        <button onClick={openAddModal} className="mt-6 flex mx-auto items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium">
                            <PlusIcon className="w-5 h-5"/><span>Adicionar Artista</span>
                        </button>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingArtist ? 'Editar Artista' : 'Adicionar Novo Artista'} size="3xl">
                <ArtistForm onSave={onSave} onClose={() => setIsModalOpen(false)} initialData={editingArtist} allMusic={music} businesses={businesses}/>
            </Modal>
        </div>
    );
};

export default ArtistMusicSection;
