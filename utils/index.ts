import { Music } from "../types";
import { DDD_REGIONS } from '../constants';

export const toTitleCase = (str: any): string => {
  if (!str) return '';
  const smallWords = /^(a|e|o|da|de|do|das|dos|em|um|uma)$/i;
  return String(str)
    .toLowerCase()
    .split(' ')
    .map((word, index) => (index === 0 || !smallWords.test(word)) ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(' ');
};

export const toLowerCaseSafe = (str: any): string => {
  if (!str) return '';
  return String(str).toLowerCase().trim();
};

export const capitalizeFirstLetter = (str: any): string => {
    if (!str) return '';
    const trimmed = String(str).trim();
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

export const normalizeString = (str: any): string => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()|[\]]/g, " ")
    .replace(/\s+/g, ' ')
    .trim();
};

export const formatPhone = (value: string): string => {
    if (!value) return '';
    let phoneNumber = value.replace(/[^\d]/g, '');
    
    if (phoneNumber.length > 11) {
        phoneNumber = phoneNumber.slice(0, 11);
    }
    
    if (phoneNumber.length > 10) { 
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
    } else if (phoneNumber.length > 6) { 
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
    } else if (phoneNumber.length > 2) {
        return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    } else if (phoneNumber.length > 0) {
        return `(${phoneNumber}`;
    }
    return '';
};

export const formatCnpj = (value: string): string => {
    if (!value) return '';
    const cnpj = value.replace(/[^\d]/g, '').slice(0, 14);

    if (cnpj.length <= 2) return cnpj;
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
};

export const formatCep = (value: string): string => {
    if (!value) return '';
    const cep = value.replace(/[^\d]/g, '').slice(0, 8);
    if (cep.length > 5) {
        return `${cep.slice(0, 5)}-${cep.slice(5)}`;
    }
    return cep;
};

export const createWhatsAppLink = (phone: string | undefined) => {
    if (!phone) return '#';
    const digits = `55${phone.replace(/[^\d]/g, '')}`;
    return `https://wa.me/${digits}`;
};

export const getReleaseStatus = (releaseDate?: string) => {
    if (!releaseDate) return null;

    const now = new Date();
    now.setHours(0, 0, 0, 0); 
    const release = new Date(releaseDate + 'T00:00:00');

    if (release < now) {
        return { text: "Lançado", className: "bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300", days: null };
    }

    const diffTime = release.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const dayText = diffDays === 1 ? 'dia' : 'dias';

    if (diffDays <= 15) {
        return { text: `Faltam ${diffDays} ${dayText}`, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", days: diffDays };
    }
    if (diffDays <= 30) {
        return { text: `Faltam ${diffDays} ${dayText}`, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", days: diffDays };
    }
    return { text: `Faltam ${diffDays} ${dayText}`, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", days: diffDays };
};

export const getExpirationStatus = (releaseDate?: string) => {
    if (!releaseDate) return null;

    const release = new Date(releaseDate + 'T00:00:00');
    const expiration = new Date(release);
    expiration.setDate(release.getDate() + 90);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const diffTime = expiration.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return { text: "Vencido", className: "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300", days: diffDays };
    }
    
    const dayText = diffDays === 1 ? 'dia' : 'dias';
    
    if (diffDays === 0) {
         return { text: `Vence hoje`, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", days: diffDays };
    }
    if (diffDays <= 30) {
        return { text: `Vence em ${diffDays} ${dayText}`, className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", days: diffDays };
    }
    if (diffDays <= 60) {
        return { text: `Vence em ${diffDays} ${dayText}`, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", days: diffDays };
    }
    return { text: `Vence em ${diffDays} ${dayText}`, className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", days: diffDays };
};


export const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const getDddInfo = (phone?: string): { ddd: string; region: string } | null => {
  if (!phone) return null;
  const dddMatch = phone.match(/\((\d{2})\)/);
  const ddd = dddMatch ? dddMatch[1] : null;

  if (ddd && DDD_REGIONS[ddd]) {
    const regionInfo = DDD_REGIONS[ddd];
    return {
      ddd,
      region: regionInfo.cities[0],
    };
  }
  return null;
};