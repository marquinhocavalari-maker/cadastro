import React from 'react';
import { ActiveView } from '../types';
import { RadioIcon, BuildingOfficeIcon, BriefcaseIcon, LogoIcon, DocumentTextIcon, DashboardIcon, EmailIcon, UserIcon, MegaphoneIcon, LinkIcon, ArchiveBoxIcon, XMarkIcon, MapPinIcon, CloudArrowDownIcon, CalendarDaysIcon, BoltIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from './Icons';
import ThemeSwitcher from './ThemeSwitcher';

interface SidebarProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    onOpenSyncModal: () => void;
    onLogout: () => void;
}

const Sidebar = ({ activeView, setActiveView, theme, toggleTheme, isSidebarOpen, setIsSidebarOpen, onOpenSyncModal, onLogout }: SidebarProps) => {
    const navItems: any[] = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
        { type: 'divider' },
        { id: 'radios', label: 'Rádios', icon: <RadioIcon /> },
        { id: 'artistas', label: 'Artistas', icon: <UserIcon /> },
        { id: 'crowley-markets', label: 'Praças Crowley', icon: <MapPinIcon /> },
        { id: 'prefeituras', label: 'Prefeituras', icon: <BuildingOfficeIcon /> },
        { id: 'empresarios', label: 'Empresários', icon: <BriefcaseIcon /> },
        { type: 'divider' },
        { id: 'promocoes', label: 'Promoções', icon: <MegaphoneIcon /> },
        { id: 'eventos', label: 'Eventos', icon: <CalendarDaysIcon /> },
        { id: 'blitz', label: 'Lançamentos e Blitz', icon: <BoltIcon /> },
        { id: 'email', label: 'E-mail Marketing', icon: <EmailIcon /> },
        { id: 'campaign-history', label: 'Campanhas', icon: <ArchiveBoxIcon /> },
        { type: 'divider' },
        { id: 'online-form', label: 'Formulário Web', icon: <LinkIcon /> },
        { id: 'configuracoes', label: 'Configurações', icon: <Cog6ToothIcon /> },
        { id: 'sync', label: 'Backup', icon: <CloudArrowDownIcon />, action: onOpenSyncModal, customClass: 'uppercase text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500' },
        { id: 'archive', label: 'Arquivo', icon: <ArchiveBoxIcon /> },
        { type: 'divider' },
        { id: 'logout', label: 'Sair', icon: <ArrowRightOnRectangleIcon />, action: onLogout, customClass: 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500' },
    ];
    
    const sidebarContent = (
        <>
            <div className="flex h-16 shrink-0 items-center px-4 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => {
                        setActiveView('dashboard');
                        setIsSidebarOpen(false);
                    }}
                    className="flex items-center space-x-3 group w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-slate-900 rounded-lg p-2 -m-2"
                >
                    <LogoIcon className="h-9 w-9 text-indigo-500 transition-transform duration-300 group-hover:rotate-12" />
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
                        CONTROLE+
                    </h1>
                </button>
            </div>
            <nav className="flex flex-1 flex-col px-4 py-4">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                        <ul role="list" className="-mx-2 space-y-1">
                           {navItems.map((item, index) => (
                                item.type === 'divider' ?
                                <hr key={`divider-${index}`} className="border-slate-200 dark:border-slate-800 my-2" /> :
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            if (item.action) {
                                                item.action();
                                            } else {
                                                setActiveView(item.id as ActiveView);
                                            }
                                            setIsSidebarOpen(false); // Close sidebar on mobile
                                        }}
                                        className={`group flex gap-x-3 rounded-lg p-2.5 text-sm leading-6 font-semibold w-full transition-colors duration-150 ${
                                            activeView === item.id
                                                ? 'bg-slate-200 dark:bg-slate-800 text-indigo-800 dark:text-white shadow-sm'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                                        } ${item.customClass || ''}`}
                                    >
                                        {React.cloneElement(item.icon as React.ReactElement<{ className?: string }>, { className: 'h-6 w-6 shrink-0' })}
                                        {item.label}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </li>
                    <li className="mt-auto -mx-2">
                        <div className="space-y-1 p-2 border-t border-slate-200 dark:border-slate-800">
                            <div className="flex justify-center pt-2">
                                <ThemeSwitcher theme={theme} toggleTheme={toggleTheme} />
                            </div>
                        </div>
                    </li>
                </ul>
            </nav>
        </>
    );

    return (
        <aside className="print-hidden">
            {/* Mobile sidebar */}
            <div className={`relative z-50 md:hidden ${isSidebarOpen ? '' : 'pointer-events-none'}`}>
                 <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-linear ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsSidebarOpen(false)} />
                <div className="fixed inset-0 flex">
                    <div className={`relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                            <button type="button" className="-m-2.5 p-2.5" onClick={() => setIsSidebarOpen(false)}>
                                <span className="sr-only">Close sidebar</span>
                                <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-100 dark:bg-slate-900">
                           {sidebarContent}
                        </div>
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:fixed md:inset-y-0 md:z-50 md:flex md:w-64 md:flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
                    {sidebarContent}
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;