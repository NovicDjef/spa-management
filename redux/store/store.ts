import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import staffReducer from './slices/staffSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    staff: staffReducer,

  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['auth/login/fulfilled', 'auth/checkAuth/fulfilled'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.user', 'auth.tokens'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
