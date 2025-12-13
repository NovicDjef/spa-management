'use client';

import { motion } from 'framer-motion';
import { Sparkles, Heart } from 'lucide-react';
import Link from 'next/link';

export default function SelectServicePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-spa-rose-400 to-spa-lavande-400 rounded-full mb-4 shadow-soft-lg">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-3">
          Nouveau Dossier Client
        </h1>
        <p className="text-gray-600 text-lg">
          Choisissez le type de service pour votre dossier
        </p>
      </motion.div>

      {/* Sélection du service */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {/* Massothérapie */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/client/nouveau/massotherapie">
            <div className="card-spa group hover:scale-105 cursor-pointer min-h-[350px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-spa-menthe-100 to-spa-menthe-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-12 h-12 text-spa-menthe-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Massothérapie
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Créez votre dossier pour les soins de massothérapie, gestion de la douleur et bien-être corporel
              </p>
              <span className="inline-flex items-center px-4 py-2 bg-spa-menthe-100 text-spa-menthe-700 rounded-full text-sm font-medium">
                Commencer le formulaire
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Esthétique */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link href="/client/nouveau/esthetique">
            <div className="card-spa group hover:scale-105 cursor-pointer min-h-[350px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-spa-lavande-100 to-spa-lavande-200 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-12 h-12 text-spa-lavande-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                Soins Esthétiques
              </h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Créez votre dossier pour les soins esthétiques La Biosthetique et soins de la peau
              </p>
              <span className="inline-flex items-center px-4 py-2 bg-spa-lavande-100 text-spa-lavande-700 rounded-full text-sm font-medium">
                Commencer le formulaire
              </span>
            </div>
          </Link>
        </motion.div>
      </div>

      {/* Info sécurité */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 glass rounded-full">
          <div className="w-2 h-2 bg-spa-menthe-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700">
            Vos informations sont sécurisées et confidentielles
          </span>
        </div>
      </motion.div>

      {/* Bouton retour */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8"
      >
        <Link
          href="/"
          className="text-spa-rose-600 hover:text-spa-rose-700 font-medium transition-colors"
        >
          ← Retour à l'accueil
        </Link>
      </motion.div>
    </div>
  );
}
