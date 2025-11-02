import React, { useState, useMemo } from 'react';
import { RadioStation, RadioType, RadioProfile } from '../types';
import { RadioIcon, TrashIcon, ArrowPathIcon } from './Icons';
import { BRAZILIAN_STATES, RADIO_PROFILES } from '../constants';
import { formatPhone, formatCnpj, formatCep } from '../utils';

interface RadioFormProps {
    onSave: (station: Omit<RadioStation, 'id'> | RadioStation) => void;
    onClose: () => void;
    initialData?: Partial<Omit<RadioStation, 'id'>> & { id?: string } | null;
    crowleyMarketsList: string[];
}

export const RadioForm = ({ onSave, onClose, initialData, crowleyMarketsList }: RadioFormProps) => {
    const getInitialState = () => {
        const defaults = {
            name: '',
            type: RadioType.FM,
            frequency: '',
            website: '',
            phone: '',
            email: '',
            street: '',
            number: '',
            complement: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            slogan: '',
            instagram: '',
            facebook: '',
            whatsapp: '',
            listenersWhatsapp: '',
            logoUrl: '',
            pixKey: '',
            cnpj: '',
            corporateName: '',
            artisticDirector: '',
            profile: RadioProfile.POPULAR,
            isCrowleyAudited: false,
            crowleyMarkets: [],
        };

        if (initialData) {
            let crowleyMarketsArray = initialData.crowleyMarkets;

            if (typeof (crowleyMarketsArray as any) === 'string' && (crowleyMarketsArray as any).length > 0) {
                crowleyMarketsArray = (crowleyMarketsArray as any).split(',').map((s: string) => s.trim()).filter(Boolean);
            } else if (!Array.isArray(crowleyMarketsArray)) {
                crowleyMarketsArray = [];
            }

            const isAudited = initialData.isCrowleyAudited === true || 
                              String(initialData.isCrowleyAudited).toLowerCase() === 'true';

            return {
                ...defaults,
                ...initialData,
                isCrowleyAudited: isAudited,
                crowleyMarkets: isAudited ? crowleyMarketsArray : [],
                website: initialData.website?.replace(/^https?:\/\//, '') || '',
                instagram: initialData.instagram?.replace(/^@/, '') || '',
                facebook: initialData.facebook?.replace(/^https?:\/\/www\.facebook\.com\//, '') || '',
            };
        }
        return defaults;
    };

    const [station, setStation] = useState(getInitialState());
    const [newMarket, setNewMarket] = useState('');

    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'radio' && name === 'isCrowleyAudited') {
            const isAudited = value === 'true';
            setStation((prev) => ({
                ...prev,
                isCrowleyAudited: isAudited,
                crowleyMarkets: isAudited ? prev.crowleyMarkets : [],
            }));
        } else {
            if (name === 'type' && value === RadioType.WEB) {
                setStation((prev) => ({ ...prev, type: value as RadioType, frequency: '' }));
            } else {
                setStation((prev) => ({ ...prev, [name]: value }));
            }
        }
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
                setStation(prev => ({ ...prev, logoUrl: loadEvent.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAddMarket = () => {
        if (newMarket.trim() && !station.crowleyMarkets?.includes(newMarket.trim())) {
          setStation(prev => ({ ...prev, crowleyMarkets: [...(prev.crowleyMarkets || []), newMarket.trim()] }));
          setNewMarket('');
        }
    };

    const handleRemoveMarket = (marketToRemove: string) => {
        setStation(prev => ({ ...prev, crowleyMarkets: (prev.crowleyMarkets || []).filter(m => m !== marketToRemove) }));
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStation(prev => ({ ...prev, [name]: formatPhone(value) }));
    };
    
    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStation(prev => ({ ...prev, [name]: formatCnpj(value) }));
    };

    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStation(prev => ({ ...prev, [name]: formatCep(value) }));
    };

    const handleFacebookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        const prefix = 'https://www.facebook.com/';
        if (value.toLowerCase().startsWith(prefix)) {
            value = value.substring(prefix.length);
        }
        setStation(prev => ({ ...prev, facebook: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(initialData && initialData.id ? { ...station, id: initialData.id } as RadioStation : station as Omit<RadioStation, 'id'>);
        onClose();
    };
    
    const renderInputField = (name: keyof typeof station, label: string, placeholder: string, required = false, type = 'text', disabled = false) => (
        <div>
            <label htmlFor={name as string} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>
            <input id={name as string} name={name as string} value={(station as any)[name] || ''} onChange={handleChange} placeholder={placeholder} className={`${formFieldClass} ${disabled ? 'bg-slate-100 dark:bg-slate-800 cursor-not-allowed' : ''}`} required={required} type={type} disabled={disabled} />
        </div>
    );
    
    const availableMarkets = useMemo(() => {
        return crowleyMarketsList.filter(market => !(station.crowleyMarkets || []).includes(market));
    }, [crowleyMarketsList, station.crowleyMarkets]);
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Column 1: Main Info, Address, Corporate */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2 mb-4">Informações da Emissora</h3>
                        <div className="space-y-4">
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="lg:col-span-2">{renderInputField('name', 'Nome da Rádio', 'Ex: Rádio Jovem Pan', true)}</div>
                                 <div>
                                    <label htmlFor="type" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                                    <select id="type" name="type" value={station.type} onChange={handleChange} className={formFieldClass}>
                                        {Object.values(RadioType).map((type) => (<option key={type} value={type}>{type}</option>))}
                                    </select>
                                </div>
                            </div>
                            {station.type !== RadioType.WEB && (
                                <div className="max-w-xs">{renderInputField('frequency', 'Frequência', 'Ex: 100.9 MHz')}</div>
                            )}
                        </div>
                    </section>
                    
                    <section>
                        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2 mb-4">Endereço</h3>
                        <div className="space-y-4">
                             <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                                <div className="lg:col-span-4">{renderInputField('street', 'Rua', 'Ex: Av. Paulista', true)}</div>
                                <div className="lg:col-span-2">{renderInputField('number', 'Número', 'Ex: 807', true)}</div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {renderInputField('complement', 'Complemento', 'Ex: Andar 24, Sala 10')}
                                {renderInputField('neighborhood', 'Bairro', 'Ex: Bela Vista', true)}
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
                                <div className="lg:col-span-3">{renderInputField('city', 'Cidade', 'Ex: São Paulo', true)}</div>
                                <div className="lg:col-span-2">
                                    <label htmlFor="state" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
                                    <select id="state" name="state" value={station.state} onChange={handleChange} className={formFieldClass} required>
                                        <option value="">UF</option>
                                        {BRAZILIAN_STATES.map((state) => (<option key={state.uf} value={state.uf}>{state.name}</option>))}
                                    </select>
                                </div>
                                <div className="lg:col-span-1">
                                    <label htmlFor="zipCode" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CEP</label>
                                    <div className="relative">
                                        <input id="zipCode" name="zipCode" value={station.zipCode} onChange={handleCepChange} placeholder="00000-000" className={formFieldClass} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                    
                    <section>
                         <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2 mb-4">Corporativo</h3>
                        <div className="space-y-4">
                            {renderInputField('corporateName', 'Razão Social', 'Ex: Rádio e TV Jovem Pan S.A.')}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="cnpj" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ</label>
                                    <input id="cnpj" name="cnpj" value={station.cnpj} onChange={handleCnpjChange} placeholder="00.000.000/0000-00" className={formFieldClass} />
                                </div>
                                {renderInputField('pixKey', 'Chave PIX', 'Ex: financeiro@radio.com.br')}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Column 2: Contact, Media, Artistic, Audience */}
                <div className="space-y-6">
                    <section>
                        <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2 mb-4">Contato e Mídia</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone Comercial</label>
                                    <input id="phone" name="phone" value={station.phone || ''} onChange={handlePhoneChange} placeholder="(00) 0000-0000" className={formFieldClass} />
                                </div>
                                <div>
                                    <label htmlFor="whatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp (Comercial)</label>
                                    <input id="whatsapp" name="whatsapp" value={station.whatsapp || ''} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className={formFieldClass} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="listenersWhatsapp" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">WhatsApp (Ouvintes)</label>
                                <input id="listenersWhatsapp" name="listenersWhatsapp" value={station.listenersWhatsapp || ''} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className={formFieldClass} />
                            </div>
                            {renderInputField('email', 'E-mail', 'contato@radio.com.br', false, 'email')}
                            <div>
                                <label htmlFor="website" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
                                <div className="relative rounded-lg shadow-sm">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400 sm:text-sm">https://</span>
                                    <input id="website" name="website" value={station.website || ''} onChange={handleChange} placeholder="www.site.com.br" className={`${formFieldClass} pl-16`} />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="instagram" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Instagram</label>
                                    <div className="relative rounded-lg shadow-sm">
                                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400 sm:text-sm">@</span>
                                        <input id="instagram" name="instagram" value={station.instagram || ''} onChange={handleChange} placeholder="usuario" className={`${formFieldClass} pl-7`} />
                                    </div>
                                </div>
                                {renderInputField('slogan', 'Slogan', 'O slogan da rádio')}
                            </div>
                            <div>
                                <label htmlFor="facebook" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Facebook</label>
                                <div className="flex rounded-lg shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">facebook.com/</span>
                                    <input id="facebook" name="facebook" value={station.facebook || ''} onChange={handleFacebookChange} placeholder="pagina" className={`${formFieldClass} rounded-l-none flex-1`} />
                                </div>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Logo da Rádio</label>
                                <div className="mt-1 flex items-center gap-4">
                                    {station.logoUrl ? 
                                        <img src={station.logoUrl} alt="Preview" className="h-16 w-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-700" /> :
                                        <div className="h-16 w-16 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center"><RadioIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" /></div>
                                    }
                                    <input type="file" id="logo" name="logo" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" className="block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 dark:file:bg-slate-700 dark:file:text-slate-300 dark:hover:file:bg-slate-600"/>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recomendado: imagem quadrada, menor que 2MB.</p>
                            </div>
                        </div>
                    </section>
                    
                    <section>
                         <h3 className="text-lg font-medium leading-6 text-slate-900 dark:text-white border-b border-slate-300/50 dark:border-slate-700/50 pb-2 mb-4">Informações Artísticas e de Audiência</h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {renderInputField('artisticDirector', 'Diretor(a) Artístico(a)', 'Nome do diretor')}
                                <div>
                                    <label htmlFor="profile" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Perfil da Emissora</label>
                                    <select id="profile" name="profile" value={station.profile} onChange={handleChange} className={formFieldClass}>
                                        {RADIO_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Auditada pela Crowley?</label>
                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center"><input type="radio" name="isCrowleyAudited" value="true" checked={station.isCrowleyAudited === true} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" /> <span className="ml-2 text-sm">Sim</span></label>
                                    <label className="flex items-center"><input type="radio" name="isCrowleyAudited" value="false" checked={station.isCrowleyAudited === false} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" /> <span className="ml-2 text-sm">Não</span></label>
                                </div>
                            </div>

                            {station.isCrowleyAudited && (
                                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                    <h4 className="text-md font-medium text-slate-800 dark:text-slate-200 mb-3">Praças Auditadas</h4>
                                    {station.crowleyMarkets && station.crowleyMarkets.length > 0 && (
                                        <ul className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                                            {station.crowleyMarkets.map(market => (
                                                <li key={market} className="flex justify-between items-center text-sm bg-white dark:bg-slate-700/80 p-2 rounded-lg">
                                                    <span>{market}</span>
                                                    <button type="button" onClick={() => handleRemoveMarket(market)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <select value={newMarket} onChange={e => setNewMarket(e.target.value)} className={formFieldClass}>
                                            <option value="">Selecione para adicionar</option>
                                            {availableMarkets.map(market => <option key={market} value={market}>{market}</option>)}
                                        </select>
                                        <button type="button" onClick={handleAddMarket} disabled={!newMarket} className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600">Adicionar</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-300/50 dark:border-slate-700/50 mt-6">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 dark:text-slate-300 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Salvar Rádio</button>
            </div>
        </form>
    );
};