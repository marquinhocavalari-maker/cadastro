import React, { useState } from 'react';
import { SheetsConfig } from '../types';

interface SettingsSectionProps {
    sheetsConfig: SheetsConfig;
    onSaveSheetsConfig: (config: SheetsConfig) => void;
}

const SettingsSection = ({
    sheetsConfig, onSaveSheetsConfig
}: SettingsSectionProps) => {
    const [currentSheetsUrl, setCurrentSheetsUrl] = useState(sheetsConfig.sheetsUrl || '');
    
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved'>('idle');
    const [copied, setCopied] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSaveSheetsConfig({ sheetsUrl: currentSheetsUrl });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
    };
    
    const formUrl = `${window.location.origin}${window.location.pathname}?form=radio${currentSheetsUrl ? `&sheetsUrl=${encodeURIComponent(currentSheetsUrl)}` : ''}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(formUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isSheetsConfigured = !!currentSheetsUrl;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Configurações</h1>
            <form onSubmit={handleSave} className="max-w-2xl space-y-8">
                
                {/* Panel for Sheets */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Formulário Web e Google Sheets</h2>
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${isSheetsConfigured ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                            {isSheetsConfigured ? 'Configurado' : 'Pendente'}
                        </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                        Configure a integração para receber novos cadastros de rádios automaticamente.
                    </p>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link do Formulário Público</label>
                            <div className="flex items-stretch gap-2">
                                <input type="text" readOnly value={formUrl} className="flex-grow block w-full px-3 py-2 bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm cursor-default" />
                                <button type="button" onClick={handleCopy} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">{copied ? 'Copiado!' : 'Copiar'}</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">URL de Integração do App da Web</label>
                            <input type="url" value={currentSheetsUrl} onChange={(e) => setCurrentSheetsUrl(e.target.value)} placeholder="Cole a URL do App da Web aqui" className="block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-sm" />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end items-center gap-4">
                    {saveStatus === 'saved' && <span className="text-sm text-green-600 dark:text-green-400">Configurações salvas!</span>}
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">Salvar Configurações</button>
                </div>
            </form>
        </div>
    );
};

export default SettingsSection;
