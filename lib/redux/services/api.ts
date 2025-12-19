import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
  hasNoteAfterAssignment?: boolean; // Indique si une note a été ajoutée après l'assignation
  lastVisit?: string; // Date de dernière visite
  notes?: Note[]; // Notes incluses dans la réponse de /clients/:id
  // Tous les autres champs...
  [key: string]: any;
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

export interface User {
  id: string;
  email: string;
  telephone: string;
  nom: string;
  prenom: string;
  role: 'ADMIN' | 'SECRETAIRE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
  isActive: boolean;
  createdAt: string;
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
}

export interface UpdateUserData {
  email?: string;
  telephone?: string;
  nom?: string;
  prenom?: string;
  role?: 'ADMIN' | 'SECRETAIRE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';
  password?: string;
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
}

// API Service avec RTK Query
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Ajouter le token d'authentification si disponible
      const token = (getState() as any).auth?.token;
      const user = (getState() as any).auth?.user;
      console.log('prepareHeaders - token:', token ? 'présent' : 'absent');
      console.log('prepareHeaders - user:', user);
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Client', 'Note', 'Assignment', 'User'],
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
    getClients: builder.query<{ clients: Client[] }, { search?: string; serviceType?: string }>({
      query: ({ search, serviceType }) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (serviceType && serviceType !== 'ALL') params.append('serviceType', serviceType);
        return `/clients?${params.toString()}`;
      },
      transformResponse: (response: any) => {
        // L'API retourne { success: true, data: { clients: [...] } }
        // On extrait juste { clients: [...] }
        return response.data || response;
      },
      providesTags: ['Client'],
    }),

    // CLIENTS - Clients assignés au professionnel connecté
    // Note: L'endpoint /clients retourne automatiquement les clients assignés selon le rôle
    getAssignedClients: builder.query<{ clients: Client[] }, void>({
      query: () => '/clients',
      transformResponse: (response: any) => {
        console.log('getAssignedClients - Réponse brute:', response);
        console.log('getAssignedClients - response.data:', response.data);

        // L'API retourne { success: true, data: { clients: [...] } }
        // On extrait juste { clients: [...] }
        const result = response.data || response;
        console.log('getAssignedClients - Après transformation:', result);

        // Log détaillé du premier client pour vérifier assignedAt et hasNoteAfterAssignment
        if (result.clients && result.clients.length > 0) {
          console.log('getAssignedClients - Premier client détaillé:', result.clients[0]);
          console.log('getAssignedClients - assignedAt:', result.clients[0].assignedAt);
          console.log('getAssignedClients - hasNoteAfterAssignment:', result.clients[0].hasNoteAfterAssignment);
        }

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
    getUsers: builder.query<{ users: User[] }, { role?: string; search?: string }>({
      query: ({ role, search }) => {
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (search) params.append('search', search);
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
      transformResponse: (response: any) => response.data || response,
    }),

    // Créer un avis (PUBLIC - pas de token requis)
    createReview: builder.mutation<{ message: string; review: Review }, CreateReviewData>({
      query: (reviewData) => ({
        url: '/reviews',
        method: 'POST',
        body: reviewData,
      }),
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
  }),
});

// Export des hooks générés automatiquement
export const {
  useLoginMutation,
  useCreateClientMutation,
  useGetClientsQuery,
  useGetAssignedClientsQuery,
  useGetClientByIdQuery,
  useGetNotesQuery,
  useAddNoteMutation,
  useUpdateNoteMutation,
  useAssignClientMutation,
  useGetProfessionalsQuery,
  // User management hooks
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useToggleUserStatusMutation,
  // Marketing hooks
  useGetMarketingContactsQuery,
  useSendIndividualEmailMutation,
  useSendCampaignEmailMutation,
  useGetMarketingStatsQuery,
  // Review hooks
  useGetPublicProfessionalsQuery,
  useCreateReviewMutation,
  useGetReviewsByProfessionalQuery,
  useGetEmployeeReviewsQuery,
} = api;
