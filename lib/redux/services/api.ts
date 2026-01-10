import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { Headers } from 'node-fetch';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      telephone: string;
      nom: string;
      prenom: string;
      role: string;
    };
    token: string;
  };
}

export interface AssignedByInfo {
  id: string;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'SECRETAIRE';
}

export interface AssignedToInfo {
  id: string;
  nom: string;
  prenom: string;
  role: 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
}

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  telCellulaire: string;
  courriel: string;
  dateNaissance: string;
  serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE';
  createdAt: string;
  assignedAt?: string; // Date d'assignation
  assignedBy?: AssignedByInfo | null; // Qui a assigné le client
  assignedTo?: AssignedToInfo | null; // À qui le client est assigné
  hasNoteAfterAssignment?: boolean; // Indique si une note a été ajoutée après l'assignation
  lastVisit?: string; // Date de dernière visite
  notes?: Note[]; // Notes incluses dans la réponse de /clients/:id
  // Champs médicaux
  zonesDouleur?: string[]; // Zones de douleur
  raisonConsultation?: string;
  traitementsActuels?: string;
  allergies?: string;
  medicaments?: string;
  mauxDeDos?: boolean;
  raideurs?: boolean;
  arthrose?: boolean;
  tendinite?: boolean;
  // Tous les autres champs...
  [key: string]: any;
}

export interface UpdateClientData {
  // Informations personnelles
  nom?: string;
  prenom?: string;
  telCellulaire?: string;
  courriel?: string;
  dateNaissance?: string;
  adresse?: string;
  ville?: string;
  province?: string;
  codePostal?: string;

  // Informations médicales - Zones de douleur
  zonesDouleur?: string[]; // ["Dos", "Nuque", "Épaules", etc.]
  raisonConsultation?: string;
  traitementsActuels?: string;

  // Conditions médicales
  mauxDeDos?: boolean;
  raideurs?: boolean;
  arthrose?: boolean;
  tendinite?: boolean;
  entorse?: boolean;
  fracture?: boolean;
  accident?: boolean;

  // Allergies et médicaments
  allergies?: string;
  medicaments?: string;

  // Autres informations médicales
  problemesSante?: string;
  interventionsChirurgicales?: string;
  grossesse?: boolean;
  moisGrossesse?: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    nom: string;
    prenom: string;
    role: string;
  };
}


export interface Assignment {
  clientId: string;
  professionalId: string;
}

export interface AssignmentFull {
  id: string;
  clientId: string;
  professionalId: string;
  assignedById: string;
  assignedAt: string;
  assignedBy: AssignedByInfo;
  professional: AssignedToInfo;
}

export interface AssignmentHistoryItem {
  id: string;
  assignedAt: string;
  client: {
    id: string;
    nom: string;
    prenom: string;
    serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE';
  };
  professional: AssignedToInfo;
  assignedBy: AssignedByInfo;
}

export interface AssignmentDetails {
  id: string;
  clientId: string;
  professionalId: string;
  assignedById: string;
  assignedAt: string;
  client: {
    id: string;
    nom: string;
    prenom: string;
    courriel: string;
    telCellulaire: string;
    serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE';
  };
  professional: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: 'MASSOTHERAPEUTE' | 'ESTHETICIENNE' | 'ADMIN';
  };
  assignedBy?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    role: 'ADMIN' | 'SECRETAIRE';
  };
}

export interface AllAssignmentsResponse {
  success: true;
  total: number;
  data: AssignmentDetails[];
}

export interface User {
  id: string;
  email: string;
  telephone: string;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'SECRETAIRE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
  isActive: boolean;
  numeroMembreOrdre?: string; // Numéro d'ordre professionnel pour les thérapeutes
  adresse?: string; // Adresse de l'employé
  photoUrl?: string; // URL de la photo de profil
  createdAt: string;
  updatedAt?: string; // Date de dernière mise à jour
  _count?: {
    assignedClients: number;
    notesCreated: number;
    reviewsReceived?: number;
  };
  averageRating?: number;
}

export interface CreateUserData {
  email: string;
  telephone: string;
  password: string;
  role: 'ADMIN' | 'SECRETAIRE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
  nom: string;
  prenom: string;
  adresse?: string;
  numeroMembreOrdre?: string;
}

export interface UpdateUserData {
  email?: string;
  telephone?: string;
  nom?: string;
  prenom?: string;
  role?: 'ADMIN' | 'SECRETAIRE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
  password?: string;
  adresse?: string;
  numeroMembreOrdre?: string;
}

// Marketing Types
export interface MarketingContact {
  id: string;
  nom: string;
  prenom: string;
  nomComplet: string;
  courriel: string;
  telCellulaire: string;
  telMaison?: string;
  telBureau?: string;
  serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE';
  gender?: 'HOMME' | 'FEMME' | 'AUTRE';
  dateInscription: string;
  derniereVisite?: string;
  joursSansVisite?: number | null;
}

export interface MarketingContactsParams {
  serviceType?: 'MASSOTHERAPIE' | 'ESTHETIQUE';
  lastVisitMonths?: number;
  lastVisitYears?: number;
  gender?: 'HOMME' | 'FEMME' | 'AUTRE';
  search?: string;
}

export interface SendIndividualEmailData {
  clientId: string;
  subject: string;
  message: string;
}

export interface SendCampaignEmailData {
  clientIds: string[];
  subject: string;
  message: string;
}

export interface MarketingStats {
  totalClients: number;
  newClientsLast30Days: number;
  inactiveClients3Months: number;
  clientsByService: {
    MASSOTHERAPIE: number;
    ESTHETIQUE: number;
  };
  clientsByGender: {
    FEMME: number;
    HOMME: number;
    AUTRE: number;
  };
}

// Types pour la génération AI
export interface GenerateMarketingMessageData {
  prompt: string;
  clientIds: string[];
  additionalContext?: string;
  serviceType?: 'MASSOTHERAPIE' | 'ESTHETIQUE' | 'MIXTE';
  spaName?: string;
  clients?: Array<{
    id: string;
    nom: string;
    prenom: string;
    courriel: string;
    telCellulaire: string;
    serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE';
  }>;
}

export interface GeneratedMessageResponse {
  subject: string;
  message: string;
  prompt: string;
  clientsCount: number;
}

export interface SendAiCampaignData {
  clientIds: string[];
  subject: string;
  message: string;
  prompt: string;
}

// Email Logs Types (pour la traçabilité des campagnes)
export interface EmailLog {
  id: string;
  type: string;
  clientEmail: string;
  clientName: string;
  subject: string;
  sentAt: string;
  opened?: boolean;
  clicked?: boolean;
  htmlContent?: string;
  prompt?: string;
  status?: 'sent' | 'failed' | 'bounced';
  errorMessage?: string;
  campaignId?: string;
}

export interface EmailLogsParams {
  type?: string;
  clientEmail?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface EmailLogsResponse {
  logs: EmailLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EmailStatsParams {
  startDate?: string;
  endDate?: string;
}

export interface EmailStatsResponse {
  totalEmails: number;
  byType: {
    [key: string]: number;
  };
  recentLogs: EmailLog[];
}

// Campaign Types (nouveau système de campagnes)
export interface Campaign {
  id: string;
  subject: string;
  prompt?: string;
  totalClients: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
  successfulEmails?: EmailLog[];
  failedEmails?: EmailLog[];
}

export interface CampaignsParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface CampaignsResponse {
  campaigns: Campaign[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CampaignDetailsResponse {
  campaign: Campaign;
}

// Types pour les reçus d'assurance
export interface SendReceiptData {
  clientName: string; // ✅ Nom complet du client (requis)
  clientEmail: string; // ✅ Email du client (requis)
  serviceName: string; // ✅ Nom du service (requis)
  duration: number; // ✅ Durée en minutes (requis)
  price: number; // ✅ Prix avant taxes (requis)
  serviceDate: string; // ✅ Format: "YYYY-MM-DD" (requis)
  // Optionnels
  clientId?: string; // ⚠️ ID du client (optionnel, pour référence)
  noteId?: string; // ⚠️ ID de la note (optionnel)
  serviceId?: string; // ⚠️ ID du service (optionnel)
  clientPhone?: string; // Téléphone du client (optionnel)
  clientAddress?: string; // Adresse du client (optionnel)
}

// Type pour la modification d'un reçu (même structure que SendReceiptData)
export interface UpdateReceiptData extends SendReceiptData {}

export interface PreviewReceiptResponse {
  success: boolean;
  message?: string;
  data: {
    pdf: string; // PDF encodé en base64
    receiptNumber: number; // Numéro du reçu
    subtotal: number; // Montant avant taxes
    taxTPS: number; // Taxe TPS (5%)
    taxTVQ: number; // Taxe TVQ (9.975%)
    total: number; // Montant total avec taxes
  };
}

// Types pour l'historique des reçus
export interface Receipt {
  id: string;
  receiptNumber: string; // "REC-2026-0006"
  therapistId: string;
  therapistName: string;
  memberNumber: string;
  clientId: string | null;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  clientAddress?: string;
  serviceName: string;
  duration: number;
  price: string;
  serviceDate: string; // Date du traitement (ISO string)
  referenceNumber?: string;
  pdfUrl?: string;
  emailSent: boolean;
  emailSentAt: string; // Date d'envoi du reçu (ISO string)
  emailCount: number;
  createdAt: string;
  updatedAt: string;
  // Objets imbriqués (optionnels)
  therapist?: {
    id: string;
    nom: string;
    prenom: string;
    numeroMembreOrdre: string;
  };
  client?: {
    id: string;
    nom: string;
    prenom: string;
  } | null;
  // Compatibilité avec l'ancien format (pour ne pas casser le code existant)
  therapistOrderNumber?: string;
  treatmentDate?: string;
  treatmentTime?: string;
  subtotal?: number;
  taxTPS?: number;
  taxTVQ?: number;
  total?: number;
  sentAt?: string;
}

export interface ReceiptsListResponse {
  success: boolean;
  data: Receipt[];
}

export interface ReceiptDetailResponse {
  success: boolean;
  data: {
    receipt: Receipt;
    pdf?: string; // PDF encodé en base64 (optionnel)
  };
}

// Types pour les services de massage (format backend)
export interface MassageServiceBackend {
  id: string;
  name: string;
  pricing: {
    [duration: string]: number; // ex: { "50": 103, "80": 133 }
  };
}

export interface MassageServicesBackendResponse {
  success: boolean;
  data: MassageServiceBackend[];
}

// Types transformés pour le frontend
export interface MassageServiceDuration {
  duration: number;
  price: number;
}

export interface MassageService {
  id: string;
  name: string;
  durations: MassageServiceDuration[];
}

// Types pour la gestion du profil utilisateur
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  adresse?: string;
  numeroMembreOrdre?: string;
  telephone?: string;
  nom?: string;
  prenom?: string;
}

// Review Types
export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface CreateReviewData {
  professionalId: string;
  rating: number;
  comment?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ProfessionalPublic {
  id: string;
  prenom: string;
  nom: string;
  role: 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
  isActive: boolean;
  photoUrl?: string | null;
}

export interface ReviewWithProfessional extends Review {
  professional: {
    id: string;
    nom: string;
    prenom: string;
    role: 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
  };
}

export interface AllReviewsParams {
  page?: number;            // Numéro de page (défaut: 1)
  limit?: number;           // Avis par page (défaut: 20)
  professionalId?: string;  // Filtrer par professionnel
  rating?: number;          // Filtrer par note (1-5)
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AllReviewsResponse {
  reviews: ReviewWithProfessional[];
  pagination: PaginationInfo;
}

// ==== BOOKING TYPES ====

// Booking Status
export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED';

// Main Booking Interface
export interface Booking {
  id: string;
  clientId: string;
  professionalId: string;
  serviceId?: string;
  startTime: string; // ISO datetime
  endTime: string;
  status: BookingStatus;
  notes?: string;
  serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE';
  createdAt: string;
  updatedAt: string;

  // Populated relations
  client: {
    id: string;
    nom: string;
    prenom: string;
    telCellulaire: string;
    courriel: string;
  };

  professional: {
    id: string;
    nom: string;
    prenom: string;
    role: 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
    photoUrl?: string;
    color?: string; // For calendar display
  };

  service?: {
    id: string;
    name: string;
    duration: number;
    price: number;
  };
}

// Create Booking Data (format backend)
export interface CreateBookingData {
  // Client existant
  clientId?: string;

  // Ou nouveau client (sans dossier complet)
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;

  // Informations de réservation
  professionalId: string;
  serviceId?: string;
  serviceVariationId?: string; // Pour les services avec variations
  bookingDate: string; // Format YYYY-MM-DD
  startTime: string; // Format HH:mm
  endTime: string; // Format HH:mm
  specialNotes?: string;

  // Options de rappel
  sendSmsReminder?: boolean;
  sendEmailReminder?: boolean;
}

// Update Booking Data (format backend)
export interface UpdateBookingData {
  professionalId?: string;
  serviceId?: string;
  serviceVariationId?: string;
  bookingDate?: string; // Format YYYY-MM-DD
  startTime?: string; // Format HH:mm
  endTime?: string; // Format HH:mm
  specialNotes?: string;
  status?: BookingStatus;
}

// ==== END BOOKING TYPES ====

// ==== AVAILABILITY TYPES ====

// Availability Block (bloquer une journée ou période)
export interface AvailabilityBlock {
  id: string;
  professionalId: string;
  date: string; // Format YYYY-MM-DD
  startTime?: string; // Format HH:mm (optionnel, si null = toute la journée)
  endTime?: string; // Format HH:mm
  reason?: string;
  createdAt: string;
  professional?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

// Create Availability Block Data
export interface CreateAvailabilityBlockData {
  professionalId: string;
  date: string; // Format YYYY-MM-DD
  startTime?: string; // Format HH:mm (optionnel pour bloquer toute la journée)
  endTime?: string; // Format HH:mm
  reason?: string;
}

// Break (pause récurrente ou ponctuelle)
export interface Break {
  id: string;
  professionalId: string;
  dayOfWeek?: number | null; // 0-6 (0=Dimanche, 1=Lundi, etc.) ou null pour tous les jours
  startTime: string; // Format HH:mm
  endTime: string; // Format HH:mm
  label?: string;
  isActive?: boolean; // Indique si la pause est active
  createdAt: string;
  updatedAt?: string;
  professional?: {
    id: string;
    nom: string;
    prenom: string;
  };
}

// Create Break Data
export interface CreateBreakData {
  professionalId: string;
  dayOfWeek?: number | null; // null = tous les jours
  startTime: string; // Format HH:mm
  endTime: string; // Format HH:mm
  label?: string;
}

// Update Break Data
export interface UpdateBreakData {
  dayOfWeek?: number | null;
  startTime?: string;
  endTime?: string;
  label?: string;
  isActive?: boolean;
}

// Generate Period Data
export interface GeneratePeriodData {
  professionalId: string;
  startDate: string; // Format YYYY-MM-DD
  endDate: string; // Format YYYY-MM-DD
}

// Generate Period Response
export interface GeneratePeriodResponse {
  success: boolean;
  message: string;
  data: {
    professionalId: string;
    startDate: string;
    endDate: string;
    generated: number;
    period: string;
  };
}

// Update Day Availability Data
export interface UpdateDayAvailabilityData {
  startTime?: string; // Format HH:mm
  endTime?: string; // Format HH:mm
  isAvailable?: boolean;
  reason?: string;
}

// Unblock Day Data
export interface UnblockDayData {
  professionalId: string;
  date: string; // Format YYYY-MM-DD
}

// Unblock Day Response
export interface UnblockDayResponse {
  success: boolean;
  message: string;
  data: AvailabilityBlock;
}

// Working Schedule (template hebdomadaire)
export interface WorkingSchedule {
  id: string;
  professionalId: string;
  dayOfWeek: number; // 0-6 (0=Dimanche, 1=Lundi, etc.)
  startTime: string; // Format HH:mm
  endTime: string; // Format HH:mm
  isActive: boolean;
  createdAt: string;
}

// Set Working Schedule Data
export interface SetWorkingScheduleData {
  professionalId: string;
  schedules: {
    dayOfWeek: number; // 0-6
    startTime: string; // Format HH:mm
    endTime: string; // Format HH:mm
    isActive?: boolean;
  }[];
}

// Client Profile (pour autocomplete et historique)
export interface ClientProfile {
  id: string;
  nom: string;
  prenom: string;
  telCellulaire: string;
  courriel: string;
  dateNaissance?: string;
  serviceType: 'MASSOTHERAPIE' | 'ESTHETIQUE';
  lastVisit?: string;
}

// Client Bookings Stats
export interface ClientBookingsStats {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  upcoming: number;
}

// Client Bookings History Response
export interface ClientBookingsHistoryResponse {
  success: boolean;
  data: {
    client: ClientProfile;
    bookings: Booking[];
    stats: ClientBookingsStats;
  };
}

// ==== END AVAILABILITY TYPES ====

// ==== SERVICE TYPES ====

// Service Category
export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  services: Service[];
}

// Service Variation
export interface ServiceVariation {
  id: string;
  name: string;
  duration: number; // en minutes
  price: number;
  description?: string;
}

// Service
export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  duration: number; // en minutes
  price: number;
  imageUrl?: string;
  requiresProfessional?: boolean;
  variations?: ServiceVariation[]; // Variations de durée/prix
  category?: {
    id: string;
    name: string;
    description?: string;
  };
}

// Package Service
export interface PackageService {
  serviceName: string;
  serviceId?: string;
  serviceDuration?: number;
  serviceDescription?: string;
  quantity: number;
  isOptional: boolean;
  extraCost?: number;
}

// Package
export interface Package {
  id: string;
  name: string;
  slug: string;
  description?: string;
  variant?: string;
  price: number;
  imageUrl?: string;
  services: PackageService[];
}

// Gym Membership
export interface GymMembership {
  id: string;
  type: string;
  name: string;
  price: number;
  duration: number; // en jours
  description?: string;
}

// Available Professional (simplifié pour affichage public)
export interface AvailableProfessional {
  id: string;
  name: string;
  photoUrl?: string;
  speciality: string;
}

// ==== END SERVICE TYPES ====

// API Service avec RTK Query
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Ajouter le token d'authentification si disponible
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      // Définir Content-Type par défaut (sauf pour FormData qui est géré dans queryFn personnalisé)
      headers.set('Content-Type', 'application/json');

      return headers;
    },
  }),
  tagTypes: ['Client', 'Note', 'Assignment', 'User', 'Receipts', 'EmailLog', 'Campaign', 'Booking', 'Service', 'Package', 'Availability', 'Break'],
  endpoints: (builder) => ({
    // AUTH - Connexion employé
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // CLIENTS - Créer un dossier client (PUBLIC)
    createClient: builder.mutation<{ client: Client; message: string }, Partial<Client>>({
      query: (clientData) => ({
        url: '/clients',
        method: 'POST',
        body: clientData,
      }),
      invalidatesTags: ['Client'],
    }),

    // CLIENTS - Liste des clients (avec permissions)
    getClients: builder.query<
      {
        clients: Client[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      },
      { search?: string; serviceType?: string }
    >({
      query: ({ search, serviceType }) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (serviceType && serviceType !== 'ALL') params.append('serviceType', serviceType);
        return `/clients?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        // L'API retourne { success: true, data: { clients: [...], pagination: {...} } }
        // On extrait { clients: [...], pagination: {...} }
        return response.data || response;
      },
      providesTags: ['Client'],
    }),

    // CLIENTS - Clients assignés au professionnel connecté
    // Note: L'endpoint /clients retourne automatiquement les clients assignés selon le rôle
    getAssignedClients: builder.query<{ clients: Client[] }, void>({
      query: () => '/clients',
      transformResponse: (response: any) => {
        // L'API retourne { success: true, data: { clients: [...] } }
        // On extrait juste { clients: [...] }
        const result = response.data || response;
        return result;
      },
      providesTags: ['Client', 'Assignment'],
    }),

    // CLIENTS - Détail d'un client
    getClientById: builder.query<{ client: Client }, string>({
      query: (id) => `/clients/${id}`,
      transformResponse: (response: any) => {
        // L'API retourne { success: true, data: {...client} }
        // On transforme en { client: {...} }
        return { client: response.data || response };
      },
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),

    // CLIENTS - Autocomplete pour recherche rapide (min 2 caractères)
    autocompleteClients: builder.query<
      { success: boolean; data: ClientProfile[] },
      string
    >({
      query: (q) => `/clients/autocomplete?q=${q}`,
      providesTags: ['Client'],
    }),

    // CLIENTS - Historique complet des réservations d'un client
    getClientBookings: builder.query<
      ClientBookingsHistoryResponse,
      { clientId: string; includeHistory?: boolean }
    >({
      query: ({ clientId, includeHistory = true }) =>
        `/clients/${clientId}/bookings?includeHistory=${includeHistory}`,
      providesTags: ['Client', 'Booking'],
    }),

    // CLIENTS - Modifier les informations d'un client (ADMIN/MASSOTHERAPEUTE/ESTHETICIENNE)
    updateClient: builder.mutation<
      { success: boolean; message: string; data: Client },
      { id: string; data: UpdateClientData }
    >({
      query: ({ id, data }) => ({
        url: `/clients/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Client', id },
        'Client',
      ],
    }),

    // NOTES - Récupérer les notes d'un client
    getNotes: builder.query<{ notes: Note[] }, string>({
      query: (clientId) => `/clients/${clientId}`,
      transformResponse: (response: any) => {
        // L'API retourne { success: true, data: [...notes] }
        // On transforme en { notes: [...] }
        return { notes: response.data || response };
      },
      providesTags: (result, error, clientId) => [{ type: 'Note', id: clientId }],
    }),

    // NOTES - Ajouter une note
    addNote: builder.mutation<{ note: Note; message: string }, { clientId: string; content: string }>({
      query: ({ clientId, content }) => ({
        url: `/notes/${clientId}`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { clientId }) => [
        { type: 'Note', id: clientId },
        { type: 'Client', id: clientId }, // Invalider le client spécifique
        'Client', // Invalider la liste complète pour mettre à jour hasNoteAfterAssignment
      ],
    }),

    // NOTES - Modifier une note
    updateNote: builder.mutation<{ note: Note; message: string }, { noteId: string; content: string }>({
      query: ({ noteId, content }) => ({
        url: `/notes/${noteId}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: (result, error, { noteId }) => [
        { type: 'Note', id: noteId },
        'Client', // Invalider tous les clients pour rafraîchir les notes incluses
      ],
    }),

    // ASSIGNMENTS - Assigner un client (SECRETAIRE/ADMIN)
    assignClient: builder.mutation<{ assignment: any; message: string }, Assignment>({
      query: (assignment) => ({
        url: '/assignments',
        method: 'POST',
        body: assignment,
      }),
      invalidatesTags: ['Assignment', 'Client'],
    }),

    // ASSIGNMENTS - Retirer une assignation (SECRETAIRE/ADMIN)
    unassignClient: builder.mutation<{ message: string }, { clientId: string; professionalId: string }>({
      query: ({ clientId, professionalId }) => ({
        url: `/assignments/${clientId}/${professionalId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Assignment', 'Client'],
    }),

    // ASSIGNMENTS - Récupérer toutes les assignations (SECRETAIRE/ADMIN)
    getAllAssignments: builder.query<AllAssignmentsResponse, void>({
      query: () => '/assignments',
      transformResponse: (response: any) => response,
      providesTags: ['Assignment'],
    }),

    // PROFESSIONALS - Liste des pros (SECRETAIRE/ADMIN)
    getProfessionals: builder.query<{ Users: User[] }, void>({
      query: () => '/users',
      transformResponse: (response: any) => response.data || response,
      providesTags: ['User'],
    }),

    // USERS - Gestion des employés (ADMIN UNIQUEMENT)

    // Créer un employé
    createUser: builder.mutation<{ user: User; plainPassword: string; message: string }, CreateUserData>({
      query: (userData) => ({
        url: '/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    // Liste de tous les employés
    getUsers: builder.query<{ users: User[] }, { role?: string; search?: string; includeInactive?: boolean }>({
      query: ({ role, search, includeInactive }) => {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (search) params.append('search', search);
        if (includeInactive) params.append('includeInactive', 'true');
        return `/users?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        // L'API retourne { success: true, data: [...] }
        // On transforme en { users: [...] }
        const users = response.data || response;
        // S'assurer que c'est toujours un tableau
        return { users: Array.isArray(users) ? users : [] };
      },
      providesTags: ['User'],
    }),

    // Détails d'un employé
    getUserById: builder.query<{ user: User }, string>({
      query: (id) => `/users/${id}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // Modifier un employé
    updateUser: builder.mutation<{ user: User; plainPassword?: string; message: string }, { id: string; data: UpdateUserData }>({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }, 'User'],
    }),

    // Supprimer un employé
    deleteUser: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),

    // Réinitialiser le mot de passe
    resetUserPassword: builder.mutation<{ plainPassword: string; message: string }, { id: string; newPassword: string }>({
      query: ({ id, newPassword }) => ({
        url: `/users/${id}/reset-password`,
        method: 'POST',
        body: { newPassword },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'User', id }],
    }),

   toggleUserStatus: builder.mutation<
  { data: User; message: string },
  { id: string; isActive: boolean }
>({
  query: ({ id, isActive }) => ({
    url: `/users/${id}/toggle-status`,
    method: 'PATCH',
    body: { isActive }, // ⭐⭐ INDISPENSABLE
  }),
}),



    // MARKETING - Gestion des campagnes marketing (ADMIN UNIQUEMENT)

    // Récupérer les contacts avec filtres
    getMarketingContacts: builder.query<{ contacts: MarketingContact[]; total: number; filters: any }, MarketingContactsParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.serviceType) queryParams.append('serviceType', params.serviceType);
        if (params.lastVisitMonths) queryParams.append('lastVisitMonths', params.lastVisitMonths.toString());
        if (params.lastVisitYears) queryParams.append('lastVisitYears', params.lastVisitYears.toString());
        if (params.gender) queryParams.append('gender', params.gender);
        if (params.search) queryParams.append('search', params.search);
        return `/marketing/contacts?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Client'],
    }),

    // Envoyer un email individuel
    sendIndividualEmail: builder.mutation<{ message: string; recipient: any }, SendIndividualEmailData>({
      query: (emailData) => ({
        url: '/marketing/send-email/individual',
        method: 'POST',
        body: emailData,
      }),
    }),

    // Envoyer une campagne email
    sendCampaignEmail: builder.mutation<{ message: string; totalSent: number; totalFailed: number; failures?: any[] }, SendCampaignEmailData>({
      query: (campaignData) => ({
        url: '/marketing/send-email/campaign',
        method: 'POST',
        body: campaignData,
      }),
    }),

    // Obtenir les statistiques marketing
    getMarketingStats: builder.query<MarketingStats, void>({
      query: () => '/marketing/stats',
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Client'],
    }),

    // Générer un message marketing avec ChatGPT
    generateMarketingMessage: builder.mutation<GeneratedMessageResponse, GenerateMarketingMessageData>({
      query: (data) => ({
        url: '/marketing/generate-message',
        method: 'POST',
        body: data,
      }),
      transformResponse: (response: any) => response.data || response,
    }),

    // Envoyer une campagne générée par IA
    sendAiCampaign: builder.mutation<
      { message: string; totalSent: number; totalFailed: number; totalClients: number; results: any[] },
      SendAiCampaignData
    >({
      query: (campaignData) => ({
        url: '/marketing/send-email/campaign',
        method: 'POST',
        body: campaignData,
      }),
      transformResponse: (response: any) => response.data || response,
    }),

    // EMAIL LOGS - Traçabilité des campagnes marketing

    // Récupérer la liste des emails envoyés avec filtres et pagination
    getEmailLogs: builder.query<EmailLogsResponse, EmailLogsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.type) queryParams.append('type', params.type);
          if (params.clientEmail) queryParams.append('clientEmail', params.clientEmail);
          if (params.startDate) queryParams.append('startDate', params.startDate);
          if (params.endDate) queryParams.append('endDate', params.endDate);
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
        }
        const queryString = queryParams.toString();
        return `/marketing/email-logs${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => response.data || response,
      providesTags: ['EmailLog'],
    }),

    // Récupérer les statistiques des emails
    getEmailStats: builder.query<EmailStatsResponse, EmailStatsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.startDate) queryParams.append('startDate', params.startDate);
          if (params.endDate) queryParams.append('endDate', params.endDate);
        }
        const queryString = queryParams.toString();
        return `/marketing/email-stats${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => response.data || response,
      providesTags: ['EmailLog'],
    }),

    // Récupérer les détails d'un email spécifique
    getEmailLogById: builder.query<EmailLog, string>({
      query: (id) => `/marketing/email-logs/${id}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, id) => [{ type: 'EmailLog', id }],
    }),

    // CAMPAIGNS - Système de campagnes marketing

    // Récupérer la liste des campagnes avec filtres et pagination
    getCampaigns: builder.query<CampaignsResponse, CampaignsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
          if (params.startDate) queryParams.append('startDate', params.startDate);
          if (params.endDate) queryParams.append('endDate', params.endDate);
        }
        const queryString = queryParams.toString();
        return `/marketing/campaigns${queryString ? `?${queryString}` : ''}`;
      },
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Campaign'],
    }),

    // Récupérer les détails d'une campagne spécifique
    getCampaignById: builder.query<CampaignDetailsResponse, string>({
      query: (id) => `/marketing/campaigns/${id}`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (_result, _error, id) => [{ type: 'Campaign', id }],
    }),

    // Renvoyer les emails échoués d'une campagne
    resendFailedEmails: builder.mutation<{ message: string; resentCount: number }, string>({
      query: (campaignId) => ({
        url: `/marketing/campaigns/${campaignId}/resend-failed`,
        method: 'POST',
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: (_result, _error, campaignId) => [
        { type: 'Campaign', id: campaignId },
        'Campaign',
        'EmailLog',
      ],
    }),

    // REVIEWS - Système d'avis clients

    // Liste publique des professionnels (PUBLIC - pas de token requis)
    getPublicProfessionals: builder.query<
      { professionals: ProfessionalPublic[] },
      { serviceType?: 'MASSOTHERAPIE' | 'ESTHETIQUE' } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.serviceType) {
          queryParams.append('serviceType', params.serviceType);
        }
        return `/professionals/public?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => {
        // Le backend retourne { success: true, data: [...] }
        // On transforme en { professionals: [...] }
        return { professionals: response.data || [] };
      },
    }),

    // Créer un avis (PUBLIC - pas de token requis)
    createReview: builder.mutation<{ message: string; review: Review }, CreateReviewData>({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
      transformResponse: (response: any) => {
        // Le backend peut retourner { success: true, data: {...} } ou directement les données
        if (response.data) {
          return response.data;
        }
        return response;
      },
      invalidatesTags: ['User'], // Invalide le cache pour mettre à jour les stats
    }),

    // Récupérer les avis d'un professionnel (PUBLIC)
    getReviewsByProfessional: builder.query<
      { averageRating: number; totalReviews: number; reviews: Review[] },
      string
    >({
      query: (professionalId) => `/reviews/${professionalId}`,
      transformResponse: (response: any) => response.data || response,
    }),

    // Statistiques détaillées des avis d'un employé (ADMIN)
    getEmployeeReviews: builder.query<
      {
        user: { id: string; nom: string; prenom: string };
        statistics: ReviewStats;
        recentReviews: Review[];
      },
      string
    >({
      query: (userId) => `/users/${userId}/reviews`,
      transformResponse: (response: any) => response.data || response,
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),

    // ASSIGNMENT HISTORY - Historique complet des assignations (ADMIN/SECRETAIRE)
    getAssignmentHistory: builder.query<
      {
        assignments: AssignmentHistoryItem[];
        total: number;
      },
      { limit?: number } | void
    >({
      query: (params) => {
        const limit = params && 'limit' in params ? params.limit : 50;
        return `/assignments/history?limit=${limit}`;
      },
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Assignment'],
    }),

    // ALL REVIEWS - Tous les avis avec filtres et pagination (ADMIN)
    getAllReviews: builder.query<AllReviewsResponse, AllReviewsParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.page) queryParams.append('page', params.page.toString());
          if (params.limit) queryParams.append('limit', params.limit.toString());
          if (params.professionalId) queryParams.append('professionalId', params.professionalId);
          if (params.rating) queryParams.append('rating', params.rating.toString());
        }
        return `/reviews?${queryParams.toString()}`;
      },
      transformResponse: (response: any) => response.data || response,
      providesTags: ['User'], // Invalide cache User car stats globales peuvent changer
    }),

    // RECEIPTS - Récupérer la liste des services de massage
    getMassageServices: builder.query<MassageService[], void>({
      query: () => '/receipts/massage-services',
      transformResponse: (response: MassageServicesBackendResponse) => {
        // Transformer le format backend en format frontend
        return response.data.map((service) => ({
          id: service.id,
          name: service.name,
          durations: Object.entries(service.pricing).map(([duration, price]) => ({
            duration: parseInt(duration),
            price: price,
          })).sort((a, b) => a.duration - b.duration), // Trier par durée croissante
        }));
      },
    }),

    // RECEIPTS - Aperçu du reçu (sans envoyer) - Retourne un PDF binaire
    previewReceipt: builder.mutation<Blob, SendReceiptData>({
      queryFn: async (receiptData, { getState }) => {
        try {
          // Récupérer le token d'authentification
          const token = (getState() as any).auth?.token;
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';

          // Faire la requête fetch pour récupérer le PDF binaire
          const response = await fetch(`${baseUrl}/receipts/preview`, {
            method: 'POST',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(receiptData),
          });

          // Si la réponse n'est pas OK, essayer de parser l'erreur en JSON
          if (!response.ok) {
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.indexOf('application/json') !== -1) {
              const errorData = await response.json();
              return {
                error: {
                  status: response.status,
                  data: errorData.message || errorData
                } as any
              };
            }
            return {
              error: {
                status: response.status,
                data: 'Erreur lors de la génération du PDF'
              } as any
            };
          }

          // Récupérer le PDF en tant que blob
          const blob = await response.blob();

          return { data: blob };
        } catch (error: any) {
          return {
            error: {
              status: 'FETCH_ERROR',
              data: error.message || 'Erreur réseau'
            } as any
          };
        }
      },
    }),

    // RECEIPTS - Envoi de reçu pour assurances (crée et envoie par email)
    sendReceipt: builder.mutation<
      {
        id: string;
        receiptNumber: number;
        clientName: string;
        serviceName: string;
        total: number;
        emailSent: boolean;
        emailSentAt: string;
      },
      SendReceiptData
    >({
      query: (receiptData) => ({
        url: '/receipts/send',
        method: 'POST',
        body: receiptData,
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: ['Receipts'],
    }),

    // RECEIPTS - Liste de tous les reçus du thérapeute connecté
    getReceipts: builder.query<Receipt[], void>({
      query: () => '/receipts',
      transformResponse: (response: any) => {
        console.log('🔍 Raw API Response:', response);

        // Le backend retourne: { success: true, data: { receipts: [...], pagination: {...} } }
        if (response && response.data && response.data.receipts) {
          console.log('✅ Extracted receipts:', response.data.receipts);
          return Array.isArray(response.data.receipts) ? response.data.receipts : [];
        }

        // Si la réponse a une structure { success, data } avec data comme tableau
        if (response && response.data && Array.isArray(response.data)) {
          console.log('✅ Direct data array:', response.data);
          return response.data;
        }

        // Si la réponse est déjà un tableau
        if (Array.isArray(response)) {
          console.log('✅ Direct array response:', response);
          return response;
        }

        console.warn('⚠️ Unexpected response format, returning empty array');
        return [];
      },
      providesTags: ['Receipts'],
    }),

    // RECEIPTS - Détail d'un reçu spécifique avec PDF
    getReceiptById: builder.query<{ pdf: string }, string>({
      queryFn: async (receiptId, { getState }) => {
        try {
          console.log('📥 getReceiptById - Récupération du reçu:', receiptId);

          const token = (getState() as any).auth?.token;
          const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
          const url = `${baseUrl}/receipts/${receiptId}/pdf`;

          console.log('🌐 URL complète:', url);

          // Faire la requête pour récupérer le PDF
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          });

          console.log('📊 Réponse status:', response.status);
          console.log('📊 Content-Type:', response.headers.get('content-type'));

          if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Erreur backend:', errorText);

            return {
              error: {
                status: response.status,
                data: { message: errorText || `Erreur ${response.status}` }
              } as any
            };
          }

          // Récupérer le PDF en tant que blob
          const blob = await response.blob();
          console.log('✅ Blob reçu, taille:', blob.size, 'bytes');

          // Convertir le blob en base64 pour l'affichage
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64 = reader.result as string;
              // Extraire seulement la partie base64 (après "data:application/pdf;base64,")
              const base64Data = base64.split(',')[1];
              console.log('✅ PDF converti en base64, longueur:', base64Data.length);

              resolve({
                data: {
                  pdf: base64Data
                }
              });
            };
            reader.readAsDataURL(blob);
          });
        } catch (error: any) {
          console.error('❌ Erreur lors de la récupération du reçu:', error);
          return {
            error: {
              status: 'FETCH_ERROR',
              data: { message: error.message || 'Erreur réseau' }
            } as any
          };
        }
      },
      providesTags: (result, error, id) => [{ type: 'Receipts', id }],
    }),

    // RECEIPTS - Renvoyer un reçu existant au client
    resendReceipt: builder.mutation<
      {
        message: string;
        emailSent: boolean;
        emailSentAt: string;
      },
      string
    >({
      query: (receiptId) => ({
        url: `/receipts/${receiptId}/resend`,
        method: 'POST',
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: (result, error, receiptId) => [{ type: 'Receipts', id: receiptId }],
    }),

    // RECEIPTS - Modifier et renvoyer un reçu existant
    updateReceipt: builder.mutation<
      Receipt,
      { id: string; data: UpdateReceiptData }
    >({
      query: ({ id, data }) => {
        console.log('📤 updateReceipt - Envoi de la requête:', {
          url: `/receipts/${id}`,
          method: 'PUT',
          body: data,
          fullUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/receipts/${id}`
        });
        return {
          url: `/receipts/${id}`,
          method: 'PUT',
          body: data,
        };
      },
      transformResponse: (response: any) => {
        console.log('📥 updateReceipt - Réponse reçue:', response);
        return response.data || response;
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'Receipts', id },
        'Receipts',
      ],
    }),

    // PROFILE - Récupérer son propre profil
    getMyProfile: builder.query<User, void>({
      query: () => '/users/me',
      transformResponse: (response: any) => response.data,
      providesTags: ['User'],
    }),

    // PROFILE - Changement de mot de passe
    changePassword: builder.mutation<{ message: string }, ChangePasswordData>({
      query: (passwordData) => ({
        url: '/users/me/change-password',
        method: 'POST',
        body: passwordData,
      }),
      transformResponse: (response: any) => response.data || response,
    }),

    // PROFILE - Mise à jour du profil
    updateProfile: builder.mutation<{ user: User }, UpdateProfileData>({
      query: (profileData) => ({
        url: '/users/me',
        method: 'PUT',
        body: profileData,
      }),
      transformResponse: (response: any) => response.data || response,
      invalidatesTags: ['User'],
    }),

    // PHOTO - Upload de sa propre photo de profil
    uploadMyPhoto: builder.mutation<
      { user: User; photoUrl: string; message: string },
      File
    >({
      queryFn: async (file, { getState }, _extraOptions, baseQuery) => {
        const formData = new FormData();
        formData.append('photo', file);

        const token = (getState() as any).auth?.token;

        const result = await baseQuery({
          url: '/users/me/photo',
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            // Pas de Content-Type - laissé au navigateur pour FormData
          },
        });

        if (result.error) return { error: result.error };

        // Le backend retourne { data: { user, photoUrl, message } }
        const responseData = (result.data as any)?.data || result.data;

        return { data: responseData };
      },
      invalidatesTags: ['User'],
    }),

    // PHOTO - Suppression de sa propre photo de profil
    deleteMyPhoto: builder.mutation<{ user: User; message: string }, void>({
      query: () => ({
        url: '/users/me/photo',
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
      transformResponse: (response: any) => response.data || response,
    }),

    // PHOTO - Admin upload photo d'un employé
    uploadEmployeePhoto: builder.mutation<
      { user: User; photoUrl: string; message: string },
      { userId: string; file: File }
    >({
      queryFn: async ({ userId, file }, { getState }, _extraOptions, baseQuery) => {
        const formData = new FormData();
        formData.append('photo', file);

        const token = (getState() as any).auth?.token;

        const result = await baseQuery({
          url: `/users/${userId}/photo`,
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            // Pas de Content-Type - laissé au navigateur pour FormData
          },
        });

        if (result.error) return { error: result.error };

        // Le backend retourne { data: { user, photoUrl, message } }
        const responseData = (result.data as any)?.data || result.data;

        return { data: responseData };
      },
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        'User',
      ],
    }),

    // PHOTO - Admin suppression photo d'un employé
    deleteEmployeePhoto: builder.mutation<{ user: User; message: string }, string>({
      query: (userId) => ({
        url: `/users/${userId}/photo`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'User', id: userId },
        'User',
      ],
      transformResponse: (response: any) => response.data || response,
    }),

    // ==== BOOKING ENDPOINTS ====

    // GET bookings by date range
    getBookingsByDateRange: builder.query<
      { bookings: Booking[] },
      { startDate: string; endDate: string; professionalId?: string }
    >({
      query: ({ startDate, endDate, professionalId }) => {
        const params = new URLSearchParams({ startDate, endDate });
        if (professionalId) params.append('professionalId', professionalId);
        return `/bookings/range?${params.toString()}`;
      },
      transformResponse: (response: any) => response.data || response,
      providesTags: ['Booking'],
    }),

    // CREATE booking
    createBooking: builder.mutation<
      { booking: Booking; message: string },
      CreateBookingData
    >({
      query: (data) => ({
        url: '/bookings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Booking', 'Client', 'Availability', 'Break'],
    }),

    // UPDATE booking
    updateBooking: builder.mutation<
      { booking: Booking; message: string },
      { id: string; data: UpdateBookingData }
    >({
      query: ({ id, data }) => ({
        url: `/bookings/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Booking', 'Availability', 'Break'],
    }),

    // CHANGE status
    changeBookingStatus: builder.mutation<
      { booking: Booking; message: string },
      { id: string; status: BookingStatus }
    >({
      query: ({ id, status }) => ({
        url: `/bookings/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Booking', 'Availability', 'Break'],
    }),

    // DELETE booking
    deleteBooking: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/bookings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Booking', 'Availability', 'Break'],
    }),

    // ==== END BOOKING ENDPOINTS ====

    // ==== AVAILABILITY ENDPOINTS ====

    // POST /api/availability/block - Bloquer une journée ou période
    createAvailabilityBlock: builder.mutation<
      { success: boolean; message: string; data: AvailabilityBlock },
      CreateAvailabilityBlockData
    >({
      query: (data) => ({
        url: '/availability/block',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Availability', 'Booking'],
    }),

    // GET /api/availability/blocks/:professionalId - Liste des blocages
    getAvailabilityBlocks: builder.query<
      { success: boolean; data: AvailabilityBlock[] },
      { professionalId: string; startDate?: string; endDate?: string }
    >({
      query: ({ professionalId, startDate, endDate }) => {
        let url = `/availability/blocks/${professionalId}`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const queryString = params.toString();
        if (queryString) url += `?${queryString}`;
        return url;
      },
      providesTags: ['Availability'],
    }),

    // DELETE /api/availability/:id - Débloquer une journée/période
    deleteAvailabilityBlock: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/availability/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Availability', 'Booking'],
    }),

    // POST /api/availability/breaks - Ajouter une pause
    createBreak: builder.mutation<
      { success: boolean; message: string; data: Break },
      CreateBreakData
    >({
      query: (data) => ({
        url: '/availability/breaks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Break', 'Booking'],
    }),

    // GET /api/availability/breaks/:professionalId - Liste des pauses
    getBreaks: builder.query<
      {
        success: boolean;
        data: {
          professional: {
            id: string;
            nom: string;
            prenom: string;
            role: string;
          };
          breaks: Break[];
        }
      },
      string
    >({
      query: (professionalId) => `/availability/breaks/${professionalId}`,
      providesTags: ['Break'],
    }),

    // DELETE /api/availability/breaks/:id - Supprimer une pause
    deleteBreak: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/availability/breaks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Break', 'Booking'],
    }),

    // PATCH /api/availability/breaks/:id - Modifier une pause
    updateBreak: builder.mutation<
      { success: boolean; message: string; data: Break },
      { id: string; data: UpdateBreakData }
    >({
      query: ({ id, data }) => ({
        url: `/availability/breaks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Break', 'Booking'],
    }),

    // POST /api/availability/generate-period - Générer horaires sur période
    generatePeriodSchedule: builder.mutation<
      GeneratePeriodResponse,
      GeneratePeriodData
    >({
      query: (data) => ({
        url: '/availability/generate-period',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Availability', 'Break', 'Booking'],
    }),

    // PATCH /api/availability/day/:id - Modifier un horaire d'un jour
    updateDayAvailability: builder.mutation<
      { success: boolean; message: string; data: AvailabilityBlock },
      { id: string; data: UpdateDayAvailabilityData }
    >({
      query: ({ id, data }) => ({
        url: `/availability/day/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Availability', 'Booking'],
    }),

    // POST /api/availability/unblock-day - Débloquer une journée
    unblockDay: builder.mutation<
      UnblockDayResponse,
      UnblockDayData
    >({
      query: (data) => ({
        url: '/availability/unblock-day',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Availability', 'Booking'],
    }),

    // POST /api/availability/working-schedule - Définir les horaires hebdomadaires
    setWorkingSchedule: builder.mutation<
      { success: boolean; message: string },
      SetWorkingScheduleData
    >({
      query: (data) => ({
        url: '/availability/working-schedule',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Availability'],
    }),

    // GET /api/availability/working-schedule/:professionalId - Récupérer le template hebdomadaire
    getWorkingSchedule: builder.query<
      { success: boolean; data: WorkingSchedule[] },
      string
    >({
      query: (professionalId) => `/availability/working-schedule/${professionalId}`,
      providesTags: ['Availability'],
    }),

    // ==== END AVAILABILITY ENDPOINTS ====

    // ==== SERVICE ENDPOINTS ====

    // GET all services with categories
    getAllServices: builder.query<
      { success: boolean; data: ServiceCategory[] },
      { categoryName?: string } | void
    >({
      query: (params) => {
        const query = params && 'categoryName' in params && params.categoryName ? `?categoryName=${params.categoryName}` : '';
        return `/public/services${query}`;
      },
      providesTags: ['Service'],
    }),

    // GET service by slug
    getServiceBySlug: builder.query<
      { success: boolean; data: Service },
      string
    >({
      query: (slug) => `/public/services/${slug}`,
      providesTags: ['Service'],
    }),

    // GET all packages
    getAllPackages: builder.query<
      { success: boolean; data: Package[] },
      void
    >({
      query: () => '/public/packages',
      providesTags: ['Package'],
    }),

    // GET package by slug
    getPackageBySlug: builder.query<
      { success: boolean; data: Package },
      string
    >({
      query: (slug) => `/public/packages/${slug}`,
      providesTags: ['Package'],
    }),

    // GET gym memberships
    getGymMemberships: builder.query<
      { success: boolean; data: GymMembership[] },
      void
    >({
      query: () => '/public/gym-memberships',
      providesTags: ['Service'],
    }),

    // GET available professionals
    getAvailableProfessionals: builder.query<
      { success: boolean; data: AvailableProfessional[] },
      { serviceType?: 'MASSOTHERAPIE' | 'ESTHETIQUE' } | void
    >({
      query: (params) => {
        const query = params && 'serviceType' in params && params.serviceType ? `?serviceType=${params.serviceType}` : '';
        return `/public/professionals${query}`;
      },
      providesTags: ['User'],
    }),

    // ==== END SERVICE ENDPOINTS ====
  }),
});

// Export des hooks générés automatiquement
export const {
  useLoginMutation,
  useCreateClientMutation,
  useGetClientsQuery,
  useGetAssignedClientsQuery,
  useGetClientByIdQuery,
  useAutocompleteClientsQuery,
  useGetClientBookingsQuery,
  useUpdateClientMutation,
  useGetNotesQuery,
  useAddNoteMutation,
  useUpdateNoteMutation,
  useAssignClientMutation,
  useUnassignClientMutation,
  useGetAllAssignmentsQuery,
  useGetProfessionalsQuery,
  // User management hooks
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useToggleUserStatusMutation,
  // Photo upload/delete hooks
  useUploadMyPhotoMutation,
  useDeleteMyPhotoMutation,
  useUploadEmployeePhotoMutation,
  useDeleteEmployeePhotoMutation,
  // Marketing hooks
  useGetMarketingContactsQuery,
  useSendIndividualEmailMutation,
  useSendCampaignEmailMutation,
  useGetMarketingStatsQuery,
  useGenerateMarketingMessageMutation,
  useSendAiCampaignMutation,
  // Email logs hooks
  useGetEmailLogsQuery,
  useGetEmailStatsQuery,
  useGetEmailLogByIdQuery,
  // Campaign hooks
  useGetCampaignsQuery,
  useGetCampaignByIdQuery,
  useResendFailedEmailsMutation,
  // Review hooks
  useGetPublicProfessionalsQuery,
  useCreateReviewMutation,
  useGetReviewsByProfessionalQuery,
  useGetEmployeeReviewsQuery,
  useGetAllReviewsQuery,
  // Assignment history hooks
  useGetAssignmentHistoryQuery,
  // Receipt hooks
  useGetMassageServicesQuery,
  usePreviewReceiptMutation,
  useSendReceiptMutation,
  useGetReceiptsQuery,
  useGetReceiptByIdQuery,
  useResendReceiptMutation,
  useUpdateReceiptMutation,
  // Profile hooks
  useGetMyProfileQuery,
  useChangePasswordMutation,
  useUpdateProfileMutation,
  // Booking hooks
  useGetBookingsByDateRangeQuery,
  useCreateBookingMutation,
  useUpdateBookingMutation,
  useChangeBookingStatusMutation,
  useDeleteBookingMutation,
  // Availability hooks
  useCreateAvailabilityBlockMutation,
  useGetAvailabilityBlocksQuery,
  useDeleteAvailabilityBlockMutation,
  useCreateBreakMutation,
  useGetBreaksQuery,
  useDeleteBreakMutation,
  useUpdateBreakMutation,
  useGeneratePeriodScheduleMutation,
  useUpdateDayAvailabilityMutation,
  useUnblockDayMutation,
  useSetWorkingScheduleMutation,
  useGetWorkingScheduleQuery,
  // Service hooks
  useGetAllServicesQuery,
  useGetServiceBySlugQuery,
  useGetAllPackagesQuery,
  useGetPackageBySlugQuery,
  useGetGymMembershipsQuery,
  useGetAvailableProfessionalsQuery,
} = api;
