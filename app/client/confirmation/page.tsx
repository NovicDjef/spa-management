'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Mail, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ConfirmationPage() {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after 3 seconds
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: Math.random() * 360,
                opacity: 0,
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'linear',
              }}
              className={`absolute w-2 h-2 rounded-full ${
                ['bg-spa-rose-400', 'bg-spa-lavande-400', 'bg-spa-menthe-400', 'bg-spa-beige-300'][
                  Math.floor(Math.random() * 4)
                ]
              }`}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl w-full">
        {/* Icône de succès */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2,
          }}
          className="flex justify-center mb-8"
        >
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-spa-menthe-400 to-spa-menthe-600 rounded-full flex items-center justify-center shadow-soft-lg">
              <CheckCircle className="w-20 h-20 text-white" />
            </div>
            {/* Pulsing ring */}
            <motion.div
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeOut',
              }}
              className="absolute inset-0 bg-spa-menthe-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* Message de confirmation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Dossier créé avec succès !
          </h1>
          <p className="text-xl text-gray-600">
            Merci d'avoir rempli votre dossier client
          </p>
        </motion.div>

        {/* Carte d'information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-spa p-8 mb-8"
        >
          <div className="space-y-6">
            {/* Email de confirmation */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-spa-rose-100 to-spa-rose-200 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-spa-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Email de confirmation envoyé
                </h3>
                <p className="text-gray-600">
                  Vous allez recevoir un email de confirmation à l'adresse que vous avez fournie.
                  Vérifiez votre boîte de réception et vos spams.
                </p>
              </div>
            </div>

            {/* Prochaines étapes */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-spa-lavande-100 to-spa-lavande-200 rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-spa-lavande-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">
                  Que se passe-t-il maintenant ?
                </h3>
                <ul className="text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-spa-menthe-500 mt-1">•</span>
                    <span>Notre équipe a reçu votre dossier et le consultera avant votre rendez-vous</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spa-menthe-500 mt-1">•</span>
                    <span>Un professionnel sera assigné à votre dossier selon votre type de service</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-spa-menthe-500 mt-1">•</span>
                    <span>Vos informations sont sécurisées et resteront confidentielles</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Message de remerciement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass rounded-2xl p-6 mb-8 text-center"
        >
          <p className="text-gray-700 leading-relaxed">
            <span className="font-semibold text-spa-rose-600">
              Merci de votre confiance !
            </span>
            <br />
            Nous avons hâte de vous accueillir au{' '}
            <span className="font-semibold">Spa Renaissance</span> pour prendre soin de vous.
            Votre bien-être est notre priorité.
          </p>
        </motion.div>

        {/* Boutons d'action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/" className="btn-primary flex items-center justify-center gap-2">
            Retour à l'accueil
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>

        {/* Info contact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-12 text-center text-sm text-gray-500"
        >
          <p>Des questions ? Contactez-nous</p>
          <p className="mt-1">
            <a href="mailto:contact@sparenaissance.com" className="text-spa-rose-600 hover:text-spa-rose-700 transition-colors">
              contact@sparenaissance.com
            </a>
            {' • '}
            <a href="tel:+15141234567" className="text-spa-rose-600 hover:text-spa-rose-700 transition-colors">
              (514) 123-4567
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
