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
  AlertCircle
} from 'lucide-react';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetUserPasswordMutation,
  useToggleUserStatusMutation,
} from '@/lib/redux/services/api';
import { useAppSelector } from '@/lib/redux/hooks';
import { getRoleLabel, getRoleColor } from '@/lib/permissions';

type UserRole = 'ADMIN' | 'SECRETAIRE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE';

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

  // Éviter l'erreur d'hydratation
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redux queries and mutations
  const { data: usersData, isLoading, refetch } = useGetUsersQuery({
    role: roleFilter !== 'ALL' ? roleFilter : undefined,
    search: searchQuery
  });
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetUserPasswordMutation();
  const [toggleUserStatus, { isLoading: isTogglingStatus }] = useToggleUserStatusMutation();

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
    role: 'SECRETAIRE' as UserRole,
    nom: '',
    prenom: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

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
        role: 'SECRETAIRE',
        nom: '',
        prenom: '',
      });
    } catch (error: any) {
      setErrors({ general: error.data?.message || 'Erreur lors de la création' });
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setErrors({});

    try {
      const updateData: any = {
        email: formData.email,
        telephone: formData.telephone,
        nom: formData.nom,
        prenom: formData.prenom,
        role: formData.role,
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
    });
    setShowEditModal(true);
  };

  const openPasswordModal = (user: any) => {
    setSelectedUser(user);
    setFormData({ ...formData, password: '' });
    setShowPasswordModal(true);
  };

  const handleToggleStatus = async (user: any) => {
    if (!user) return;

    // Empêcher l'admin de se désactiver lui-même
    if (user.id === currentUser?.id) {
      alert('⚠️ Vous ne pouvez pas désactiver votre propre compte.');
      return;
    }

    try {
      const result = await toggleUserStatus({ id: user.id }).unwrap();
      // Rafraîchir les données pour obtenir l'état mis à jour
      refetch();
      alert(result.message || 'Statut de l\'employé mis à jour avec succès');
      
      // Mettre à jour localement l'état pour une réponse immédiate
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, isActive: !(u.isActive ?? true) } : u
      ));
    } catch (error: any) {
      console.error('Erreur toggle:', error);
      alert(error.data?.message || 'Erreur lors du changement de statut');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-menthe-50">
      <Header user={currentUser ?? undefined} />

      <div className="container-spa py-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Gestion des Employés</h1>
                <p className="text-gray-600">
                  {users.length} employé{users.length !== 1 ? 's' : ''} au total
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Nouvel Employé
            </button>
          </div>

          {/* Recherche et filtres */}
          <div className="card-spa p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Recherche */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, prénom ou email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spa-turquoise-500 focus:border-transparent"
                />
              </div>

              {/* Filtre par rôle */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-spa-turquoise-500 focus:border-transparent"
                >
                  <option value="ALL">Tous les rôles</option>
                  <option value="ADMIN">Administrateur</option>
                  <option value="SECRETAIRE">Secrétaire</option>
                  <option value="MASSOTHERAPEUTE">Massothérapeute</option>
                  <option value="ESTHETICIENNE">Esthéticienne</option>
                </select>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Liste des employés */}
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
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-800">
                      {user.prenom} {user.nom}
                    </h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                    <p className="text-sm text-gray-600">{user.telephone}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium bg-${getRoleColor(user.role)}/10 text-${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">{user._count?.assignedClients || 0}</span> clients
                  </div>
                  <div>
                    <span className="font-medium">{user._count?.notesCreated || 0}</span> notes
                  </div>
                </div>

                {/* Actions */}
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
                  <button
                    onClick={() => handleToggleStatus(user)}
                    disabled={isTogglingStatus}
                    className={`px-3 py-2 rounded-lg hover:bg-opacity-80 transition-colors ${user.isActive ?? true ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'} ${isTogglingStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={user.isActive ?? true ? "Désactiver l'employé" : "Activer l'employé"}
                  >
                    {isTogglingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : (user.isActive ?? true ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />)}
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
              </motion.div>
            ))}
          </motion.div>
        )}
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
                    <option value="SECRETAIRE">Secrétaire</option>
                    <option value="MASSOTHERAPEUTE">Massothérapeute</option>
                    <option value="ESTHETICIENNE">Esthéticienne</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>

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
      {/* Modal Supprimer - Similar structure */}
      {/* Modal Réinitialiser mot de passe - Similar structure */}
    </div>
  );
}
