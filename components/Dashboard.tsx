import React, { useMemo } from 'react';
import { RadioIcon, BuildingOfficeIcon, BriefcaseIcon, UserIcon, MegaphoneIcon, EmailIcon, CalendarDaysIcon, BoltIcon, LinkIcon } from './Icons';
import { ActiveView, Music, Artist } from '../types';
import { getReleaseStatus } from '../utils';

interface ReleaseRemindersProps {
    music: Music[];
    artists: Artist[];
    setActiveView: (view: ActiveView) => void;
}

const ReleaseReminders = ({ music, artists, setActiveView }: ReleaseRemindersProps) => {
    const artistMap = useMemo(() => new Map(artists.map(a => [a.id, a.name])), [artists]);

    const upcomingReleases = useMemo(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const oneDay = 24 * 60 * 60 * 1000;

        return music
            .filter(song => {
                if (!artistMap.has(song.artistId)) return false;
                if (!song.releaseDate || song.isArchived || song.hideFromDashboard) return false;
                const release = new Date(song.releaseDate + 'T00:00:00');
                const diffTime = release.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / oneDay);
                return diffDays >= 0 && diffDays <= 30;
            })
            .sort((a, b) => new Date(a.releaseDate!).getTime() - new Date(b.releaseDate!).getTime());
    }, [music, artistMap]);

    if (upcomingReleases.length === 0) {
        return null;
    }

    return (
        <div className="mb-10">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Lembretes de Lançamentos (Próximos 30 dias)</h2>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg rounded-2xl p-4">
                <ul className="space-y-3">
                    {upcomingReleases.map(song => {
                        const status = getReleaseStatus(song.releaseDate);
                        const artistName = artistMap.get(song.artistId) || 'Artista Desconhecido';
                        return (
                            <li key={song.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white dark:bg-slate-800/50 rounded-lg">
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">{artistName} - {song.title}</p>
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
                <button 
                    onClick={() => setActiveView('artistas')} 
                    className="mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                    Ver todos os artistas e músicas &rarr;
                </button>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number | string; color: string }) => (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-all duration-300 group-hover:border-slate-300 dark:group-hover:border-slate-700 group-hover:scale-105 h-full">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    </div>
);

const ShortcutCard = ({ icon, title, color }: { icon: React.ReactNode; title: string; color: string }) => (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-lg flex items-center space-x-4 transition-all duration-300 group-hover:border-slate-300 dark:group-hover:border-slate-700 group-hover:scale-105 h-full">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{title}</p>
        </div>
    </div>
);

interface DashboardProps {
    stats: {
        radios: number;
        cityHalls: number;
        businesses: number;
        artists: number;
        music: number;
        promotions: number;
        events: number;
        blitz: number;
        submissions: number;
    };
    setActiveView: (view: ActiveView) => void;
    music: Music[];
    artists: Artist[];
}

const Dashboard = ({ stats, setActiveView, music, artists }: DashboardProps) => {
    const cardData = [
        { view: 'radios', icon: <RadioIcon className="w-7 h-7 text-white"/>, title: "Rádios Cadastradas", value: stats.radios, color: "bg-blue-600" },
        { view: 'prefeituras', icon: <BuildingOfficeIcon className="w-7 h-7 text-white"/>, title: "Prefeituras Cadastradas", value: stats.cityHalls, color: "bg-green-600" },
        { view: 'empresarios', icon: <BriefcaseIcon className="w-7 h-7 text-white"/>, title: "Empresários e Negócios", value: stats.businesses, color: "bg-purple-600" },
        { view: 'artistas', icon: <UserIcon className="w-7 h-7 text-white"/>, title: "Artistas", value: stats.artists, color: "bg-red-600" },
        { view: 'promocoes', icon: <MegaphoneIcon className="w-7 h-7 text-white"/>, title: "Promoções Ativas", value: stats.promotions, color: "bg-pink-600" },
        { view: 'eventos', icon: <CalendarDaysIcon className="w-7 h-7 text-white"/>, title: "Eventos", value: stats.events, color: "bg-orange-500" },
        { view: 'blitz', icon: <BoltIcon className="w-7 h-7 text-white"/>, title: "Lançamentos e Blitz", value: stats.blitz, color: "bg-teal-500" },
    ];
    
    const analysisCard = {
        view: 'online-form',
        icon: <LinkIcon className="w-7 h-7 text-white"/>,
        title: "Rádios para Análise",
        value: stats.submissions,
        color: stats.submissions > 0 ? "bg-red-600" : "bg-green-600"
    };


    const shortcutData = [
      { view: 'email', icon: <EmailIcon className="w-7 h-7 text-white" />, title: "E-mail Marketing", color: "bg-teal-600" },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Dashboard</h1>

            <ReleaseReminders music={music} artists={artists} setActiveView={setActiveView} />
            
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Resumo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <button 
                        onClick={() => setActiveView(analysisCard.view as ActiveView)}
                        className="text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-black rounded-2xl"
                    >
                        <StatCard 
                            icon={analysisCard.icon}
                            title={analysisCard.title}
                            value={analysisCard.value}
                            color={analysisCard.color}
                        />
                    </button>
                     {cardData.map((card) => (
                        <button 
                            key={card.view}
                            onClick={() => setActiveView(card.view as ActiveView)}
                            className="text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-black rounded-2xl"
                        >
                            <StatCard 
                                icon={card.icon} 
                                title={card.title} 
                                value={card.value}
                                color={card.color}
                            />
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="mb-10">
                <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">Atalhos</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shortcutData.map((card) => (
                         <button 
                            key={card.view}
                            onClick={() => setActiveView(card.view as ActiveView)}
                            className="text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-black rounded-2xl"
                        >
                            <ShortcutCard 
                                icon={card.icon}
                                title={card.title}
                                color={card.color}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-lg">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Bem-vindo ao seu Gerenciador de Contatos!</h2>
                <p className="text-slate-700 dark:text-slate-300">
                    Utilize o menu à esquerda para navegar entre as seções. Você pode adicionar, editar e remover contatos, além de gerenciar artistas, músicas, promoções, gerar relatórios detalhados e enviar campanhas de e-mail.
                </p>
                <p className="text-slate-700 dark:text-slate-300 mt-2">
                    Todos os dados inseridos são salvos automaticamente no seu navegador. Lembre-se de usar a função de <strong>backup</strong> regularmente para garantir a segurança das suas informações.
                </p>
            </div>
        </div>
    );
};

export default Dashboard;