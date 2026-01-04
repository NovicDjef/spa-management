import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../services/api';

interface User {
  id: string;
  email: string;
  telephone: string;
  nom: string;
  prenom: string;
  isActive?: boolean;
  role: string;
  numeroMembreOrdre?: string; // Numéro d'ordre professionnel pour les thérapeutes
  adresse?: string; // Adresse de l'employé
  photoUrl?: string; // URL de la photo de profil
  updatedAt?: string; // Date de dernière mise à jour
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

// Charger l'état depuis localStorage au démarrage
const loadAuthFromStorage = (): AuthState => {
  if (typeof window === 'undefined') return initialState;

  try {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (user) {
      return {
        user: JSON.parse(user),
        token: token || null,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error('Erreur chargement auth:', error);
  }

  return initialState;
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadAuthFromStorage(),
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token?: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token || null;
      state.isAuthenticated = true;

      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        if (action.payload.token) {
          localStorage.setItem('token', action.payload.token);
        }
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;

      // Nettoyer localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    },
  },
  extraReducers: (builder) => {
    // Gérer la réponse de login automatiquement
    builder.addMatcher(
      api.endpoints.login.matchFulfilled,
      (state, { payload }) => {
        state.user = payload.data.user;
        state.token = payload.data.token;
        state.isAuthenticated = true;

        // Sauvegarder dans localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(payload.data.user));
          localStorage.setItem('token', payload.data.token);
        }
      }
    );
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
