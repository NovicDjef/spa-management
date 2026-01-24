import { configureStore } from '@reduxjs/toolkit';
import { api } from './services/api';
import authReducer from './slices/authSlice';

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      // API reducer
      [api.reducerPath]: api.reducer,
      // Slices
      auth: authReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  // Note: setupListeners désactivé pour éviter les refreshs automatiques
  // quand la fenêtre reprend le focus ou la connexion réseau revient

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
