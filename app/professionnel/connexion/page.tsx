'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InputField } from '@/components/forms/FormFields';
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useLoginMutation } from '@/lib/redux/services/api';

export default function ConnexionPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Le courriel est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Le courriel n\'est pas valide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) return;

    // try {
      router.push('/professionnel/dashboard');
    //   const result = await login(formData).unwrap();

    //   // Redirect based on user role
    //   if (result.user.role === 'SECRETAIRE' || result.user.role === 'ADMIN') {
    //     router.push('/professionnel/dashboard');
    //   } else {
    //     router.push('/professionnel/clients');
    //   }
    // } catch (error: any) {
    //   console.error('Erreur de connexion:', error);
    //   setGeneralError(error.data?.message || 'Identifiants invalides. Veuillez vérifier vos informations.');
    // }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* En-tête */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-spa-lavande-400 to-spa-lavande-600 rounded-full mb-4 shadow-soft-lg">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-3">
            Espace Professionnel
          </h1>
          <p className="text-gray-600 text-lg">
            Connectez-vous à votre compte
          </p>
        </motion.div>

        {/* Formulaire */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="card-spa p-8">
            {/* Erreur générale */}
            {generalError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-medium">Erreur de connexion</p>
                  <p className="text-red-600 text-sm mt-1">{generalError}</p>
                </div>
              </motion.div>
            )}

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-4 top-[46px] w-5 h-5 text-gray-400 z-10" />
              <InputField
                label="Courriel"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="votre.email@spa.com"
                required
                className="[&_input]:pl-12"
              />
            </div>

            {/* Password */}
            <div className="relative mt-6">
              <Lock className="absolute left-4 top-[46px] w-5 h-5 text-gray-400 z-10" />
              <InputField
                label="Mot de passe"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="••••••••"
                required
                className="[&_input]:pl-12"
              />
            </div>

            {/* Mot de passe oublié */}
            <div className="mt-4 text-right">
              <a
                href="#"
                className="text-sm text-spa-lavande-600 hover:text-spa-lavande-700 transition-colors"
              >
                Mot de passe oublié?
              </a>
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 btn-primary flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>

            {/* Info sécurité */}
            <div className="mt-6 p-4 bg-spa-beige-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-spa-menthe-500 rounded-full"></div>
                <span>Connexion sécurisée et cryptée</span>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Liens */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center space-y-4"
        >
          <div className="text-sm text-gray-600">
            Nouveau membre de l'équipe?{' '}
            <span className="text-gray-500">Contactez votre administrateur</span>
          </div>

          <a
            href="/"
            className="inline-block text-spa-rose-600 hover:text-spa-rose-700 font-medium transition-colors"
          >
            ← Retour à l'accueil
          </a>
        </motion.div>

        {/* Comptes de test */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Comptes de test disponibles
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-800 mb-1">Admin - Accès complet</div>
                <div className="text-gray-600">admin@spa.com / admin123</div>
              </div>
              <div className="p-3 bg-spa-rose-50 rounded-lg">
                <div className="font-medium text-gray-800 mb-1">Secrétaire - Gestion + Assignations</div>
                <div className="text-gray-600">secretaire@spa.com / secretaire123</div>
              </div>
              <div className="p-3 bg-spa-menthe-50 rounded-lg">
                <div className="font-medium text-gray-800 mb-1">Massothérapeute - Clients assignés</div>
                <div className="text-gray-600">masso1@spa.com / masso123</div>
              </div>
              <div className="p-3 bg-spa-lavande-50 rounded-lg">
                <div className="font-medium text-gray-800 mb-1">Esthéticienne - Clients assignés</div>
                <div className="text-gray-600">esthetique1@spa.com / esthetique123</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info rôles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8"
        >
          <div className="glass rounded-2xl p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Permissions par rôle</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-gray-800 rounded-full mt-1.5"></div>
                <div>
                  <span className="font-medium text-gray-800">Admin:</span>
                  <span className="text-gray-600"> Tous les droits - Gestion complète</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-spa-rose-500 rounded-full mt-1.5"></div>
                <div>
                  <span className="font-medium text-gray-800">Secrétaire:</span>
                  <span className="text-gray-600"> Voir tous les clients, assigner aux professionnels</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-spa-menthe-500 rounded-full mt-1.5"></div>
                <div>
                  <span className="font-medium text-gray-800">Massothérapeute:</span>
                  <span className="text-gray-600"> Voir clients assignés, ajouter des notes</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-spa-lavande-500 rounded-full mt-1.5"></div>
                <div>
                  <span className="font-medium text-gray-800">Esthéticienne:</span>
                  <span className="text-gray-600"> Voir clients assignés, ajouter des notes</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
