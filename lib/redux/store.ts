import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
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

  // Configuration pour refetchOnFocus et refetchOnReconnect
  setupListeners(store.dispatch);

  return store;
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
