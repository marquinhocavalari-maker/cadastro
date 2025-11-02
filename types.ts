


export enum RadioType {
  FM = 'FM',
  AM = 'AM',
  WEB = 'WEB',
  COMUNITARIA = 'Comunitária',
}

export enum RadioProfile {
  POPULAR = 'Popular',
  SERTANEJO = 'Sertanejo',
  POPROCK = 'Pop/Rock',
  EVANGELICA = 'Evangélica',
  JORNALISMO = 'Jornalismo',
  OUTRO = 'Outro',
}

export interface RadioStation {
  id: string;
  name: string;
  type: RadioType;
  frequency: string;
  website: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  slogan?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  listenersWhatsapp?: string;
  logoUrl?: string;
  pixKey?: string;
  cnpj?: string;
  corporateName?: string;
  email?: string;
  artisticDirector?: string;
  profile?: RadioProfile;
  isCrowleyAudited?: boolean;
  crowleyMarkets?: string[];
  isArchived?: boolean;
}

export interface RadioSubmission extends Omit<RadioStation, 'id'> {
  submissionId: string;
}

export interface CityHall {
  id: string;
  cityName: string;
  state: string;
  mayor: string;
  website: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  zipCode: string;
  email?: string;
  whatsapp?: string;
  instagram?: string;
  facebook?: string;
  logoUrl?: string;
  isArchived?: boolean;
}

export interface Business {
  id: string;
  name: string;
  category: string;
  contactPerson: string;
  phone: string;
  email: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  whatsapp?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  regionsOfOperation?: string[];
  isArchived?: boolean;
  artistIds?: string[];
}

export interface BrazilianState {
  name: string;
  uf: string;
}

export enum MusicGenre {
  SERTANEJO = 'Sertanejo',
  PAGODE = 'Pagode',
  SAMBA = 'Samba',
  ROCK = 'Rock',
  POP = 'Pop',
  MPB = 'MPB',
  FUNK = 'Funk',
  AXE = 'Axé',
  FORRO = 'Forró',
  ELETRONICA = 'Eletrônica',
  OUTRO = 'Outro'
}

export interface Artist {
    id: string;
    name: string;
    genre: MusicGenre;
    createdAt: string;
    isArchived?: boolean;
    businessId?: string;
    bio?: string;
}

export interface Music {
    id: string;
    title: string;
    artistId: string;
    wavUrl?: string;
    createdAt: string;
    composers?: string;
    releaseDate?: string;
    isArchived?: boolean;
    hideFromDashboard?: boolean;
}

export enum PromotionType {
    VERBA = 'Verba',
    BRINDES = 'Brindes',
    PARCERIA_SHOW = 'Parceria de Show',
    DIVULGACAO = 'Divulgação',
    OUTRO = 'Outro'
}

export interface Promotion {
    id: string;
    name: string;
    radioStationId: string;
    artistId: string;
    musicId?: string;
    type: PromotionType;
    details: string;
    startDate: string;
    endDate: string;
    isArchived?: boolean;
    value?: number;
}

// FIX: Renamed 'Event' to 'AppEvent' to avoid conflict with the native DOM Event interface.
export interface AppEvent {
    id: string;
    name: string;
    date: string; // YYYY-MM-DD
    city: string;
    state: string;
    venue: string; // Local do evento, ex: Estádio do Morumbi
    details?: string;
    linkedArtistIds?: string[];
    linkedBusinessIds?: string[];
    isArchived?: boolean;
}

export interface MusicalBlitz {
    id: string;
    musicId: string;
    eventDate: string;
    notes?: string;
    isArchived?: boolean;
}

export interface EmailCampaign {
  id: string;
  subject: string;
  body: string;
  recipientCategory: 'Rádios' | 'Prefeituras' | 'Empresários';
  recipientFilter: string;
  recipientCount: number;
  sentAt: string;
  attachedMusicId?: string;
  attachedArtistId?: string;
  recipientIds: string[];
  isArchived?: boolean;
}

export interface SheetsConfig {
    sheetsUrl: string;
}

export type ActiveView = 'dashboard' | 'radios' | 'prefeituras' | 'empresarios' | 'artistas' | 'promocoes' | 'eventos' | 'blitz' | 'email' | 'campaign-history' | 'online-form' | 'archive' | 'crowley-markets' | 'configuracoes';