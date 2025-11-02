import React from 'react';
import Modal from './Modal';
import { ArchiveBoxArrowDownIcon, ArchiveBoxArrowUpIcon } from './Icons';

interface SyncModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBackupLocal: () => void;
    onImportLocal: () => void;
}

const SyncModal = ({
    isOpen,
    onClose,
    onBackupLocal,
    onImportLocal,
}: SyncModalProps) => {
    const actionButtonClass = "flex items-center justify-center gap-3 w-full px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-black/5 dark:bg-white/5 rounded-lg border border-slate-300/50 dark:border-slate-700/50 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Backup Local" size="lg">
            <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">Gerenciamento Manual</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Crie um arquivo de backup para salvar em seu computador ou importe um backup existente. Ideal para transferir dados entre dispositivos ou para segurança.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                     <button onClick={onBackupLocal} className={actionButtonClass}>
                        <ArchiveBoxArrowDownIcon className="w-5 h-5" />
                        <span>Exportar Backup</span>
                    </button>
                    <button onClick={onImportLocal} className={actionButtonClass}>
                        <ArchiveBoxArrowUpIcon className="w-5 h-5" />
                        <span>Importar Backup</span>
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default SyncModal;
