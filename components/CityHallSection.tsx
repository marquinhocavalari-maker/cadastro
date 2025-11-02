import React, { useState, useMemo } from 'react';
import { CityHall } from '../types';
import Modal from './Modal';
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon, WhatsAppIcon, EmailIcon, WebsiteIcon, InstagramIcon, FacebookIcon } from './Icons';
import { BRAZILIAN_STATES } from '../constants';
import { normalizeString, formatPhone, formatCep, createWhatsAppLink } from '../utils';

const CityHallForm = ({
    onSave,
    onClose,
    initialData,
}: {
    onSave: (cityHall: Omit<CityHall, 'id'> | CityHall) => void;
    onClose: () => void;
    initialData?: CityHall | null;
}) => {
    const getInitialState = () => {
        if (initialData) {
             return {
                ...initialData,
                website: initialData.website?.replace(/^https?:\/\//, '') || '',
                instagram: initialData.instagram?.replace(/^@/, '') || '',
                facebook: initialData.facebook?.replace(/^https?:\/\/www\.facebook\.com\//, '') || '',
            };
        }
        return {
            cityName: '',
            state: '',
            mayor: '',
            website: '',
            phone: '',
            whatsapp: '',
            email: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            zipCode: '',
            instagram: '',
            facebook: '',
            logoUrl: '',
        };
    };
    const [cityHall, setCityHall] = useState(getInitialState());

    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCityHall((prev) => ({ ...prev, [name]: value }));
    };
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCityHall(prev => ({ ...prev, [name]: formatPhone(value) }));
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCityHall(prev => ({ ...prev, [name]: formatCep(value) }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
             if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('O arquivo de imagem é muito grande. Por favor, escolha um arquivo menor que 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                setCityHall(prev => ({ ...prev, logoUrl: loadEvent.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleFacebookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        const prefix = 'https://www.facebook.com/';
        if (value.toLowerCase().startsWith(prefix)) {
            value = value.substring(prefix.length);
        }
        setCityHall(prev => ({ ...prev, facebook: value }));
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(initialData ? { ...cityHall, id: initialData.id } : cityHall);
        onClose();
    };

    const renderInputField = (name: keyof Omit<CityHall, 'id' | 'phone' | 'website' | 'whatsapp' | 'email' | 'zipCode'| 'instagram'|'facebook'|'logoUrl'|'state' >, label: string, placeholder: string, required = false, type = 'text') => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <input id={name} name={name} value={cityHall[name] || ''} onChange={handleChange} placeholder={placeholder} className={formFieldClass} required={required} type={type} />
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Informações Gerais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderInputField('cityName', 'Nome da Cidade', 'Ex: Rio de Janeiro', true)}
                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                            <select id="state" name="state" value={cityHall.state} onChange={handleChange} className={formFieldClass} required>
                                <option value="">Selecione o Estado</option>
                                {BRAZILIAN_STATES.map((state) => (
                                    <option key={state.uf} value={state.uf}>{state.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">{renderInputField('mayor', 'Nome do Prefeito(a)', 'Nome completo')}</div>
                    </div>
                    
                    <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Endereço da Prefeitura</h3>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div className="md:col-span-4">{renderInputField('street', 'Rua', 'Ex: Av. Principal', true)}</div>
                        <div className="md:col-span-2">{renderInputField('number', 'Número', 'Ex: 123', true)}</div>
                        <div className="md:col-span-3">{renderInputField('complement', 'Complemento', 'Ex: Bloco A, Sala 1')}</div>
                        <div className="md:col-span-3">{renderInputField('neighborhood', 'Bairro', 'Ex: Centro', true)}</div>
                         <div className="md:col-span-full">
                            <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CEP</label>
                            <input id="zipCode" name="zipCode" value={cityHall.zipCode} onChange={handleCepChange} placeholder="00000-000" className={formFieldClass} />
                         </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2">Contato e Mídia</h3>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
                            <input id="phone" name="phone" value={cityHall.phone || ''} onChange={handlePhoneChange} placeholder="(00) 0000-0000" className={formFieldClass} />
                        </div>
                        <div>
                            <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp</label>
                            <input id="whatsapp" name="whatsapp" value={cityHall.whatsapp || ''} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className={formFieldClass} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                            <input id="email" name="email" type="email" value={cityHall.email || ''} onChange={handleChange} placeholder="contato@prefeitura.gov.br" className={formFieldClass} />
                        </div>
                         <div>
                            <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                             <div className="relative rounded-lg shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 dark:text-slate-400 sm:text-sm">https://</span>
                                </div>
                                <input id="website" name="website" value={cityHall.website || ''} onChange={handleChange} placeholder="www.site.gov.br" className={`${formFieldClass} pl-16`} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="instagram" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instagram</label>
                            <div className="relative rounded-lg shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <span className="text-slate-500 dark:text-slate-400 sm:text-sm">@</span>
                                </div>
                                <input id="instagram" name="instagram" value={cityHall.instagram || ''} onChange={handleChange} placeholder="usuario" className={`${formFieldClass} pl-7`} />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="facebook" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Facebook</label>
                            <div className="flex rounded-lg shadow-sm">
                                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm dark:bg-slate-800 dark:border-slate-600/50 dark:text-slate-400">
                                https://www.facebook.com/
                                </span>
                                <input id="facebook" name="facebook" value={cityHall.facebook || ''} onChange={handleFacebookChange} placeholder="pagina" className={`${formFieldClass} rounded-l-none flex-1`} />
                            </div>
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brasão / Logo</label>
                        <div className="mt-1 flex items-center gap-4">
                            {cityHall.logoUrl ? 
                                <img src={cityHall.logoUrl} alt="Preview" className="h-16 w-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-700" /> :
                                <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><BuildingOfficeIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" /></div>
                            }
                            <input type="file" id="logo" name="logo" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 dark:file:bg-slate-700 dark:file:text-slate-300 dark:hover:file:bg-slate-600"/>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recomendado: imagem quadrada, menor que 2MB.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-300/50 dark:border-slate-700/50 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Salvar Prefeitura</button>
            </div>
        </form>
    );
};

const CityHallDetailView = ({ cityHall, onEdit }: { cityHall: CityHall; onEdit: () => void; }) => {
    const contactLinks = [
        { href: createWhatsAppLink(cityHall.whatsapp), icon: WhatsAppIcon, text: cityHall.whatsapp, condition: cityHall.whatsapp },
        { href: `mailto:${cityHall.email}`, icon: EmailIcon, text: cityHall.email, condition: cityHall.email },
        { href: `https://${cityHall.website}`, icon: WebsiteIcon, text: cityHall.website, condition: cityHall.website },
        { href: `https://www.instagram.com/${cityHall.instagram}`, icon: InstagramIcon, text: `@${cityHall.instagram}`, condition: cityHall.instagram },
        { href: `https://www.facebook.com/${cityHall.facebook}`, icon: FacebookIcon, text: `/${cityHall.facebook}`, condition: cityHall.facebook },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-grow space-y-6">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Prefeitura de {cityHall.cityName}</h3>
                    <p className="text-md text-slate-500 dark:text-slate-400">Prefeito(a): {cityHall.mayor}</p>
                </div>
                
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
                    <p>{cityHall.street}, {cityHall.number}</p>
                    {cityHall.complement && <p>{cityHall.complement}</p>}
                    <p>{cityHall.neighborhood}</p>
                    <p>{cityHall.cityName}, {cityHall.state} - {cityHall.zipCode}</p>
                </div>
            </div>

            <div className="md:w-1/4 flex-shrink-0 flex flex-col items-center space-y-4">
                {cityHall.logoUrl ? (
                    <img src={cityHall.logoUrl} alt={`${cityHall.cityName} logo`} className="w-32 h-32 rounded-xl object-cover bg-slate-100 dark:bg-slate-700 shadow-md" />
                ) : (
                    <div className="w-32 h-32 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center shadow-md">
                        <BuildingOfficeIcon className="w-16 h-16 text-slate-400 dark:text-slate-500" />
                    </div>
                )}
                <button onClick={onEdit} className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    <PencilIcon className="w-4 h-4" />
                    <span>Editar Cadastro</span>
                </button>
            </div>
        </div>
    );
};

interface CityHallSectionProps {
    cityHalls: CityHall[];
    onSave: (cityHall: Omit<CityHall, 'id'> | CityHall) => void;
    onArchive: (id: string, type: string, name: string) => void;
}

const CityHallSection = ({ cityHalls, onSave, onArchive }: CityHallSectionProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCityHall, setEditingCityHall] = useState<CityHall | null>(null);
    const [viewingCityHall, setViewingCityHall] = useState<CityHall | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const handleEdit = (cityHall: CityHall) => {
        setEditingCityHall(cityHall);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setEditingCityHall(null);
        setIsModalOpen(true);
    };

    const filteredCityHalls = useMemo(() => {
        const normalizedSearch = normalizeString(searchTerm);
        if (!normalizedSearch) return cityHalls;

        return cityHalls.filter(cityHall => 
            normalizeString(cityHall.cityName).includes(normalizedSearch) ||
            normalizeString(cityHall.mayor).includes(normalizedSearch)
        );
    }, [cityHalls, searchTerm]);

    const noResults = (
        <div className="text-center py-16 px-4">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
            <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">Nenhuma prefeitura encontrada</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Tente ajustar os filtros ou adicione uma nova prefeitura.</p>
            <button onClick={openAddModal} className="mt-6 flex mx-auto items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                <PlusIcon className="w-5 h-5"/>
                <span>Adicionar Prefeitura</span>
            </button>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Prefeituras ({cityHalls.length})</h1>
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="Buscar por cidade ou prefeito..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full sm:w-64 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                    <button onClick={openAddModal} className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                        <PlusIcon className="w-5 h-5"/>
                        <span className="hidden sm:inline">Nova Prefeitura</span>
                    </button>
                </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 shadow-xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
                {/* Mobile Card View */}
                <div className="md:hidden">
                    {filteredCityHalls.length > 0 ? (
                        <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                            {filteredCityHalls.map(cityHall => (
                                <li key={cityHall.id} className="p-4">
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => setViewingCityHall(cityHall)}>
                                             <div className="flex-shrink-0 h-10 w-10">
                                                {cityHall.logoUrl ? (
                                                    <img className="h-10 w-10 rounded-full object-cover" src={cityHall.logoUrl} alt={`${cityHall.cityName} logo`} />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                                        <BuildingOfficeIcon className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">{`${cityHall.cityName}, ${cityHall.state}`}</p>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{cityHall.mayor}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                             <button onClick={() => handleEdit(cityHall)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg"><PencilIcon /></button>
                                             <button onClick={() => onArchive(cityHall.id, 'cityHalls', `Prefeitura de ${cityHall.cityName}`)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg"><TrashIcon /></button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        noResults
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="overflow-x-auto hidden md:block">
                    {filteredCityHalls.length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                            <thead className="bg-slate-100 dark:bg-slate-800/50">
                                <tr>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Cidade/UF</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Prefeito(a)</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">WhatsApp</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">E-mail</th>
                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Website</th>
                                    <th scope="col" className="relative px-4 py-3"><span className="sr-only">Ações</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-transparent divide-y divide-slate-200 dark:divide-slate-800">
                                {filteredCityHalls.map(cityHall => (
                                     <tr key={cityHall.id} className="hover:bg-slate-100 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => setViewingCityHall(cityHall)}>
                                                {`${cityHall.cityName}, ${cityHall.state}`}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-800 dark:text-slate-300">{cityHall.mayor || '-'}</td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            {cityHall.whatsapp ? (
                                                <a href={createWhatsAppLink(cityHall.whatsapp)} target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 hover:underline flex items-center gap-1.5">
                                                    <WhatsAppIcon className="w-4 h-4" />
                                                    {cityHall.whatsapp}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            {cityHall.email ? (
                                                <a href={`mailto:${cityHall.email}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                    {cityHall.email}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-xs">
                                            {cityHall.website ? (
                                                <a href={`https://${cityHall.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                                                    {cityHall.website}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button onClick={() => handleEdit(cityHall)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"><PencilIcon /></button>
                                                <button onClick={() => onArchive(cityHall.id, 'cityHalls', `Prefeitura de ${cityHall.cityName}`)} className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500" title="Arquivar"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        noResults
                    )}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCityHall ? 'Editar Prefeitura' : 'Adicionar Nova Prefeitura'} size="3xl">
                <CityHallForm onSave={onSave} onClose={() => setIsModalOpen(false)} initialData={editingCityHall} />
            </Modal>
             <Modal isOpen={!!viewingCityHall} onClose={() => setViewingCityHall(null)} title="Detalhes da Prefeitura" size="2xl">
                 {viewingCityHall && (
                    <CityHallDetailView 
                        cityHall={viewingCityHall} 
                        onEdit={() => {
                            const hallToEdit = viewingCityHall;
                            setViewingCityHall(null);
                            handleEdit(hallToEdit);
                        }} 
                    />
                )}
            </Modal>
        </div>
    );
};

export default CityHallSection;