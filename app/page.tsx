'use client';

import { motion } from 'framer-motion';
import { User, Briefcase, Sparkles, Star, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-4">
      {/* Logo et titre */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-soft-lg overflow-hidden">
          <img
            src="/logo_spa.svg"
            alt="Spa Renaissance Logo"
            className="w-full h-full object-contain p-2"
          />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
          Spa Renaissance
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
        className="mt-12 text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 glass rounded-full">
          <div className="w-2 h-2 bg-spa-menthe-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-700">
            Plateforme sécurisée et confidentielle
          </span>
        </div>

        {/* Lien vers les avis */}
        {/* <div className="flex justify-center">
          <Link href="/avis">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer group"
            >
              <Star className="w-5 h-5 md:w-6 md:h-6 fill-white" />
              <span className="font-medium text-base md:text-lg">
                Partagez votre expérience
              </span>
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
            </motion.div>
          </Link>
        </div> */}
        <div className="flex justify-center">
  <Link href="/avis">
    <motion.div
      whileTap={{ scale: 0.96 }} // OK sur mobile & tablette
      className="
        inline-flex items-center gap-3
        px-6 py-3 md:px-8 md:py-4
        bg-gradient-to-r from-yellow-400 to-orange-500
        text-white
        rounded-full
        shadow-lg
        transition-all
        cursor-pointer
        group

        /* FIX iPad */
        opacity-100
        backdrop-opacity-100
      "
      // Hover uniquement desktop
      whileHover={{
        scale: typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches ? 1.05 : 1,
      }}
    >
      <Star className="w-5 h-5 md:w-6 md:h-6 fill-white" />
      <span className="font-medium text-base md:text-lg">
        Partagez votre expérience
      </span>
      <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
    </motion.div>
  </Link>
</div>

      </motion.div>

      </div>
      <Footer />
    </div>
  );
}
