'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './store';
import { setCredentials } from './slices/authSlice';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();

  if (!storeRef.current) {
    // Créer le store la première fois que le composant est rendu
    storeRef.current = makeStore();
  }

  // Réhydrater l'auth depuis localStorage côté client
  useEffect(() => {
    if (typeof window !== 'undefined' && storeRef.current) {
      try {
        const userStr = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (userStr && token) {
          const user = JSON.parse(userStr);
          console.log('🔄 Réhydratation Redux depuis localStorage:', { user, hasToken: !!token });
          storeRef.current.dispatch(setCredentials({ user, token }));
        } else {
          console.log('⚠️ Aucune donnée d\'authentification dans localStorage');
        }
      } catch (error) {
        console.error('❌ Erreur réhydratation auth:', error);
      }
    }
  }, []);

  return <Provider store={storeRef.current}>{children}</Provider>;
}
