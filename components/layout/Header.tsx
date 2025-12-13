'use client';

import { motion } from 'framer-motion';
import { Sparkles, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { logout } from '@/lib/redux/slices/authSlice';

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    role: string;
  };
}

export function Header({ user: userProp }: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showMenu, setShowMenu] = useState(false);

  // Utiliser l'utilisateur de Redux si disponible, sinon utiliser le prop
  const reduxUser = useAppSelector((state) => state.auth.user);
  const user = reduxUser || userProp;

  const handleLogout = () => {
    dispatch(logout());
    router.push('/professionnel/connexion');
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SECRETAIRE':
        return 'Secrétaire';
      case 'MASSOTHERAPEUTE':
        return 'Massothérapeute';
      case 'ESTHETICIENNE':
        return 'Esthéticienne';
      case 'ADMIN':
        return 'Administrateur';
      default:
        return role;
    }
  };

  const getHomeLink = () => {
    if (!user) return '/professionnel/dashboard';
    if (user.role === 'SECRETAIRE' || user.role === 'ADMIN') {
      return '/professionnel/dashboard';
    }
    return '/professionnel/clients';
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20 backdrop-blur-lg">
      <div className="container-spa">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href={getHomeLink()}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-soft">
                <img
                  src="/icons/apple-touch-icon.png"
                  alt="Spa Renaissance Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg gradient-text">Spa Renaissance</h1>
                <p className="text-xs text-gray-600">Gestion de spa</p>
              </div>
            </motion.div>
          </Link>

          {/* User info & actions - Desktop */}
          {user && (
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-600">{getRoleLabel(user.role)}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-spa-rose-100 to-spa-lavande-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-spa-rose-600" />
              </div>
              <button
                onClick={handleLogout}
                className="btn-outline flex items-center gap-2 !py-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          )}

          {/* Menu button - Mobile */}
          {user && (
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {showMenu ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          )}
        </div>

        {/* Mobile menu */}
        {showMenu && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden pb-4 border-t border-gray-200 mt-4 pt-4"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-spa-rose-100 to-spa-lavande-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-spa-rose-600" />
              </div>
              <div>
                <p className="font-medium text-gray-800">{user.name}</p>
                <p className="text-sm text-gray-600">{getRoleLabel(user.role)}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full btn-outline flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </motion.div>
        )}
      </div>
    </header>
  );
}
