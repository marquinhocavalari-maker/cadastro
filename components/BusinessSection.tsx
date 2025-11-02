


import React, { useState, useMemo, useEffect } from 'react';
import { Business, Artist, ActiveView } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, BriefcaseIcon, WhatsAppIcon, XMarkIcon, MapPinIcon, EmailIcon, WebsiteIcon, InstagramIcon, FacebookIcon, UserIcon, EyeIcon } from './Icons';
import { BRAZILIAN_STATES, BUSINESS_CATEGORIES, DDD_REGIONS } from '../constants';
import { normalizeString, formatPhone, formatCep, createWhatsAppLink } from '../utils';

const BusinessForm = ({
    onSave,
    onClose,
    initialData,
    artists,
}: {
    onSave: (business: Omit<Business, 'id'> | Business) => void;
    onClose: () => void;
    initialData?: Business | null;
    artists: Artist[];
}) => {
    const getInitialState = () => {
        if (initialData) {
            return {
                ...initialData,
                website: initialData.website?.replace(/^https?:\/\//, '') || '',
                instagram: initialData.instagram?.replace(/^@/, '') || '',
                facebook: initialData.facebook?.replace(/^https?:\/\/www\.facebook\.com\//, '') || '',
                artistIds: initialData.artistIds || [],
            };
        }
        return {
            name: '',
            category: BUSINESS_CATEGORIES[0],
            contactPerson: '',
            phone: '',
            email: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            whatsapp: '',
            website: '',
            instagram: '',
            facebook: '',
            regionsOfOperation: [],
            artistIds: [],
        };
    };
    
    const [business, setBusiness] = useState(getInitialState());
    const [selectedDdd, setSelectedDdd] = useState('');
    const [selectedArtistId, setSelectedArtistId] = useState('');

    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";
    
    const artistMap = useMemo(() => new Map(artists.map(a => [a.id, a.name])), [artists]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setBusiness((prev) => ({ ...prev, [name]: value }));
    };
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBusiness(prev => ({ ...prev, [name]: formatPhone(value) }));
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBusiness(prev => ({ ...prev, [name]: formatCep(value) }));
    };
    
    const handleFacebookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        const prefix = 'https://www.facebook.com/';
        if (value.toLowerCase().startsWith(prefix)) {
            value = value.substring(prefix.length);
        }
        setBusiness(prev => ({ ...prev, facebook: value }));
    };

    const handleAddRegion = () => {
        if (selectedDdd && !business.regionsOfOperation?.includes(selectedDdd)) {
            setBusiness(prev => ({
                ...prev,
                regionsOfOperation: [...(prev.regionsOfOperation || []), selectedDdd]
            }));
            setSelectedDdd('');
        }
    };

    const handleRemoveRegion = (ddd: string) => {
        setBusiness(prev => ({
            ...prev,
            regionsOfOperation: (prev.regionsOfOperation || []).filter(r => r !== ddd)
        }));
    };

    const handleAddArtist = () => {
        if (selectedArtistId && !(business.artistIds || []).includes(selectedArtistId)) {
            setBusiness(prev => ({ ...prev, artistIds: [...(prev.artistIds || []), selectedArtistId]}));
            setSelectedArtistId('');
        }
    };
    
    const handleRemoveArtist = (artistId: string) => {
        setBusiness(prev => ({ ...prev, artistIds: (prev.artistIds || []).filter(id => id !== artistId)}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(initialData ? { ...business, id: initialData.id } : business);
        onClose();
    };

    const renderInputField = (name: keyof Omit<Business, 'id'|'phone'|'whatsapp'|'website'|'instagram'|'facebook'|'zipCode'|'state'|'category'| 'regionsOfOperation' | 'artistIds'>, label: string, placeholder: string, required = false, type = 'text') => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <input id={name} name={name} value={business[name] || ''} onChange={handleChange} placeholder={placeholder} type={type} className={formFieldClass} required={required} />
        </div>
    );
    
    const availableDdds = useMemo(() => {
        return Object.keys(DDD_REGIONS).filter(ddd => !business.regionsOfOperation?.includes(ddd));
    }, [business.regionsOfOperation]);

    const availableArtists = useMemo(() => {
        return artists.filter(a => !(business.artistIds || []).includes(a.id));
    }, [artists, business.artistIds]);

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Informações da Empresa</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInputField('name', 'Nome da Empresa/Negócio', 'Ex: ShowTime Produções', true)}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoria</label>
                            <select id="category" name="category" value={business.category} onChange={handleChange} className={formFieldClass}>
                                {BUSINESS_CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">{renderInputField('contactPerson', 'Pessoa de Contato', 'Nome do responsável')}</div>
                    </div>

                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <h4 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-3">Artistas Vinculados</h4>
                        {(business.artistIds || []).length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {(business.artistIds || []).map(artistId => (
                                    <div key={artistId} className="flex items-center bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-sm font-medium px-2.5 py-1 rounded-full">
                                        {artistMap.get(artistId) || 'Artista desconhecido'}
                                        <button type="button" onClick={() => handleRemoveArtist(artistId)} className="ml-1.5 -mr-1 p-0.5 rounded-full hover:bg-red-200 dark:hover:bg-red-700">
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <select value={selectedArtistId} onChange={e => setSelectedArtistId(e.target.value)} className={formFieldClass}>
                                <option value="">Selecione um artista</option>
                                {availableArtists.map(artist => <option key={artist.id} value={artist.id}>{artist.name}</option>)}
                            </select>
                            <button type="button" onClick={handleAddArtist} disabled={!selectedArtistId} className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">Adicionar</button>
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Endereço</h3>
                     <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                         <div className="md:col-span-4">{renderInputField('street', 'Rua', 'Ex: Av. Paulista', true)}</div>
                         <div className="md:col-span-2">{renderInputField('number', 'Número', 'Ex: 807', true)}</div>
                         <div className="md:col-span-3">{renderInputField('complement', 'Complemento', 'Ex: Andar 24, Sala 10')}</div>
                         <div className="md:col-span-3">{renderInputField('neighborhood', 'Bairro', 'Ex: Bela Vista', true)}</div>
                         <div className="md:col-span-3">{renderInputField('city', 'Cidade', 'Ex: São Paulo', true)}</div>
                         <div className="md:col-span-2">
                             <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                             <select id="state" name="state" value={business.state} onChange={handleChange} className={formFieldClass} required>
                                <option value="">Selecione</option>
                                {BRAZILIAN_STATES.map((state) => (<option key={state.uf} value={state.uf}>{state.name}</option>))}
                            </select>
                         </div>
                         <div className="md:col-span-1">
                            <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CEP</label>
                            <input id="zipCode" name="zipCode" value={business.zipCode} onChange={handleCepChange} placeholder="00000-000" className={formFieldClass} />
                         </div>
                    </div>
                     <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Região de Atuação</h3>
                     <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        {business.regionsOfOperation && business.regionsOfOperation.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                                {business.regionsOfOperation.map(ddd => {
                                    const region = DDD_REGIONS[ddd];
                                    const mapUrl = `https://www.google.com/maps/@${region.lat},${region.lng},8z`;
                                    return (
                                    <div key={ddd} className="flex items-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-sm font-medium px-2.5 py-1 rounded-full">
                                        <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline" title={`Principais cidades: ${region.cities.join(', ')}`}>
                                            <MapPinIcon className="w-4 h-4" />
                                            DDD {ddd}
                                        </a>
                                        <button type="button" onClick={() => handleRemoveRegion(ddd)} className="ml-1.5 -mr-1 p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-700">
                                            <XMarkIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                    )
                                })}
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <select value={selectedDdd} onChange={e => setSelectedDdd(e.target.value)} className={formFieldClass}>
                                <option value="">Selecione um DDD</option>
                                {availableDdds.map(ddd => <option key={ddd} value={ddd}>DDD {ddd} ({DDD_REGIONS[ddd].state}) - {DDD_REGIONS[ddd].cities[0]}</option>)}
                            </select>
                            <button type="button" onClick={handleAddRegion} disabled={!selectedDdd} className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">Adicionar</button>
                        </div>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Contato e Mídia</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone Comercial</label>
                            <input id="phone" name="phone" value={business.phone} onChange={handlePhoneChange} placeholder="(00) 0000-0000" className={formFieldClass} />
                        </div>
                        <div>
                            <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
                            <input id="whatsapp" name="whatsapp" value={business.whatsapp} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className={formFieldClass} />
                        </div>
                        {renderInputField('email', 'E-mail', 'contato@email.com', false, 'email')}
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                             <div className="relative rounded-lg shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 dark:text-slate-400 sm:text-sm">https://</span>
                                </div>
                                <input id="website" name="website" value={business.website || ''} onChange={handleChange} placeholder="www.site.com.br" className={`${formFieldClass} pl-16`} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="instagram" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instagram</label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 dark:text-slate-400 sm:text-sm">@</span>
                                </div>
                                <input id="instagram" name="instagram" value={business.instagram || ''} onChange={handleChange} placeholder="usuario" className={`${formFieldClass} pl-7`} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="facebook" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Facebook</label>
                            <div className="flex rounded-lg shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                                https://www.facebook.com/
                                </span>
                                <input id="facebook" name="facebook" value={business.facebook || ''} onChange={handleFacebookChange} placeholder="pagina" className={`${formFieldClass} rounded-l-none flex-1`} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-300/50 dark:border-slate-700/50 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Salvar Contato</button>
            </div>
        </form>
    );
};

const BusinessDetailView = ({ business, artists, onEdit, onNavigateToArtist }: { business: Business; artists: Artist[]; onEdit: () => void; onNavigateToArtist: (view: ActiveView, term: string) => void; }) => {
    const contactLinks = [
        { href: createWhatsAppLink(business.whatsapp), icon: WhatsAppIcon, text: business.whatsapp, condition: business.whatsapp },
        { href: `mailto:${business.email}`, icon: EmailIcon, text: business.email, condition: business.email },
        { href: `https://${business.website}`, icon: WebsiteIcon, text: business.website, condition: business.website },
        { href: `https://www.instagram.com/${business.instagram}`, icon: InstagramIcon, text: `@${business.instagram}`, condition: business.instagram },
        { href: `https://www.facebook.com/${business.facebook}`, icon: FacebookIcon, text: `/${business.facebook}`, condition: business.facebook },
    ];
    
    const linkedArtists = useMemo(() => {
        if (!business.artistIds || business.artistIds.length === 0) return [];
        return artists.filter(a => (business.artistIds || []).includes(a.id));
    }, [business.artistIds, artists]);

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-grow space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{business.name}</h3>
                    <p className="text-md text-slate-500 dark:text-slate-400">{business.category}</p>
                    <p className="text-md text-slate-500 dark:text-slate-400 mt-1">Contato: {business.contactPerson}</p>
                </div>
                
                {linkedArtists.length > 0 && (
                     <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Artistas Vinculados</h4>
                        <ul className="list-disc list-inside">
                            {linkedArtists.map(artist => (
                                <li key={artist.id}>
                                    <button onClick={() => onNavigateToArtist('artistas', artist.name)} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                      {artist.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <div className="space-y-3">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Contato</h4>
                    <ul className="space-y-2">
                        {contactLinks.map(({ href, icon: Icon, text, condition }) =>
                            condition && (
                                <li key={href} className="flex items-center">
                                    <Icon className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline break-all">{text}</a>
                                </li>
                            )
                        )}
                    </ul>
                </div>

                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                    <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Endereço</h4>
                    <p>{business.street}, {business.number}</p>
                    {business.complement && <p>{business.complement}</p>}
                    <p>{business.neighborhood}</p>
                    <p>{business.city}, {business.state} - {business.zipCode}</p>
                </div>
                
                 {business.regionsOfOperation && business.regionsOfOperation.length > 0 && (
                    <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Regiões de Atuação</h4>
                        <div className="flex flex-wrap gap-2">
                            {business.regionsOfOperation.map(ddd => {
                                const region = DDD_REGIONS[ddd];
                                const mapUrl = `https://www.google.com/maps/@${region.lat},${region.lng},8z`;
                                return (
                                <a key={ddd} href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-sm font-medium px-2.5 py-1 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-800" title={`Principais cidades: ${region.cities.join(', ')}`}>
                                    <MapPinIcon className="w-4 h-4 mr-1" />
                                    DDD {ddd}
                                </a>
                                )
                            })}
                        </div>
                    </div>
                 )}
            </div>

            <div className="md:w-1/4 flex-shrink-0 flex flex-col items-center space-y-4">
                <div className="w-32 h-32 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md">
                    <BriefcaseIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                </div>
                <button onClick={onEdit} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <PencilIcon className="w-4 h-4" />
                    <span>Editar Cadastro</span>
                </button>
            </div>
        </div>
    );
};

interface BusinessSectionProps {
    businesses: Business[];
    artists: Artist[];
    onSave: (business: Omit<Business, 'id'> | Business) => void;
    onArchive: (id: string, type: string, name: string) => void;
    onNavigateToArtist: (view: ActiveView, term: string) => void;
    initialSearchTerm?: string;
}

const BusinessSection = ({ businesses, artists, onSave, onArchive, onNavigateToArtist, initialSearchTerm }: BusinessSectionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
    const [viewingBusiness, setViewingBusiness] = useState<Business | null>(null);
    const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');

    useEffect(() => {
        // Only update the search term if a NEW initial term is provided.
        // This prevents the term from being cleared when the parent component re-renders.
        if (initialSearchTerm) {
            setSearchTerm(initialSearchTerm);
        }
    }, [initialSearchTerm]);

    const artistMap = useMemo(() => new Map(artists.map(a => [a.id, a.name])), [artists]);

    const handleEdit = (business: Business) => {
        setEditingBusiness(business);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingBusiness(null);
        setIsModalOpen(true);
    };

    const filteredBusinesses = useMemo(() => {
        const normalizedSearch = normalizeString(searchTerm);
        if (!normalizedSearch) return businesses;
        return businesses.filter(business => 
            normalizeString(business.name).includes(normalizedSearch) ||
            normalizeString(business.contactPerson).includes(normalizedSearch) ||
            normalizeString(business.city).includes(normalizedSearch) ||
            (business.artistIds || []).some(id => normalizeString(artistMap.get(id)).includes(normalizedSearch)) ||
            (business.regionsOfOperation || []).some(ddd => ddd.includes(normalizedSearch))
        );
    }, [businesses, searchTerm, artistMap]);
    
    const getCategoryTagColor = (category: string | undefined) => {
        switch (category) {
            case "Promotor de Eventos": return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200';
            case "Casa de Shows": return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200';
            case "Empresário": return 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200';
            case "Gestor Artístico": return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200';
            case "Divulgador": return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
            case "Empresário Artístico": return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
            default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
        }
    };

    const noResults = (
        <div className="text-center py-16 px-4">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Nenhum contato encontrado</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tente ajustar os filtros ou adicione um novo contato.</p>
            <button onClick={openAddModal} className="mt-6 flex mx-auto items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                <PlusIcon className="w-5 h-5"/>
                <span>Adicionar Contato</span>
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Empresários e Negócios ({businesses.length})</h1>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                     <input
                        type="text"
                        placeholder="Buscar por nome, artista, cidade ou DDD..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full sm:w-64 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <button onClick={openAddModal} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Novo Contato</span>
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Mobile Card View */}
                <div className="md:hidden">
                    {filteredBusinesses.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                            {filteredBusinesses.map(business => (
                                <li key={business.id} className="p-4">
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setViewingBusiness(business)}>
                                            <div className="flex-shrink-0 h-10 w-10">
                                                <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                    <BriefcaseIcon className="w-6 h-6 text-slate-400" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{business.name}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{business.contactPerson}</p>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">{business.city}, {business.state}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                             <button onClick={() => handleEdit(business)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"><PencilIcon /></button>
                                             <button onClick={() => onArchive(business.id, 'businesses', business.name)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg"><TrashIcon /></button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : ( noResults )}
                </div>
                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block">
                    {filteredBusinesses.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-100 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Empresa</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Contato</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Localização</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Artistas</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">WhatsApp</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Categoria</th>
                                    <th scope="col" className="relative px-4 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredBusinesses.map(business => {
                                    const linkedArtists = (business.artistIds || []).map(id => artistMap.get(id)).filter(Boolean);
                                    return (
                                    <tr key={business.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setViewingBusiness(business)}>
                                                {business.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 dark:text-slate-300">{business.contactPerson || '-'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 dark:text-slate-300">{`${business.city}, ${business.state}`}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 dark:text-slate-300 max-w-xs truncate" title={linkedArtists.join(', ')}>
                                            {linkedArtists.length > 0 ? linkedArtists.join(', ') : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            {business.whatsapp ? (
                                                <a href={createWhatsAppLink(business.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline flex items-center gap-1.5">
                                                    <WhatsAppIcon className="w-4 h-4" />
                                                    {business.whatsapp}
                                                </a>
                                            ) : (business.phone || '-')}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryTagColor(business.category)}`}>
                                                {business.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleEdit(business)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"><PencilIcon /></button>
                                                <button onClick={() => onArchive(business.id, 'businesses', business.name)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" title="Arquivar"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    ) : ( noResults )}
                </div>
            </div>


            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBusiness ? 'Editar Contato' : 'Adicionar Novo Contato'} size="3xl">
                <BusinessForm onSave={onSave} onClose={() => setIsModalOpen(false)} initialData={editingBusiness} artists={artists} />
            </Modal>
             <Modal isOpen={!!viewingBusiness} onClose={() => setViewingBusiness(null)} title="Detalhes do Contato" size="3xl">
                 {viewingBusiness && (
                    <BusinessDetailView 
                        business={viewingBusiness}
                        artists={artists}
                        onEdit={() => {
                            const businessToEdit = viewingBusiness;
                            setViewingBusiness(null);
                            handleEdit(businessToEdit);
                        }}
                        onNavigateToArtist={(view, term) => {
                            setViewingBusiness(null);
                            onNavigateToArtist(view, term);
                        }}
                    />
                )}
            </Modal>
        </div>
    );
};

export default BusinessSection;