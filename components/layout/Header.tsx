'use client';

import { motion } from 'framer-motion';
import { Sparkles, LogOut, User, Menu, X, Users, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { logout, setCredentials } from '@/lib/redux/slices/authSlice';
import { ProfilePhotoDisplay } from '@/components/profile/ProfilePhotoDisplay';
import { ProfilePhotoModal } from '@/components/profile/ProfilePhotoModal';
import { useUploadMyPhotoMutation, useDeleteMyPhotoMutation } from '@/lib/redux/services/api';

interface HeaderProps {
  user?: {
    id: string;
    email: string;
    telephone: string;
    nom: string;
    prenom: string;
    role: string;
    photoUrl?: string | null;
  } | null;
}

export function Header({ user: userProp }: HeaderProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showMenu, setShowMenu] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [uploadPhoto, { isLoading: isUploadingPhoto }] = useUploadMyPhotoMutation();
  const [deletePhoto, { isLoading: isDeletingPhoto }] = useDeleteMyPhotoMutation();

  // Utiliser l'utilisateur de Redux si disponible, sinon utiliser le prop
  const reduxUser = useAppSelector((state) => state.auth.user);
  const user = reduxUser || userProp;

  // Éviter l'erreur d'hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    router.push('/professionnel/connexion');
  };

  const handlePhotoUpload = async (file: File) => {
    try {
      const result = await uploadPhoto(file).unwrap();
      if (result.user) {
        dispatch(setCredentials({ user: result.user }));
      }
      setShowPhotoModal(false);
    } catch (err) {
      console.error('Erreur upload photo:', err);
    }
  };

  const handlePhotoDelete = async () => {
    try {
      const result = await deletePhoto().unwrap();
      if (result.user) {
        dispatch(setCredentials({ user: result.user }));
      }
    } catch (err) {
      console.error('Erreur suppression photo:', err);
    }
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
    // Tous les utilisateurs vont sur le dashboard
    return '/professionnel/dashboard';
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
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-soft bg-white">
                <img
                  src="/logo_spa.svg"
                  alt="Spa Renaissance Logo"
                  className="w-full h-full object-contain p-1"
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
            <div className="hidden md:flex items-center gap-3">
              {/* Bouton "Calendrier" pour admin et secrétaire */}
              {/* {(user.role === 'ADMIN' || user.role === 'SECRETAIRE') && (
                <Link href="/admin/calendar">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 font-medium"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Calendrier</span>
                  </motion.button>
                </Link>
              )} */}
              <div className="h-8 w-px bg-gray-300 mx-1"></div>
              <Link href="/professionnel/profil" className="text-right hover:opacity-80 transition-opacity">
                <p className="font-medium text-gray-800 text-sm cursor-pointer">{user.nom} {user.prenom}</p>
                <p className="text-xs text-gray-600">{getRoleLabel(user.role)}</p>
              </Link>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPhotoModal(true)}
                className="cursor-pointer"
              >
                <ProfilePhotoDisplay
                  photoUrl={user.photoUrl || null}
                  userName={`${user.prenom} ${user.nom}`}
                  size="md"
                  className="shadow-md hover:shadow-lg transition-all"
                />
              </motion.div>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
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
              <ProfilePhotoDisplay
                photoUrl={user.photoUrl || null}
                userName={`${user.prenom} ${user.nom}`}
                size="lg"
              />
              <div>
                <p className="font-medium text-gray-800">{user.nom} {user.prenom}</p>
                <p className="text-sm text-gray-600">{getRoleLabel(user.role)}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              {/* Bouton "Calendrier" pour admin et secrétaire */}
              {/* {(user.role === 'ADMIN' || user.role === 'SECRETAIRE') && (
                <Link
                  href="/admin/calendar"
                  onClick={() => setShowMenu(false)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl font-medium shadow-soft hover:shadow-soft-lg transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Calendrier</span>
                </Link>
              )} */}
              <Link
                href="/professionnel/profil"
                onClick={() => setShowMenu(false)}
                className="w-full btn-outline flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                <span>Mon Profil</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full btn-outline flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Modal de photo de profil */}
        {user && (
          <ProfilePhotoModal
            isOpen={showPhotoModal}
            onClose={() => setShowPhotoModal(false)}
            currentPhotoUrl={user.photoUrl}
            userName={`${user.prenom} ${user.nom}`}
            onUpload={handlePhotoUpload}
            onDelete={handlePhotoDelete}
            isUploading={isUploadingPhoto}
            isDeleting={isDeletingPhoto}
          />
        )}
      </div>
    </header>
  );
}
