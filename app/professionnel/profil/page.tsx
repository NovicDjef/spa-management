'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { User, Lock, Save, Eye, EyeOff, CheckCircle, AlertCircle, Phone, MapPin, IdCard, ArrowLeft, Loader2 } from 'lucide-react';
import { useAppSelector } from '@/lib/redux/hooks';
import { useGetMyProfileQuery, useChangePasswordMutation, useUpdateProfileMutation } from '@/lib/redux/services/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/lib/redux/slices/authSlice';
import { extractErrorMessage, extractSuccessMessage } from '@/lib/utils/errorHandler';

export default function ProfilPage() {
  const router = useRouter();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const token = useAppSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  // Récupérer le profil depuis le backend
  const { data: profileData, isLoading: isLoadingProfile, error: profileLoadError } = useGetMyProfileQuery();

  // Utiliser les données du backend si disponibles, sinon utiliser Redux
  const currentUser = profileData || reduxUser;

  const [changePassword, { isLoading: isChangingPassword }] = useChangePasswordMutation();
  const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateProfileMutation();

  // État pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // État pour la mise à jour du profil
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [telephone, setTelephone] = useState('');
  const [adresse, setAdresse] = useState('');
  const [numeroMembreOrdre, setnumeroMembreOrdre] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Mettre à jour les champs du formulaire quand les données du profil sont chargées
  useEffect(() => {
    if (currentUser) {
      setNom(currentUser.nom || '');
      setPrenom(currentUser.prenom || '');
      setTelephone(currentUser.telephone || '');
      setAdresse(currentUser.adresse || '');
      setnumeroMembreOrdre(currentUser.numeroMembreOrdre || '');
    }
  }, [currentUser]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Veuillez remplir tous les champs');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();

      const successMsg = extractSuccessMessage(response, 'Mot de passe changé avec succès !');
      setPasswordSuccess(successMsg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Masquer le message de succès après 3 secondes
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err, 'Erreur lors du changement de mot de passe');
      setPasswordError(errorMsg);
      console.error('Erreur changement de mot de passe:', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    // Validation pour les massothérapeutes/esthéticiennes
    if (currentUser?.role === 'MASSOTHERAPEUTE' || currentUser?.role === 'ESTHETICIENNE') {
      if (!adresse || adresse.trim() === '') {
        setProfileError('L\'adresse est requise pour pouvoir émettre des reçus d\'assurance');
        return;
      }
    }

    // Validation spécifique pour les massothérapeutes (numéro RMQ obligatoire)
    if (currentUser?.role === 'MASSOTHERAPEUTE') {
      if (!numeroMembreOrdre || numeroMembreOrdre.trim() === '') {
        setProfileError('Le numéro d\'ordre RMQ est requis pour pouvoir émettre des reçus d\'assurance');
        return;
      }

      // Vérifier le format M-XXXX
      const rmqPattern = /^M-\d{4}$/;
      if (!rmqPattern.test(numeroMembreOrdre)) {
        setProfileError('Le numéro RMQ doit être au format M-XXXX (exemple: M-3444)');
        return;
      }
    }

    try {
      const updateData = {
        nom: nom !== currentUser?.nom ? nom : undefined,
        prenom: prenom !== currentUser?.prenom ? prenom : undefined,
        telephone: telephone !== currentUser?.telephone ? telephone : undefined,
        adresse: adresse, // ⭐ Toujours envoyer l'adresse, même si vide
        numeroMembreOrdre: numeroMembreOrdre, // ⭐ Toujours envoyer le numéro d'ordre, même si vide
      };

      console.log('📤 DONNÉES ENVOYÉES AU BACKEND:', updateData);

      const result = await updateProfile(updateData).unwrap();

      console.log('📥 RÉPONSE DU BACKEND:', result);
      console.log('🔍 numeroMembreOrdre dans la réponse:', result.user?.numeroMembreOrdre);

      // Mettre à jour l'utilisateur dans Redux
      if (result.user) {
        dispatch(setCredentials({ user: result.user }));
      }

      const successMsg = extractSuccessMessage(result, 'Profil mis à jour avec succès !');
      setProfileSuccess(successMsg);

      // Masquer le message de succès après 3 secondes
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err: any) {
      const errorMsg = extractErrorMessage(err, 'Erreur lors de la mise à jour du profil');
      setProfileError(errorMsg);
      console.error('Erreur mise à jour profil:', err);
    }
  };

  // Afficher un loader pendant le chargement du profil
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
        <Header user={reduxUser ?? undefined} />
        <div className="container-spa py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-spa-turquoise-500 animate-spin mb-4" />
            <p className="text-gray-600">Chargement de votre profil...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
        <Header />
        <div className="container-spa py-8">
          <p className="text-center text-gray-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
      <Header user={currentUser} />

      <div className="container-spa py-8">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-spa-turquoise-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-spa-turquoise-100 to-spa-turquoise-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-spa-turquoise-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mon Profil</h1>
              <p className="text-gray-600">Gérez vos informations personnelles</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section Informations Personnelles */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card-spa p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-spa-menthe-100 to-spa-menthe-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-spa-menthe-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Informations Personnelles</h2>
            </div>

            {profileError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{profileError}</p>
              </motion.div>
            )}

            {profileSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{profileSuccess}</p>
              </motion.div>
            )}

            {/* Indicateur de champs pré-remplis */}
            {currentUser && (adresse || numeroMembreOrdre || nom || prenom || telephone) && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-sm text-green-800">
                  ✅ Vos informations actuelles sont affichées dans les champs ci-dessous
                </p>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Nom et Prénom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label-spa">Nom</label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    className="input-spa"
                    placeholder="Nom"
                  />
                </div>
                <div>
                  <label className="label-spa">Prénom</label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    className="input-spa"
                    placeholder="Prénom"
                  />
                </div>
              </div>

              {/* Email (lecture seule) */}
              <div>
                <label className="label-spa">Email</label>
                <input
                  type="email"
                  value={currentUser.email}
                  className="input-spa bg-gray-100 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              {/* Téléphone */}
              <div>
                <label className="label-spa">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="input-spa"
                  placeholder="514-123-4567"
                />
              </div>

              {/* Adresse */}
              <div>
                <label className="label-spa">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Adresse
                  {(currentUser.role === 'MASSOTHERAPEUTE' || currentUser.role === 'ESTHETICIENNE') && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                <input
                  type="text"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="input-spa"
                  placeholder="123 Rue Principale, Ville, Province, Code postal"
                />
                {(currentUser.role === 'MASSOTHERAPEUTE' || currentUser.role === 'ESTHETICIENNE') && (
                  <p className="text-xs text-gray-500 mt-1">
                    Requis pour les reçus d'assurance
                  </p>
                )}
              </div>

              {/* Numéro d'ordre (uniquement pour thérapeutes) */}
              {(currentUser.role === 'MASSOTHERAPEUTE' || currentUser.role === 'ESTHETICIENNE') && (
                <div>
                  <label className="label-spa">
                    <IdCard className="w-4 h-4 inline mr-2" />
                    Numéro d'ordre professionnel
                    {currentUser.role === 'MASSOTHERAPEUTE' && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={numeroMembreOrdre}
                    onChange={(e) => setnumeroMembreOrdre(e.target.value)}
                    className="input-spa"
                    placeholder={currentUser.role === 'MASSOTHERAPEUTE' ? "M-3444" : "Votre numéro d'ordre"}
                    maxLength={currentUser.role === 'MASSOTHERAPEUTE' ? 6 : undefined}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {currentUser.role === 'MASSOTHERAPEUTE'
                      ? "⚠️ Requis pour l'envoi de reçus d'assurance. Format: M-XXXX (ex: M-3444)"
                      : "Requis pour l'envoi de reçus d'assurance"}
                  </p>
                  {!numeroMembreOrdre && currentUser.role === 'MASSOTHERAPEUTE' && (
                    <p className="text-xs text-amber-600 mt-1 font-medium">
                      ⚠️ Vous devez ajouter votre numéro RMQ pour pouvoir émettre des reçus
                    </p>
                  )}
                </div>
              )}

              {/* Rôle (lecture seule) */}
              <div>
                <label className="label-spa">Rôle</label>
                <input
                  type="text"
                  value={
                    currentUser.role === 'ADMIN'
                      ? 'Administrateur'
                      : currentUser.role === 'SECRETAIRE'
                      ? 'Secrétaire'
                      : currentUser.role === 'MASSOTHERAPEUTE'
                      ? 'Massothérapeute'
                      : currentUser.role === 'ESTHETICIENNE'
                      ? 'Esthéticienne'
                      : currentUser.role
                  }
                  className="input-spa bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="btn-primary w-full"
              >
                {isUpdatingProfile ? (
                  <>
                    <Save className="w-5 h-5 mr-2 inline animate-pulse" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2 inline" />
                    Enregistrer les modifications
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Section Changement de mot de passe */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card-spa p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-spa-lavande-100 to-spa-lavande-200 rounded-full flex items-center justify-center">
                <Lock className="w-5 h-5 text-spa-lavande-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Changer le mot de passe</h2>
            </div>

            {passwordError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{passwordError}</p>
              </motion.div>
            )}

            {passwordSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-start gap-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{passwordSuccess}</p>
              </motion.div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Mot de passe actuel */}
              <div>
                <label className="label-spa">Mot de passe actuel <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-spa pr-10"
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Nouveau mot de passe */}
              <div>
                <label className="label-spa">Nouveau mot de passe <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-spa pr-10"
                    placeholder="Minimum 6 caractères"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirmer le mot de passe */}
              <div>
                <label className="label-spa">Confirmer le mot de passe <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-spa pr-10"
                    placeholder="Retapez le nouveau mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>Conseils de sécurité :</strong>
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Utilisez au moins 6 caractères</li>
                  <li>Mélangez majuscules et minuscules</li>
                  <li>Ajoutez des chiffres et symboles</li>
                  <li>Ne réutilisez pas d'anciens mots de passe</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="btn-primary w-full"
              >
                {isChangingPassword ? (
                  <>
                    <Lock className="w-5 h-5 mr-2 inline animate-pulse" />
                    Changement en cours...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2 inline" />
                    Changer le mot de passe
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
