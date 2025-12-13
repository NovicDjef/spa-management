import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token?: string;
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

export interface Professional {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
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
  createdAt: string;
  assignedClientsCount?: number;
  notesCount?: number;
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

// API Service avec RTK Query
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      // Ajouter le token d'authentification si disponible
      const token = (getState() as any).auth?.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Client', 'Note', 'Professional', 'Assignment', 'User'],
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
      providesTags: ['Client'],
    }),

    // CLIENTS - Clients assignés au professionnel connecté
    getAssignedClients: builder.query<{ clients: Client[] }, void>({
      query: () => '/clients/assigned',
      providesTags: ['Client', 'Assignment'],
    }),

    // CLIENTS - Détail d'un client
    getClientById: builder.query<{ client: Client }, string>({
      query: (id) => `/clients/${id}`,
      providesTags: (result, error, id) => [{ type: 'Client', id }],
    }),

    // NOTES - Récupérer les notes d'un client
    getNotes: builder.query<{ notes: Note[] }, string>({
      query: (clientId) => `/clients/${clientId}/notes`,
      providesTags: (result, error, clientId) => [{ type: 'Note', id: clientId }],
    }),

    // NOTES - Ajouter une note
    addNote: builder.mutation<{ note: Note; message: string }, { clientId: string; content: string }>({
      query: ({ clientId, content }) => ({
        url: `/clients/${clientId}/notes`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { clientId }) => [{ type: 'Note', id: clientId }],
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
    getProfessionals: builder.query<{ professionals: Professional[] }, void>({
      query: () => '/professionals',
      providesTags: ['Professional'],
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
      providesTags: ['User'],
    }),

    // Détails d'un employé
    getUserById: builder.query<{ user: User }, string>({
      query: (id) => `/users/${id}`,
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
  useAssignClientMutation,
  useGetProfessionalsQuery,
  // User management hooks
  useCreateUserMutation,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
} = api;
