'use client';

import { motion } from 'framer-motion';
import { Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ReviewForm } from '@/components/reviews/ReviewForm';
import { Footer } from '@/components/layout/Footer';

export default function AvisPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-spa-beige-50 via-white to-spa-turquoise-50">
      <div className="flex-1 p-4">
      {/* Header simplifié */}
      <div className="container-spa py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-spa-turquoise-600 hover:text-spa-turquoise-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-soft overflow-hidden">
              <img
                src="/logo_spa.svg"
                alt="Spa Renaissance Logo"
                className="w-full h-full object-contain p-2"
              />
          </div>

          <h1 className="text-4xl font-bold gradient-text mb-3">
            Spa Renaissance
          </h1>

          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Star className="w-5 h-5 text-yellow-500" />
            <p className="text-lg">Partagez votre expérience</p>
          </div>

          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
            Votre avis compte et nous aide à améliorer nos services. Votre
            retour est anonyme et confidentiel.
          </p>
        </motion.div>
      </div>

      {/* Formulaire */}
      <div className="container-spa pb-12">
        <ReviewForm />
      </div>

      </div>
      <Footer />
    </div>
  );
}
