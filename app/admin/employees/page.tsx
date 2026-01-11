'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Loader2,
  X,
  Copy,
  Check,
  AlertCircle,
  Star,
  MessageSquare,
  FileText,
  ArrowLeft,
  Camera,
} from 'lucide-react';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useToggleUserStatusMutation,
  useUploadEmployeePhotoMutation,
  useDeleteEmployeePhotoMutation,
} from '@/lib/redux/services/api';
import { ProfilePhotoDisplay } from '@/components/profile/ProfilePhotoDisplay';
import { ProfilePhotoUpload } from '@/components/profile/ProfilePhotoUpload';
import { useAppSelector } from '@/lib/redux/hooks';
import { getRoleLabel, getRoleColor } from '@/lib/permissions';
import { ReviewsModal } from '@/components/reviews/ReviewsModal';
import Link from 'next/link';

type UserRole = 'ADMIN' | 'RECEPTIONISTE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';

export default function EmployeesPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedUserForReviews, setSelectedUserForReviews] = useState<any>(null);

  // Éviter l'erreur d'hydratation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redux queries and mutations
  // ⭐ IMPORTANT: includeInactive=true pour afficher TOUS les employés (actifs et bloqués)
  const { data: usersData, isLoading, refetch } = useGetUsersQuery({
    role: roleFilter !== 'ALL' ? roleFilter : undefined,
    search: searchQuery,
    includeInactive: true  // Afficher tous les employés (actifs et inactifs)
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetUserPasswordMutation();
  const [toggleUserStatus, { isLoading: isTogglingStatus }] = useToggleUserStatusMutation();
  const [uploadEmployeePhoto, { isLoading: isUploadingEmployeePhoto }] = useUploadEmployeePhotoMutation();
  const [deleteEmployeePhoto, { isLoading: isDeletingEmployeePhoto }] = useDeleteEmployeePhotoMutation();

  const [users, setUsers] = useState<any[]>(usersData?.users || []);

  // Mettre à jour les utilisateurs lorsque les données changent
  useEffect(() => {
    if (usersData?.users) {
      setUsers(usersData.users);
    }
  }, [usersData?.users]);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    telephone: '',
    password: '',
    role: 'RECEPTIONISTE' as UserRole,
    nom: '',
    prenom: '',
    adresse: '',
    numeroMembreOrdre: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation du numéro RMQ pour les massothérapeutes
    if (formData.role === 'MASSOTHERAPEUTE' && formData.numeroMembreOrdre) {
      // Accepte: M-1234, M-5678, 25-1990, 12-3456, etc.
      const rmqPattern = /^(M-\d{4}|\d{2}-\d{4})$/;
      if (!rmqPattern.test(formData.numeroMembreOrdre)) {
        setErrors({ numeroMembreOrdre: 'Le numéro RMQ doit être au format M-XXXX ou XX-XXXX (exemples: M-3444, 25-1990)' });
        return;
      }
    }

    try {
      const result = await createUser(formData).unwrap();
      setGeneratedPassword(result.plainPassword);
      setShowPassword(true);
      setShowCreateModal(false);
      // Reset form
      setFormData({
        email: '',
        telephone: '',
        password: '',
        role: 'RECEPTIONISTE',
        nom: '',
        prenom: '',
        adresse: '',
        numeroMembreOrdre: '',
      });
    } catch (error: any) {
      setErrors({ general: error.data?.message || 'Erreur lors de la création' });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setErrors({});

    // Validation du numéro RMQ pour les massothérapeutes
    if (formData.role === 'MASSOTHERAPEUTE' && formData.numeroMembreOrdre) {
      // Accepte: M-1234, M-5678, 25-1990, 12-3456, etc.
      const rmqPattern = /^(M-\d{4}|\d{2}-\d{4})$/;
      if (!rmqPattern.test(formData.numeroMembreOrdre)) {
        setErrors({ numeroMembreOrdre: 'Le numéro RMQ doit être au format M-XXXX ou XX-XXXX (exemples: M-3444, 25-1990)' });
        return;
      }
    }

    try {
      const updateData: any = {
        email: formData.email,
        telephone: formData.telephone,
        nom: formData.nom,
        prenom: formData.prenom,
        role: formData.role,
        adresse: formData.adresse,
        numeroMembreOrdre: formData.numeroMembreOrdre,
      };

      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.password) {
        updateData.password = formData.password;
      }

      const result = await updateUser({ id: selectedUser.id, data: updateData }).unwrap();

      if (result.plainPassword) {
        setGeneratedPassword(result.plainPassword);
        setShowPassword(true);
      }

      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      setErrors({ general: error.data?.message || 'Erreur lors de la modification' });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id).unwrap();
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      alert(error.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser || !formData.password) return;

    try {
      const result = await resetPassword({
        id: selectedUser.id,
        newPassword: formData.password
      }).unwrap();

      setGeneratedPassword(result.plainPassword);
      setShowPassword(true);
      setShowPasswordModal(false);
      setSelectedUser(null);
    } catch (error: any) {
      alert(error.data?.message || 'Erreur lors de la réinitialisation');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Attendre le montage pour éviter l'erreur d'hydratation
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
        </div>
      </div>
    );
  }

  const openEditModal = (user: any) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      telephone: user.telephone,
      password: '',
      role: user.role,
      nom: user.nom,
      prenom: user.prenom,
      adresse: user.adresse || '',
      numeroMembreOrdre: user.numeroMembreOrdre || '',
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: any) => {
    setSelectedUser(user);
    setFormData({ ...formData, password: '' });
    setShowPasswordModal(true);
  };

  const openReviewsModal = (user: any) => {
    setSelectedUserForReviews(user);
    setShowReviewsModal(true);
  };

  const handleEmployeePhotoUpload = async (file: File) => {
    if (!selectedUser) return;
    try {
      const result = await uploadEmployeePhoto({ userId: selectedUser.id, file }).unwrap();
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, photoUrl: result.photoUrl } : u));
      alert('Photo mise à jour');
    } catch (error: any) {
      alert(error.data?.message || 'Erreur upload photo');
    }
  };

  const handleEmployeePhotoDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteEmployeePhoto(selectedUser.id).unwrap();
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, photoUrl: null } : u));
      alert('Photo supprimée');
    } catch (error: any) {
      alert(error.data?.message || 'Erreur suppression');
    }
  };


const handleToggleStatus = async (user: any) => {
  if (!user) return;

  if (user.id === currentUser?.id) {
    alert('⚠️ Vous ne pouvez pas désactiver votre propre compte.');
    return;
  }

  const nextStatus = !user.isActive;

  try {
    const result = await toggleUserStatus({ id: user.id, isActive: nextStatus }).unwrap();
    
    // Mise à jour locale immédiate
    setUsers(users.map(u =>
      u.id === user.id ? { ...u, isActive: nextStatus } : u
    ));

    alert(result.message || 'Statut de l\'employé mis à jour');
  } catch (error: any) {
    console.error('Erreur toggle:', error);
    alert(error.data?.message || 'Erreur lors du changement de statut');
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
      <Header user={currentUser ?? undefined} />

      {/* Conteneur flex pour ordre strict */}
      <div className="container-spa py-4 sm:py-8 flex flex-col">
        {/* 1. Bouton de retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-3 sm:mb-4 order-1"
        >
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-spa-turquoise-600 hover:text-spa-turquoise-700 transition-colors group text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Retour au tableau de bord</span>
          </Link>
        </motion.div>

        {/* 2. En-tête + Bouton */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-3 sm:mb-4 order-2"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Gestion des Employés</h1>
                <p className="text-xs sm:text-sm text-gray-600">
                  {users.length} employé{users.length !== 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Nouvel Employé</span>
            </button>
          </div>
        </motion.div>

        {/* 3. Recherche et filtres - TOUJOURS en position 3 */}
        <div className="mb-3 sm:mb-4 order-3">
          <div className="card-spa p-3 sm:p-4">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-spa-turquoise-500 focus:border-transparent"
                />
              </div>

              {/* Filtre par rôle */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-spa-turquoise-500 focus:border-transparent"
                >
                  <option value="ALL">Tous les rôles</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="SECRETAIRE">Réceptionniste</option>
                  <option value="MASSOTHERAPEUTE">Massothérapeute</option>
                  <option value="ESTHETICIENNE">Esthéticienne</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Liste - TOUJOURS en position 4, APRÈS la recherche */}
        <div className="order-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-spa-turquoise-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-spa p-12 text-center"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Aucun employé trouvé
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || roleFilter !== 'ALL'
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre premier employé'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {users.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="card-spa p-6 hover:shadow-lg transition-shadow"
              >
                {/* En-tête */}
                <div className="flex items-start gap-4 mb-4">
                  <ProfilePhotoDisplay
                    photoUrl={user.photoUrl || null}
                    userName={`${user.prenom} ${user.nom}`}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {user.prenom} {user.nom}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">{user.telephone}</p>
                    <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-medium bg-${getRoleColor(user.role)}/10 text-${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-spa-turquoise-500" />
                    <span className="font-medium">{user._count?.assignedClients || 0}</span>
                    <span className="text-gray-600">clients</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-spa-menthe-500" />
                    <span className="font-medium">{user._count?.notesCreated || 0}</span>
                    <span className="text-gray-600">notes</span>
                  </div>

                  {/* Stats d'avis (seulement pour professionnels) */}
                  {(user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') && (
                    <>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">
                          {user.averageRating ? user.averageRating.toFixed(1) : '—'}
                        </span>
                        <span className="text-gray-600">/ 5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4 text-spa-rose-500" />
                        <span className="font-medium">{user._count?.reviewsReceived || 0}</span>
                        <span className="text-gray-600">avis</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions */}
                {user.role === 'ADMIN' ? (
                  <div className="flex items-center justify-center p-4 bg-gradient-to-r from-spa-turquoise-50 to-spa-menthe-50 rounded-lg border border-spa-turquoise-200">
                    <div className="flex items-center gap-2 text-sm text-spa-turquoise-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Compte administrateur protégé</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(user)}
                      className="flex-1 px-3 py-2 bg-spa-lavande-50 text-spa-lavande-700 rounded-lg hover:bg-spa-lavande-100 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => openPasswordModal(user)}
                      className="px-3 py-2 bg-spa-menthe-50 text-spa-menthe-700 rounded-lg hover:bg-spa-menthe-100 transition-colors"
                      title="Réinitialiser le mot de passe"
                    >
                      <Key className="w-4 h-4" />
                    </button>

                    {/* Bouton voir avis (seulement pour professionnels) */}
                    {(user.role === 'MASSOTHERAPEUTE' || user.role === 'ESTHETICIENNE') && (
                      <button
                        onClick={() => openReviewsModal(user)}
                        className="px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                        title="Voir les avis"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleToggleStatus(user)}
                      disabled={isTogglingStatus}
                      className={`
                        px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors
                        ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}
                        ${isTogglingStatus ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      title={user.isActive ? "Désactiver l'employé" : "Activer l'employé"}
                    >
                      {isTogglingStatus
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : (user.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />)
                      }
                    </button>

                    {user.id !== currentUser?.id && (
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
        </div>
        {/* Fin de l'ordre flex */}
      </div>

      {/* Modal Créer Employé */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Nouvel Employé</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800 text-sm">{errors.general}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-spa">Prénom *</label>
                    <input
                      type="text"
                      required
                      value={formData.prenom}
                      onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                      className="input-spa"
                    />
                  </div>
                  <div>
                    <label className="label-spa">Nom *</label>
                    <input
                      type="text"
                      required
                      value={formData.nom}
                      onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                      className="input-spa"
                    />
                  </div>
                </div>

                <div>
                  <label className="label-spa">Courriel *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-spa"
                    placeholder="exemple@spa.com"
                  />
                </div>

                <div>
                  <label className="label-spa">Téléphone *</label>
                  <input
                    type="tel"
                    required
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="input-spa"
                    placeholder="5141234567"
                  />
                </div>

                <div>
                  <label className="label-spa">Rôle *</label>
                  <select
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                    className="input-spa"
                  >
                    <option value="SECRETAIRE">Réceptionniste</option>
                    <option value="MASSOTHERAPEUTE">Massothérapeute</option>
                    <option value="ESTHETICIENNE">Esthéticienne</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>

                {/* Champ adresse - Afficher pour massothérapeutes et esthéticiennes */}
                {(formData.role === 'MASSOTHERAPEUTE' || formData.role === 'ESTHETICIENNE') && (
                  <div>
                    <label className="label-spa">Adresse de résidence *</label>
                    <input
                      type="text"
                      required
                      value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      className="input-spa"
                      placeholder="123 rue Exemple, Ville, Province, Code postal"
                    />
                  </div>
                )}

                {/* Champ numéro RMQ - Afficher seulement pour massothérapeutes */}
                {formData.role === 'MASSOTHERAPEUTE' && (
                  <div>
                    <label className="label-spa">Numéro RMQ *</label>
                    <input
                      type="text"
                      required
                      value={formData.numeroMembreOrdre}
                      onChange={(e) => setFormData({ ...formData, numeroMembreOrdre: e.target.value })}
                      className={`input-spa ${errors.numeroMembreOrdre ? 'border-red-500' : ''}`}
                      placeholder="M-3444 ou 25-1234"
                      pattern="(M-\d{4}|\d{2}-\d{4})"
                      title="Formats requis: M-XXXX (ex: M-3444) ou XX-XXXX (ex: 25-1234)"
                      maxLength={7}
                    />
                    {errors.numeroMembreOrdre ? (
                      <p className="text-xs text-red-600 mt-1">{errors.numeroMembreOrdre}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        Formats acceptés: M-XXXX (ex: M-3444) ou XX-XXXX (ex: 25-1234)
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="label-spa">Mot de passe *</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-spa"
                    placeholder="Minimum 6 caractères"
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Le mot de passe sera affiché une seule fois après la création
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 btn-primary"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Création...
                      </>
                    ) : (
                      'Créer l\'employé'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Mot de passe généré */}
      <AnimatePresence>
        {showPassword && generatedPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Employé créé !</h2>
                <p className="text-gray-600">Notez ce mot de passe, il ne sera plus affiché</p>
              </div>

              <div className="p-4 bg-spa-beige-50 rounded-xl mb-6">
                <p className="text-sm text-gray-600 mb-2">Mot de passe temporaire:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg font-mono text-lg">
                    {generatedPassword}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="px-3 py-2 bg-spa-turquoise-500 text-white rounded-lg hover:bg-spa-turquoise-600 transition-colors"
                  >
                    {copiedPassword ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowPassword(false);
                  setGeneratedPassword('');
                }}
                className="w-full btn-primary"
              >
                J'ai noté le mot de passe
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Modifier - Similar structure */}
      <AnimatePresence>
  {showEditModal && selectedUser && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Modifier l'employé</h2>
          <button
            onClick={() => setShowEditModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleUpdateUser} className="space-y-4">
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Photo de profil */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Photo de profil
            </h3>
            <ProfilePhotoUpload
              currentPhotoUrl={selectedUser?.photoUrl}
              userName={`${formData.prenom} ${formData.nom}`}
              onUpload={handleEmployeePhotoUpload}
              onDelete={handleEmployeePhotoDelete}
              isUploading={isUploadingEmployeePhoto}
              isDeleting={isDeletingEmployeePhoto}
              mode="admin"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-spa">Prénom *</label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="input-spa"
              />
            </div>
            <div>
              <label className="label-spa">Nom *</label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="input-spa"
              />
            </div>
          </div>

          <div>
            <label className="label-spa">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-spa"
            />
          </div>

          <div>
            <label className="label-spa">Téléphone *</label>
            <input
              type="tel"
              required
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              className="input-spa"
            />
          </div>

          <div>
            <label className="label-spa">Rôle *</label>
            <select
              required
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="input-spa"
            >
              <option value="SECRETAIRE">Réceptionniste</option>
              <option value="MASSOTHERAPEUTE">Massothérapeute</option>
              <option value="ESTHETICIENNE">Esthéticienne</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          {/* Champ adresse - Afficher pour massothérapeutes et esthéticiennes */}
          {(formData.role === 'MASSOTHERAPEUTE' || formData.role === 'ESTHETICIENNE') && (
            <div>
              <label className="label-spa">Adresse de résidence *</label>
              <input
                type="text"
                required
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                className="input-spa"
                placeholder="123 rue Exemple, Ville, Province, Code postal"
              />
            </div>
          )}

          {/* Champ numéro RMQ - Afficher seulement pour massothérapeutes */}
          {formData.role === 'MASSOTHERAPEUTE' && (
            <div>
              <label className="label-spa">Numéro RMQ *</label>
              <input
                type="text"
                required
                value={formData.numeroMembreOrdre}
                onChange={(e) => setFormData({ ...formData, numeroMembreOrdre: e.target.value })}
                className={`input-spa ${errors.numeroMembreOrdre ? 'border-red-500' : ''}`}
                placeholder="M-3444"
                pattern="M-\d{4}"
                title="Format requis: M-XXXX (ex: M-3444)"
                maxLength={6}
              />
              {errors.numeroMembreOrdre ? (
                <p className="text-xs text-red-600 mt-1">{errors.numeroMembreOrdre}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Format: M-XXXX (exemple: M-3444)
                </p>
              )}
            </div>
          )}

          <div>
            <label className="label-spa">Mot de passe (laisser vide pour ne pas changer)</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-spa"
              placeholder="Minimum 6 caractères"
              minLength={6}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 btn-primary"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Modification...
                </>
              ) : (
                'Modifier'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>

      {/* Modal Supprimer - Similar structure */}
      <AnimatePresence>
  {showDeleteModal && selectedUser && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Supprimer l'employé</h2>
        <p className="text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer {selectedUser.prenom} {selectedUser.nom} ? Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleDeleteUser}
            disabled={isDeleting}
            className="flex-1 btn-red"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Suppression...
              </>
            ) : (
              'Supprimer'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>

      {/* Modal Réinitialiser mot de passe - Similar structure */}
      <AnimatePresence>
  {showPasswordModal && selectedUser && (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">Réinitialiser le mot de passe</h2>
        <p className="text-gray-600 mb-4">
          Saisissez le nouveau mot de passe pour {selectedUser.prenom} {selectedUser.nom} :
        </p>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="input-spa mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={() => setShowPasswordModal(false)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleResetPassword}
            disabled={isResetting}
            className="flex-1 btn-primary"
          >
            {isResetting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Réinitialisation...
              </>
            ) : (
              'Réinitialiser'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>

        {/* Modal Avis */}
        <AnimatePresence>
          {showReviewsModal && selectedUserForReviews && (
            <ReviewsModal
              userId={selectedUserForReviews.id}
              userName={`${selectedUserForReviews.prenom} ${selectedUserForReviews.nom}`}
              isOpen={showReviewsModal}
              onClose={() => {
                setShowReviewsModal(false);
                setSelectedUserForReviews(null);
              }}
            />
          )}
        </AnimatePresence>

    </div>
  );
}
