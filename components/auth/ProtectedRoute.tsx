'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { hasPermission, Role } from '@/lib/permissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: keyof typeof import('@/lib/permissions').PERMISSIONS;
  allowedRoles?: Role[];
  redirectTo?: string;
}

/**
 * Composant pour protéger les routes et vérifier les permissions
 * Utilise Redux pour obtenir l'utilisateur connecté
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  allowedRoles,
  redirectTo = '/professionnel/connexion',
}: ProtectedRouteProps) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
    if (!isAuthenticated || !user) {
      router.push(redirectTo);
      return;
    }

    // Vérifier la permission si spécifiée
    if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
      // Tous les utilisateurs vont sur le dashboard
      router.push('/professionnel/dashboard');
      return;
    }

    // Vérifier les rôles autorisés si spécifiés
    if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
      // Tous les utilisateurs vont sur le dashboard
      router.push('/professionnel/dashboard');
      return;
    }
  }, [isAuthenticated, user, requiredPermission, allowedRoles, router, redirectTo]);

  // Afficher un loader pendant la vérification
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-spa-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  // Vérifier les permissions avant d'afficher le contenu
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-spa-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-spa-rose-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirection...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
