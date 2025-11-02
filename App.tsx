


import React, { useState, useEffect, useMemo, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import RadioSection from './components/RadioSection';
import CityHallSection from './components/CityHallSection';
import BusinessSection from './components/BusinessSection';
import EmailCampaignSection from './components/EmailCampaignSection';
import CampaignHistorySection from './components/CampaignHistorySection';
import ArtistMusicSection from './components/ArtistMusicSection';
import PromotionSection from './components/PromotionSection';
import EventSection from './components/EventSection';
import OnlineFormSection from './components/OnlineFormSection';
import RadioSubmissionForm from './components/RadioSubmissionForm';
import ArchiveSection from './components/ArchiveSection';
import Modal from './components/Modal';
import ConfirmationModal from './components/ConfirmationModal';
import SettingsSection from './components/SettingsSection';
import LoginScreen from './components/LoginScreen';
import { RadioStation, CityHall, Business, RadioType, Artist, Music, Promotion, MusicGenre, PromotionType, RadioSubmission, EmailCampaign, RadioProfile, ActiveView, AppEvent as Event, MusicalBlitz, SheetsConfig } from './types';
import CrowleyMarketsSection from './components/CrowleyMarketsSection';
import { useStickyState } from './hooks/useStickyState';
import { toTitleCase, toLowerCaseSafe, capitalizeFirstLetter, normalizeString, getReleaseStatus } from './utils';
import { RadioForm } from './components/RadioForm';
import SyncModal from './components/SyncModal';
import MusicalBlitzSection from './components/MusicalBlitzSection';

const App = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return sessionStorage.getItem('controle-plus-auth') === 'true';
    });
     const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          return 'dark';
        }
        return 'light';
    });
    
    const [loadTime] = useState(new Date());

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFormView, setIsFormView] = useState(false);
    const [activeView, setActiveView] = useStickyState<ActiveView>('dashboard', 'activeView');
    const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
    
    // State for all data types
    const [radios, setRadios] = useStickyState<RadioStation[]>([], 'radios');
    const [cityHalls, setCityHalls] = useStickyState<CityHall[]>([], 'cityHalls');
    const [businesses, setBusinesses] = useStickyState<Business[]>([], 'businesses');
    const [artists, setArtists] = useStickyState<Artist[]>([], 'artists');
    const [music, setMusic] = useStickyState<Music[]>([], 'music');
    const [promotions, setPromotions] = useStickyState<Promotion[]>([], 'promotions');
    const [events, setEvents] = useStickyState<Event[]>([], 'events');
    const [musicalBlitzes, setMusicalBlitzes] = useStickyState<MusicalBlitz[]>([], 'musicalBlitzes');
    const [emailCampaigns, setEmailCampaigns] = useStickyState<EmailCampaign[]>([], 'emailCampaigns');
    const [crowleyMarkets, setCrowleyMarkets] = useStickyState<string[]>([], 'crowleyMarkets');
    const [radioSubmissions, setRadioSubmissions] = useStickyState<RadioSubmission[]>([], 'radioSubmissions');
    const [sheetsConfig, setSheetsConfig] = useStickyState<SheetsConfig>({ sheetsUrl: '' }, 'sheetsConfig');

    // State for confirmation modals
    const [confirmationModalInfo, setConfirmationModalInfo] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    
    // State for viewing a specific submission
    const [reviewingSubmission, setReviewingSubmission] = useState<RadioSubmission | null>(null);

    // State to pass data from Blitz to Email Campaign
    const [campaignDataForEmail, setCampaignDataForEmail] = useState<{ image: string | null; subject: string; body: string; } | null>(null);

    const [releaseReminderModalOpen, setReleaseReminderModalOpen] = useState(false);
    const [initialUpcomingReleases, setInitialUpcomingReleases] = useState<Music[]>([]);
    
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('form') === 'radio') {
            setIsFormView(true);
        }
    }, []);

    useEffect(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const sevenDaysFromNow = new Date(now);
        sevenDaysFromNow.setDate(now.getDate() + 7);
        
        const activeArtistIds = new Set(artists.filter(a => !a.isArchived).map(a => a.id));
        
        const upcoming = music.filter(song => {
            if (!activeArtistIds.has(song.artistId)) return false;
            if (!song.releaseDate || song.isArchived || song.hideFromDashboard) return false;
            const release = new Date(song.releaseDate + 'T00:00:00');
            return release >= now && release <= sevenDaysFromNow;
        });

        if (upcoming.length > 0) {
            setInitialUpcomingReleases(upcoming);
            setReleaseReminderModalOpen(true);
        }
    }, []); // Runs only once on app startup

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };
    
    const handleLogin = (user: string, pass: string): boolean => {
        // Simple authentication. In a real app, this would be an API call.
        if (user === 'admin' && pass === 'admin') {
            sessionStorage.setItem('controle-plus-auth', 'true');
            setIsAuthenticated(true);
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        sessionStorage.removeItem('controle-plus-auth');
        setIsAuthenticated(false);
    };

    // Derived memoized state for non-archived items
    const nonArchivedRadios = useMemo(() => radios.filter(r => !r.isArchived), [radios]);
    const nonArchivedCityHalls = useMemo(() => cityHalls.filter(c => !c.isArchived), [cityHalls]);
    const nonArchivedBusinesses = useMemo(() => businesses.filter(b => !b.isArchived), [businesses]);
    const nonArchivedArtists = useMemo(() => artists.filter(a => !a.isArchived).sort((a,b) => a.name.localeCompare(b.name)), [artists]);
    const nonArchivedMusic = useMemo(() => music.filter(m => !m.isArchived), [music]);
    const nonArchivedPromotions = useMemo(() => promotions.filter(p => !p.isArchived), [promotions]);
    const nonArchivedEvents = useMemo(() => events.filter(e => !e.isArchived).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()), [events]);
    const nonArchivedMusicalBlitzes = useMemo(() => musicalBlitzes.filter(b => !b.isArchived), [musicalBlitzes]);
    const nonArchivedEmailCampaigns = useMemo(() => emailCampaigns.filter(c => !c.isArchived).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()), [emailCampaigns]);
    
    // Derived memoized state for archived items
    const archivedRadios = useMemo(() => radios.filter(r => r.isArchived), [radios]);
    const archivedCityHalls = useMemo(() => cityHalls.filter(c => c.isArchived), [cityHalls]);
    const archivedBusinesses = useMemo(() => businesses.filter(b => b.isArchived), [businesses]);
    const archivedArtists = useMemo(() => artists.filter(a => a.isArchived), [artists]);
    const archivedMusic = useMemo(() => music.filter(m => m.isArchived), [music]);
    const archivedPromotions = useMemo(() => promotions.filter(p => p.isArchived), [promotions]);
    const archivedEvents = useMemo(() => events.filter(e => e.isArchived), [events]);
    const archivedMusicalBlitzes = useMemo(() => musicalBlitzes.filter(b => b.isArchived), [musicalBlitzes]);
    const archivedEmailCampaigns = useMemo(() => emailCampaigns.filter(c => c.isArchived), [emailCampaigns]);
    
    // Generic save handler
    const handleSave = <T extends { id: string }>(
        items: T[],
        setItems: React.Dispatch<React.SetStateAction<T[]>>,
        newItem: Omit<T, 'id'> | T
    ) => {
        if ('id' in newItem && newItem.id) {
            setItems(items.map(item => item.id === (newItem as T).id ? (newItem as T) : item));
        } else {
            const newId = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            setItems([...items, { ...newItem, id: newId } as T]);
        }
    };
    
    const handleSaveArtistAndMusic = (
        artistData: Omit<Artist, 'id' | 'createdAt'> | Artist,
        finalArtistSongs: Music[],
        musicToDeleteIds: string[]
    ) => {
        let savedArtistId: string;

        if ('id' in artistData && artistData.id) {
            savedArtistId = artistData.id;
            setArtists(prev => prev.map(a => a.id === artistData.id ? artistData as Artist : a));
        } else {
            savedArtistId = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newArtist: Artist = { 
                ...artistData, 
                id: savedArtistId, 
                createdAt: new Date().toISOString() 
            };
            setArtists(prev => [...prev, newArtist]);
        }
        
        let updatedMusic = music.filter(m => !musicToDeleteIds.includes(m.id));

        finalArtistSongs.forEach(song => {
            if (song.id.startsWith('temp-')) { // New song
                updatedMusic.push({
                    ...song,
                    id: `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    artistId: savedArtistId,
                });
            } else { // Existing song
                const index = updatedMusic.findIndex(m => m.id === song.id);
                if (index > -1) {
                    updatedMusic[index] = { ...updatedMusic[index], ...song };
                }
            }
        });
        
        setMusic(updatedMusic);
    };
    
    const handleSavePromotion = (promotionData: any) => {
        const { radioStationIds, id, ...rest } = promotionData;
        
        if (id) { // Editing
             const existingPromo = promotions.find(p => p.id === id);
             if (existingPromo) {
                const updatedPromo = { 
                    ...existingPromo, 
                    ...rest,
                    value: rest.value ? parseFloat(rest.value.replace('.', '').replace(',', '.')) : undefined,
                    radioStationId: radioStationIds[0],
                };
                 setPromotions(promotions.map(p => p.id === id ? updatedPromo : p));
             }
        } else { // Adding or Cloning
            radioStationIds.forEach((radioId: string) => {
                const newId = `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const newPromo = {
                    ...rest,
                    id: newId,
                    radioStationId: radioId,
                    value: rest.value ? parseFloat(rest.value.replace('.', '').replace(',', '.')) : undefined,
                };
                setPromotions(prev => [...prev, newPromo]);
            });
        }
    };

    const handleArchive = (id: string, type: string, name: string) => {
        const message = `Tem certeza que deseja arquivar "${name}"? O item será movido para o Arquivo.`;
        
        const confirmAction = () => {
            const archive = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
                setter(prev => prev.map(item => item.id === id ? { ...item, isArchived: true } : item));
            };
            switch(type) {
                case 'radios': archive(setRadios); break;
                case 'cityHalls': archive(setCityHalls); break;
                case 'businesses': archive(setBusinesses); break;
                case 'artists':
                    archive(setArtists);
                    // Cascade archive to artist's music
                    setMusic(prevMusic => prevMusic.map(m => m.artistId === id ? { ...m, isArchived: true } : m));
                    break;
                case 'music': archive(setMusic); break;
                case 'promotions': archive(setPromotions); break;
                case 'events': archive(setEvents); break;
                case 'blitz': archive(setMusicalBlitzes); break;
                case 'campaigns': archive(setEmailCampaigns); break;
            }
            setConfirmationModalInfo({ ...confirmationModalInfo, isOpen: false });
        };

        setConfirmationModalInfo({
            isOpen: true,
            title: 'Confirmar Arquivamento',
            message,
            onConfirm: confirmAction,
        });
    };
    
    // Generic restore handler
    const handleRestore = (id: string, setter: React.Dispatch<React.SetStateAction<any[]>>) => {
        setter(prev => prev.map(item => item.id === id ? { ...item, isArchived: false } : item));
    };

    // Generic permanent delete handler
    const handleDelete = (id: string, type: string, name: string) => {
        const confirmAction = () => {
            const remove = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
                setter(prev => prev.filter(item => item.id !== id));
            };
             switch(type) {
                case 'radios': remove(setRadios); break;
                case 'cityHalls': remove(setCityHalls); break;
                case 'businesses': remove(setBusinesses); break;
                case 'artists':
                    // Cascade delete to artist's music and other references
                    remove(setArtists);
                    setMusic(prevMusic => prevMusic.filter(m => m.artistId !== id));
                    setPromotions(prev => prev.map(p => p.artistId === id ? { ...p, artistId: '' } : p));
                    setEvents(prev => prev.map(e => ({ ...e, linkedArtistIds: (e.linkedArtistIds || []).filter(artistId => artistId !== id) })));
                    setBusinesses(prev => prev.map(b => ({ ...b, artistIds: (b.artistIds || []).filter(artistId => artistId !== id) })));
                    break;
                case 'music': remove(setMusic); break;
                case 'promotions': remove(setPromotions); break;
                case 'events': remove(setEvents); break;
                case 'blitz': remove(setMusicalBlitzes); break;
                case 'campaigns': remove(setEmailCampaigns); break;
            }
            setConfirmationModalInfo({ ...confirmationModalInfo, isOpen: false });
        };
        
        setConfirmationModalInfo({
            isOpen: true,
            title: `Excluir ${name} Permanentemente`,
            message: `Esta ação é irreversível. Todos os dados de "${name}" serão perdidos. Deseja continuar?`,
            onConfirm: confirmAction,
        });
    };
    
    const handleDeleteAllArchived = (info: { category: string, label: string, itemsCount: number }) => {
         const confirmAction = () => {
            if (info.category === 'artists') {
                const archivedArtistIds = artists.filter(a => a.isArchived).map(a => a.id);
                // Cascade delete to music of archived artists
                setMusic(prevMusic => prevMusic.filter(m => !archivedArtistIds.includes(m.artistId)));
                setPromotions(prev => prev.map(p => archivedArtistIds.includes(p.artistId) ? { ...p, artistId: '' } : p));
                setEvents(prev => prev.map(e => ({ ...e, linkedArtistIds: (e.linkedArtistIds || []).filter(id => !archivedArtistIds.includes(id)) })));
                setBusinesses(prev => prev.map(b => ({ ...b, artistIds: (b.artistIds || []).filter(id => !archivedArtistIds.includes(id)) })));
                // Delete the archived artists
                setArtists(prevArtists => prevArtists.filter(a => !a.isArchived));
            } else {
                const clearArchived = (setter: React.Dispatch<React.SetStateAction<any[]>>) => {
                    setter(prev => prev.filter(item => !item.isArchived));
                };
                 switch(info.category) {
                    case 'radios': clearArchived(setRadios); break;
                    case 'cityHalls': clearArchived(setCityHalls); break;
                    case 'businesses': clearArchived(setBusinesses); break;
                    case 'music': clearArchived(setMusic); break;
                    case 'promotions': clearArchived(setPromotions); break;
                    case 'events': clearArchived(setEvents); break;
                    case 'blitz': clearArchived(setMusicalBlitzes); break;
                    case 'campaigns': clearArchived(setEmailCampaigns); break;
                }
            }
            setConfirmationModalInfo({ ...confirmationModalInfo, isOpen: false });
        };
        
         setConfirmationModalInfo({
            isOpen: true,
            title: `Esvaziar Arquivo de ${info.label}`,
            message: `Tem certeza que deseja excluir permanentemente todos os ${info.itemsCount} itens arquivados nesta categoria? Esta ação é irreversível.`,
            onConfirm: confirmAction,
        });
    }

    // Handlers for submission review
    const handleReviewSubmission = (submission: RadioSubmission) => {
        setReviewingSubmission(submission);
    };

    const handleSaveReviewedSubmission = (station: Omit<RadioStation, 'id'> | RadioStation) => {
        handleSave(radios, setRadios, station as Omit<RadioStation, 'id'>);
        if (reviewingSubmission) {
            handleDeleteSubmission(reviewingSubmission.submissionId);
        }
        setReviewingSubmission(null);
    };

    const handleDeleteSubmission = (submissionId: string) => {
        setRadioSubmissions(prev => prev.filter(s => s.submissionId !== submissionId));
    };

    const handleToggleMusicDashboardVisibility = (musicId: string) => {
        setMusic(prev => prev.map(m => m.id === musicId ? { ...m, hideFromDashboard: !m.hideFromDashboard } : m));
    };
    
    // Navigation handlers
    const [searchTermForView, setSearchTermForView] = useState('');
    const handleNavigation = (view: ActiveView, term: string) => {
        setSearchTermForView(term);
        setActiveView(view);
    };
    useEffect(() => {
        if (searchTermForView) {
            setSearchTermForView('');
        }
    }, [activeView, searchTermForView]);

    const handleExportAndAttach = (imageDataUrl: string, subject: string, body: string) => {
        setCampaignDataForEmail({ image: imageDataUrl, subject, body });
        setActiveView('email');
    };

    // Backup and Restore
    const handleBackup = () => {
        const backupData = {
            radios, cityHalls, businesses, artists, music, promotions, events, musicalBlitzes, emailCampaigns, crowleyMarkets
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const date = new Date().toISOString().slice(0, 10);
        a.download = `controle-plus-backup-${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setIsSyncModalOpen(false);
    };

    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target?.result as string);
                        if (window.confirm('Isso substituirá todos os dados atuais. Deseja continuar?')) {
                            setRadios(data.radios || []);
                            setCityHalls(data.cityHalls || []);
                            setBusinesses(data.businesses || []);
                            setArtists(data.artists || []);
                            setMusic(data.music || []);
                            setPromotions(data.promotions || []);
                            setEvents(data.events || []);
                            setMusicalBlitzes(data.musicalBlitzes || []);
                            setEmailCampaigns(data.emailCampaigns || []);
                            setCrowleyMarkets(data.crowleyMarkets || []);
                            alert('Dados importados com sucesso!');
                            setIsSyncModalOpen(false);
                        }
                    } catch (error) {
                        alert('Erro ao ler o arquivo de backup. Ele pode estar corrompido.');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    };
    
    const [hasNewData, setHasNewData] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const lastSync = useRef(Date.now());

    useEffect(() => {
        const syncWithSheets = async () => {
            if (!sheetsConfig.sheetsUrl || isSyncing) return;
            // Debounce to run max once every 30 seconds
            if (Date.now() - lastSync.current < 30000) return;

            setIsSyncing(true);
            lastSync.current = Date.now();

            try {
                const url = new URL(sheetsConfig.sheetsUrl);
                url.searchParams.append('action', 'read');
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
                
                const response = await fetch(url.toString(), {
                    method: 'GET',
                    mode: 'cors',
                    signal: controller.signal,
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const { data: submissionsFromSheet } = await response.json();
                
                if (Array.isArray(submissionsFromSheet)) {
                    setRadioSubmissions(currentSubmissions => {
                        const existingIds = new Set(currentSubmissions.map(s => s.submissionId));
                        const newSubmissions = submissionsFromSheet.filter(s => s.submissionId && !existingIds.has(s.submissionId));
                        if (newSubmissions.length > 0) {
                            setHasNewData(true);
                            setTimeout(() => setHasNewData(false), 2000);
                            return [...currentSubmissions, ...newSubmissions];
                        }
                        return currentSubmissions;
                    });
                }
            } catch (error) {
                console.error("Erro ao sincronizar com Google Sheets:", error);
            } finally {
                setIsSyncing(false);
            }
        };

        const intervalId = setInterval(syncWithSheets, 60000); // Sync every minute
        syncWithSheets(); // Initial sync
        return () => clearInterval(intervalId);
    }, [sheetsConfig.sheetsUrl, isSyncing]);


    if (isFormView) {
        return <RadioSubmissionForm crowleyMarketsList={crowleyMarkets} />;
    }

    if (!isAuthenticated) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    const renderActiveView = () => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard 
                            stats={{
                                radios: nonArchivedRadios.length,
                                cityHalls: nonArchivedCityHalls.length,
                                businesses: nonArchivedBusinesses.length,
                                artists: nonArchivedArtists.length,
                                music: nonArchivedMusic.length,
                                promotions: nonArchivedPromotions.length,
                                events: nonArchivedEvents.length,
                                blitz: nonArchivedMusicalBlitzes.length,
                                submissions: radioSubmissions.length
                            }}
                            setActiveView={setActiveView}
                            music={nonArchivedMusic}
                            artists={nonArchivedArtists}
                        />;
            case 'radios':
                return <RadioSection 
                            stations={nonArchivedRadios} 
                            onSave={(station) => handleSave(radios, setRadios, station)}
                            onArchive={(id, type, name) => handleArchive(id, type, name)}
                            crowleyMarkets={crowleyMarkets}
                        />;
            case 'crowley-markets':
                return <CrowleyMarketsSection 
                            markets={crowleyMarkets}
                            onAdd={(market) => setCrowleyMarkets(prev => [...prev, market])}
                            onEdit={(oldMarket, newMarket) => setCrowleyMarkets(prev => prev.map(m => m === oldMarket ? newMarket : m))}
                            onDelete={(market) => setCrowleyMarkets(prev => prev.filter(m => m !== market))}
                        />;
            case 'prefeituras':
                return <CityHallSection 
                            cityHalls={nonArchivedCityHalls} 
                            onSave={(cityHall) => handleSave(cityHalls, setCityHalls, cityHall)}
                            onArchive={(id, type, name) => handleArchive(id, type, name)}
                        />;
            case 'empresarios':
                return <BusinessSection 
                            businesses={nonArchivedBusinesses} 
                            artists={nonArchivedArtists}
                            onSave={(business) => handleSave(businesses, setBusinesses, business)}
                            onArchive={(id, type, name) => handleArchive(id, type, name)}
                            onNavigateToArtist={handleNavigation}
                            initialSearchTerm={searchTermForView}
                        />;
            case 'artistas':
                return <ArtistMusicSection 
                            artists={nonArchivedArtists}
                            businesses={nonArchivedBusinesses}
                            music={nonArchivedMusic}
                            musicalBlitzes={nonArchivedMusicalBlitzes}
                            onSave={handleSaveArtistAndMusic}
                            onArchiveArtist={(id, type, name) => handleArchive(id, type, name)}
                            onToggleMusicDashboardVisibility={handleToggleMusicDashboardVisibility}
                            onNavigateToBusiness={handleNavigation}
                            initialSearchTerm={searchTermForView}
                        />;
            case 'promocoes':
                return <PromotionSection 
                            promotions={nonArchivedPromotions}
                            artists={nonArchivedArtists}
                            radioStations={nonArchivedRadios}
                            businesses={nonArchivedBusinesses}
                            music={nonArchivedMusic}
                            onSave={handleSavePromotion}
                            onArchive={(id, type, name) => handleArchive(id, type, name)}
                            crowleyMarkets={crowleyMarkets}
                        />;
            case 'eventos':
                return <EventSection 
                            events={nonArchivedEvents}
                            artists={nonArchivedArtists}
                            businesses={nonArchivedBusinesses}
                            onSave={(event) => handleSave(events, setEvents, event)}
                            onArchive={(id, type, name) => handleArchive(id, type, name)}
                        />;
            case 'blitz':
                return <MusicalBlitzSection 
                            musicalBlitzes={nonArchivedMusicalBlitzes}
                            music={nonArchivedMusic}
                            artists={nonArchivedArtists}
                            onSave={(blitz) => handleSave(musicalBlitzes, setMusicalBlitzes, blitz)}
                            onArchive={(id, type, name) => handleArchive(id, type, name)}
                            setActiveView={setActiveView}
                            onExportAndAttach={handleExportAndAttach}
                        />;
            case 'email':
                return <EmailCampaignSection 
                            campaigns={nonArchivedEmailCampaigns}
                            onSave={(campaign) => handleSave(emailCampaigns, setEmailCampaigns, { ...campaign, sentAt: new Date().toISOString() })}
                            radioStations={nonArchivedRadios}
                            cityHalls={nonArchivedCityHalls}
                            businesses={nonArchivedBusinesses}
                            crowleyMarkets={crowleyMarkets}
                            music={nonArchivedMusic}
                            artists={nonArchivedArtists}
                            attachedCampaignData={campaignDataForEmail}
                            onClearAttachedCampaignData={() => setCampaignDataForEmail(null)}
                        />;
            case 'campaign-history':
                return <CampaignHistorySection 
                            campaigns={nonArchivedEmailCampaigns}
                            radioStations={radios}
                            cityHalls={cityHalls}
                            businesses={businesses}
                            artists={artists}
                            music={music}
                            onArchive={(id, type, name) => handleArchive(id, type, name)}
                        />;
            case 'online-form':
                return <OnlineFormSection 
                            submissions={radioSubmissions}
                            onReview={handleReviewSubmission}
                            onDelete={handleDeleteSubmission}
                        />;
            case 'archive':
                return <ArchiveSection 
                            radios={archivedRadios}
                            onRestoreRadio={(id) => handleRestore(id, setRadios)}
                            onDeleteRadio={handleDelete}
                            cityHalls={archivedCityHalls}
                            onRestoreCityHall={(id) => handleRestore(id, setCityHalls)}
                            onDeleteCityHall={handleDelete}
                            businesses={archivedBusinesses}
                            onRestoreBusiness={(id) => handleRestore(id, setBusinesses)}
                            onDeleteBusiness={handleDelete}
                            artists={archivedArtists}
                            onRestoreArtist={(id) => handleRestore(id, setArtists)}
                            onDeleteArtist={handleDelete}
                            music={archivedMusic}
                            onRestoreMusic={(id) => handleRestore(id, setMusic)}
                            onDeleteMusic={handleDelete}
                            promotions={archivedPromotions}
                            onRestorePromotion={(id) => handleRestore(id, setPromotions)}
                            onDeletePromotion={handleDelete}
                            events={archivedEvents}
                            onRestoreEvent={(id) => handleRestore(id, setEvents)}
                            onDeleteEvent={handleDelete}
                            blitzes={archivedMusicalBlitzes}
                            onRestoreBlitz={(id) => handleRestore(id, setMusicalBlitzes)}
                            onDeleteBlitz={handleDelete}
                            campaigns={archivedEmailCampaigns}
                            onRestoreCampaign={(id) => handleRestore(id, setEmailCampaigns)}
                            onDeleteCampaign={handleDelete}
                            allArtists={artists}
                            allMusic={music}
                            onDeleteAll={handleDeleteAllArchived}
                        />;
            case 'configuracoes':
                return <SettingsSection 
                            sheetsConfig={sheetsConfig}
                            onSaveSheetsConfig={setSheetsConfig}
                        />;
            default:
                return <div>Página não encontrada</div>;
        }
    };

    return (
        <div className={`h-full ${theme}`}>
            <div className="h-full">
                <Sidebar 
                    activeView={activeView} 
                    setActiveView={setActiveView} 
                    theme={theme} 
                    toggleTheme={toggleTheme}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    onOpenSyncModal={() => setIsSyncModalOpen(true)}
                    onLogout={handleLogout}
                />

                <div className="md:pl-64 h-full flex flex-col">
                     <Header activeView={activeView} setIsSidebarOpen={setIsSidebarOpen} />
                    <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950">
                        {renderActiveView()}
                    </main>
                    <footer className="p-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 print-hidden">
                        Versão: 1.2.5 ({loadTime.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')})
                    </footer>
                </div>
            </div>
            
            <ConfirmationModal 
                isOpen={confirmationModalInfo.isOpen}
                onClose={() => setConfirmationModalInfo({ ...confirmationModalInfo, isOpen: false })}
                onConfirm={confirmationModalInfo.onConfirm}
                title={confirmationModalInfo.title}
            >
                <p>{confirmationModalInfo.message}</p>
            </ConfirmationModal>

            <Modal isOpen={reviewingSubmission !== null} onClose={() => setReviewingSubmission(null)} title="Revisar e Importar Rádio" size="3xl">
                {reviewingSubmission && (
                    <RadioForm
                        onSave={handleSaveReviewedSubmission}
                        onClose={() => setReviewingSubmission(null)}
                        initialData={reviewingSubmission}
                        crowleyMarketsList={crowleyMarkets}
                    />
                )}
            </Modal>
            
            <Modal isOpen={releaseReminderModalOpen} onClose={() => setReleaseReminderModalOpen(false)} title="Lembretes de Lançamentos (Próximos 7 Dias)">
                <ul className="space-y-3">
                    {initialUpcomingReleases.map(song => {
                        const artist = artists.find(a => a.id === song.artistId);
                        const status = getReleaseStatus(song.releaseDate);
                        return (
                            <li key={song.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{artist?.name} - {song.title}</p>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Lançamento em: {new Date(song.releaseDate + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                </div>
                                {status && (
                                    <span className={`mt-2 sm:mt-0 px-2.5 py-1 text-xs font-bold rounded-full ${status.className}`}>
                                        {status.text}
                                    </span>
                                )}
                            </li>
                        );
                    })}
                </ul>
                <div className="flex justify-end mt-6">
                    <button onClick={() => setReleaseReminderModalOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                        Fechar
                    </button>
                </div>
            </Modal>
            
             <SyncModal 
                isOpen={isSyncModalOpen}
                onClose={() => setIsSyncModalOpen(false)}
                onBackupLocal={handleBackup}
                onImportLocal={handleImport}
            />
        </div>
    );
};

export default App;