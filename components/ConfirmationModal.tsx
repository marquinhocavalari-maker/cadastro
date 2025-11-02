import React, { ReactNode } from 'react';
import Modal from './Modal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children, confirmText, cancelText, confirmButtonClass }: ConfirmationModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      <div className="space-y-6">
        <div className="text-gray-600 dark:text-gray-400">
          {children}
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 transition-colors"
          >
            {cancelText || 'Cancelar'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${confirmButtonClass || 'bg-red-600 hover:bg-red-700'}`}
          >
            {confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationModal;