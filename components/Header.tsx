

import React from 'react';
import { MenuIcon } from './Icons';
import { ActiveView } from '../types';

interface HeaderProps {
    activeView: ActiveView;
    setIsSidebarOpen: (isOpen: boolean) => void;
}

const viewTitles: Record<ActiveView, string> = {
    dashboard: 'Dashboard',
    radios: 'Rádios',
    'crowley-markets': 'Praças Crowley',
    prefeituras: 'Prefeituras',
    empresarios: 'Empresários e Negócios',
    artistas: 'Artistas e Músicas',
    promocoes: 'Promoções',
    eventos: 'Eventos',
    blitz: 'Lançamentos e Blitz',
    email: 'E-mail Marketing',
    'campaign-history': 'Campanhas',
    'online-form': 'Formulário Web',
    archive: 'Arquivo',
    'configuracoes': 'Configurações',
};

const Header = ({ activeView, setIsSidebarOpen }: HeaderProps) => {
    return (
        <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 print-hidden">
            <button type="button" className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 md:hidden" onClick={() => setIsSidebarOpen(true)}>
                <span className="sr-only">Open sidebar</span>
                <MenuIcon className="h-6 w-6" />
            </button>
            {/* Separator */}
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 md:hidden" aria-hidden="true" />
            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
                 <h1 className="text-xl my-auto font-semibold text-slate-900 dark:text-white">{viewTitles[activeView]}</h1>
            </div>
        </header>
    );
};

export default Header;