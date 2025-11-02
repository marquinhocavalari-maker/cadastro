import React, { useState, useMemo, useEffect } from 'react';
import { RadioStation, RadioType, RadioProfile } from '../types';
import { BRAZILIAN_STATES, RADIO_PROFILES } from '../constants';
import { LogoIcon, RadioIcon, TrashIcon, XMarkIcon, ArrowPathIcon } from './Icons';

const formatPhone = (value: string): string => {
    if (!value) return '';
    let phoneNumber = value.replace(/[^\d]/g, '');
    if (phoneNumber.length > 11) phoneNumber = phoneNumber.slice(0, 11);
    if (phoneNumber.length > 10) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7)}`;
    if (phoneNumber.length > 6) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
    if (phoneNumber.length > 2) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    if (phoneNumber.length > 0) return `(${phoneNumber}`;
    return '';
};

const formatCnpj = (value: string): string => {
    if (!value) return '';
    const cnpj = value.replace(/[^\d]/g, '').slice(0, 14);
    if (cnpj.length <= 2) return cnpj;
    if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
    if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
    if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
    return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
};

const formatCep = (value: string): string => {
    if (!value) return '';
    const cep = value.replace(/[^\d]/g, '').slice(0, 8);
    if (cep.length > 5) return `${cep.slice(0, 5)}-${cep.slice(5)}`;
    return cep;
};

interface RadioSubmissionFormProps {
    crowleyMarketsList: string[];
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

const RadioSubmissionForm = ({ crowleyMarketsList }: RadioSubmissionFormProps) => {
    const [status, setStatus] = useState<SubmissionStatus>('idle');
    const [error, setError] = useState('');
    const [sheetsUrl, setSheetsUrl] = useState('');
    const [station, setStation] = useState(() => ({
        name: '', type: RadioType.FM, frequency: '', website: '', phone: '', email: '',
        street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
        zipCode: '', slogan: '', instagram: '', facebook: '', whatsapp: '', listenersWhatsapp: '',
        pixKey: '', cnpj: '', corporateName: '',
        artisticDirector: '', profile: RadioProfile.POPULAR, isCrowleyAudited: false,
        crowleyMarkets: [] as string[],
    }));
    const [newMarket, setNewMarket] = useState('');

    useEffect(() => {
        // Force light theme for the public form view
        const html = document.documentElement;
        const wasDark = html.classList.contains('dark');
        html.classList.remove('dark');

        // Read sheetsUrl from query params
        const urlParams = new URLSearchParams(window.location.search);
        const urlFromQuery = urlParams.get('sheetsUrl');
        if (urlFromQuery) {
            setSheetsUrl(decodeURIComponent(urlFromQuery));
        }

        // Cleanup function to restore theme if the component were to unmount
        return () => {
            if (wasDark) {
                html.classList.add('dark');
            }
        }
    }, []);

    const formFieldClass = "block w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-sm shadow-sm placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'radio' && name === 'isCrowleyAudited') {
            const isAudited = value === 'true';
            setStation(prev => ({ ...prev, isCrowleyAudited: isAudited, crowleyMarkets: isAudited ? prev.crowleyMarkets : [] }));
        } else if (name === 'type' && value === RadioType.WEB) {
            setStation(prev => ({ ...prev, type: value as RadioType, frequency: '' }));
        } else {
            setStation(prev => ({ ...prev, [name]: value }));
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
    
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => setStation(p => ({ ...p, [e.target.name]: formatPhone(e.target.value) }));
    const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => setStation(p => ({ ...p, [e.target.name]: formatCnpj(e.target.value) }));
    const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => setStation(p => ({ ...p, [e.target.name]: formatCep(e.target.value) }));
    
    const handleFacebookChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/^https?:\/\/www\.facebook\.com\//, '');
        setStation(prev => ({ ...prev, facebook: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sheetsUrl) {
            setStatus('error');
            setError('Este formulário não está configurado para receber respostas. Por favor, contate o administrador do site.');
            return;
        }

        setStatus('submitting');
        setError('');

        const submissionData = { ...station, crowleyMarkets: station.isCrowleyAudited ? station.crowleyMarkets : [] };

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

            // The original form submission used 'no-cors' which always succeeds on the client-side
            // even if the server returns an error. By changing to 'cors' and checking `response.ok`,
            // we get a real confirmation of success. This requires the Google Apps Script to be
            // configured to handle CORS requests.
            const response = await fetch(sheetsUrl, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'text/plain' },
                redirect: 'follow',
                body: JSON.stringify(submissionData),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`O servidor respondeu com um erro: ${response.statusText} (${response.status}). Verifique a configuração de CORS no seu Google Apps Script.`);
            }

            setStatus('success');

        } catch (err: any) {
            console.error("Submission failed on client-side:", err);
            setStatus('error');
            if (err.name === 'AbortError') {
                setError('O envio demorou muito para responder. Verifique sua conexão e a URL de configuração do Google Sheets.');
            } else {
                setError(`Ocorreu um erro ao tentar enviar os dados. Isso pode ser um problema de rede ou uma configuração incorreta do servidor (CORS). Detalhes: ${err.message}`);
            }
        }
    };
    
    const availableMarkets = useMemo(() => {
        return crowleyMarketsList.filter(market => !(station.crowleyMarkets || []).includes(market));
    }, [crowleyMarketsList, station.crowleyMarkets]);
    
    const renderInputField = (name: keyof typeof station, label: string, placeholder: string, required = false, type = 'text') => (
        <div>
            <label htmlFor={name as string} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
            <input id={name as string} name={name as string} value={(station as any)[name] || ''} onChange={handleChange} placeholder={placeholder} className={formFieldClass} required={required} type={type} />
        </div>
    );

    if (status === 'submitting' || status === 'success' || status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-2xl text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl">
                    {status === 'submitting' && <>
                        <ArrowPathIcon className="mx-auto h-12 w-12 text-indigo-500 animate-spin" />
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mt-4">Enviando...</h1>
                    </>}
                    {status === 'success' && <>
                        <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">Cadastro Enviado!</h1>
                        <p className="text-lg text-gray-700 dark:text-gray-300">Seus dados foram enviados para processamento. Obrigado!</p>
                    </>}
                    {status === 'error' && <>
                        <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Falha no Envio</h1>
                        <p className="text-lg text-gray-700 dark:text-gray-300">{error}</p>
                        <button onClick={() => setStatus('idle')} className="mt-6 px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                            Tentar Novamente
                        </button>
                    </>}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto">
                <header className="text-center mb-8">
                     <LogoIcon className="h-12 w-12 text-indigo-500 mx-auto" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Cadastro de Emissora</h1>
                    <p className="text-md text-gray-600 dark:text-gray-400 mt-2">Preencha o formulário abaixo com os dados da sua rádio.</p>
                </header>

                <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl shadow-2xl space-y-8">
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Column 1: Main Info, Address, Corporate */}
                        <div className="space-y-6">
                            <section>
                                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Informações da Emissora</h3>
                                <div className="space-y-4">
                                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                        <div className="lg:col-span-2">{renderInputField('name', 'Nome da Rádio', 'Ex: Rádio Jovem Pan', true)}</div>
                                         <div>
                                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
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
                                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Endereço</h3>
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
                                            <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
                                            <select id="state" name="state" value={station.state} onChange={handleChange} className={formFieldClass} required>
                                                <option value="">UF</option>
                                                {BRAZILIAN_STATES.map((state) => (<option key={state.uf} value={state.uf}>{state.name}</option>))}
                                            </select>
                                        </div>
                                        <div className="lg:col-span-1">
                                            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CEP</label>
                                            <input id="zipCode" name="zipCode" value={station.zipCode} onChange={handleCepChange} placeholder="CEP" className={formFieldClass} />
                                        </div>
                                    </div>
                                </div>
                            </section>
                            
                            <section>
                                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Corporativo</h3>
                                <div className="space-y-4">
                                    {renderInputField('corporateName', 'Razão Social', 'Ex: Rádio e TV Jovem Pan S.A.')}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CNPJ</label>
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
                                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Contato e Mídia</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone Comercial</label>
                                            <input id="phone" name="phone" value={station.phone || ''} onChange={handlePhoneChange} placeholder="(00) 0000-0000" className={formFieldClass} />
                                        </div>
                                        <div>
                                            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp (Comercial)</label>
                                            <input id="whatsapp" name="whatsapp" value={station.whatsapp || ''} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className={formFieldClass} />
                                        </div>
                                    </div>
                                    <div>
                                        <label htmlFor="listenersWhatsapp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">WhatsApp (Ouvintes)</label>
                                        <input id="listenersWhatsapp" name="listenersWhatsapp" value={station.listenersWhatsapp || ''} onChange={handlePhoneChange} placeholder="(00) 00000-0000" className={formFieldClass} />
                                    </div>
                                    {renderInputField('email', 'E-mail', 'contato@radio.com.br', false, 'email')}
                                    <div>
                                        <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                                        <div className="relative rounded-lg shadow-sm">
                                            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm">https://</span>
                                            <input id="website" name="website" value={station.website || ''} onChange={handleChange} placeholder="www.site.com.br" className={`${formFieldClass} pl-16`} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400 sm:text-sm">@</span>
                                                <input id="instagram" name="instagram" value={station.instagram || ''} onChange={handleChange} placeholder="usuario" className={`${formFieldClass} pl-7`} />
                                            </div>
                                        </div>
                                        {renderInputField('slogan', 'Slogan', 'O slogan da rádio')}
                                    </div>
                                    <div>
                                        <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
                                        <div className="flex rounded-lg shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-gray-500 text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400">facebook.com/</span>
                                            <input id="facebook" name="facebook" value={station.facebook || ''} onChange={handleFacebookChange} placeholder="pagina" className={`${formFieldClass} rounded-l-none flex-1`} />
                                        </div>
                                    </div>
                                </div>
                            </section>
                            
                            <section>
                                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">Informações Artísticas e de Audiência</h3>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {renderInputField('artisticDirector', 'Diretor(a) Artístico(a)', 'Nome do diretor')}
                                        <div>
                                            <label htmlFor="profile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Perfil da Emissora</label>
                                            <select id="profile" name="profile" value={station.profile} onChange={handleChange} className={formFieldClass}>
                                                {RADIO_PROFILES.map(p => <option key={p} value={p}>{p}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Auditada pela Crowley?</label>
                                        <div className="flex items-center space-x-4">
                                            <label className="flex items-center"><input type="radio" name="isCrowleyAudited" value="true" checked={station.isCrowleyAudited === true} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /> <span className="ml-2 text-sm">Sim</span></label>
                                            <label className="flex items-center"><input type="radio" name="isCrowleyAudited" value="false" checked={station.isCrowleyAudited === false} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" /> <span className="ml-2 text-sm">Não</span></label>
                                        </div>
                                    </div>

                                    {station.isCrowleyAudited && (
                                        <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-800/50">
                                            <h4 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-3">Praças Auditadas</h4>
                                            {station.crowleyMarkets && station.crowleyMarkets.length > 0 && (
                                                <ul className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                                                    {station.crowleyMarkets.map(market => (
                                                        <li key={market} className="flex justify-between items-center text-sm bg-slate-100 dark:bg-slate-700/80 p-2 rounded-lg">
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
                                                <button type="button" onClick={handleAddMarket} disabled={!newMarket} className="flex-shrink-0 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 dark:disabled:bg-gray-600">Adicionar</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                    <div className="flex justify-end pt-6 border-t border-slate-200 dark:border-slate-800">
                        <button type="submit" className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Enviar Cadastro</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RadioSubmissionForm;