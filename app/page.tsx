'use client';

import { motion } from 'framer-motion';
import { User, Briefcase, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Logo et titre */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-spa-rose-400 to-spa-lavande-400 rounded-full mb-4 shadow-soft-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
          Gestion de Spa
        </h1>
        <p className="text-gray-600 text-lg">
          Massothérapie & Soins Esthétiques
        </p>
      </motion.div>

      {/* Sélection du type d'utilisateur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Carte Client */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/client/nouveau">
            <div className="card-spa group hover:scale-105 cursor-pointer min-h-[300px] flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-spa-rose-100 to-spa-rose-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <User className="w-12 h-12 text-spa-rose-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Je suis un Client
              </h2>
              <p className="text-gray-600 mb-6">
                Créez votre dossier client pour vos rendez-vous
              </p>
              <div className="inline-flex items-center text-spa-rose-600 font-medium group-hover:gap-3 gap-2 transition-all">
                Commencer
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Carte Professionnel */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/professionnel/connexion">
            <div className="card-spa group hover:scale-105 cursor-pointer min-h-[300px] flex flex-col items-center justify-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-spa-lavande-100 to-spa-lavande-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-12 h-12 text-spa-lavande-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Je suis un Professionnel
              </h2>
              <p className="text-gray-600 mb-6">
                Accédez à votre espace de gestion des clients
              </p>
              <div className="inline-flex items-center text-spa-lavande-600 font-medium group-hover:gap-3 gap-2 transition-all">
                Se connecter
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Info complémentaire */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 glass rounded-full">
          <div className="w-2 h-2 bg-spa-menthe-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700">
            Plateforme sécurisée et confidentielle
          </span>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-16 text-center text-sm text-gray-500"
      >
        <p>© 2024 Gestion de Spa - Tous droits réservés</p>
        <p className="mt-2">Système de gestion conforme aux normes de confidentialité</p>
      </motion.footer>
    </div>
  );
}
