'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Enregistrer le Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('✅ Service Worker enregistré:', registration.scope);
          })
          .catch((error) => {
            console.error('❌ Erreur Service Worker:', error);
          });
      });
    }

    // Capturer l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Vérifier si l'app n'est pas déjà installée
      if (!window.matchMedia('(display-mode: standalone)').matches) {
        // Attendre 10 secondes avant d'afficher le prompt
        setTimeout(() => {
          setShowInstallPrompt(true);
        }, 10000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Vérifier si l'app est déjà installée
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installée avec succès');
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Afficher le prompt d'installation
    deferredPrompt.prompt();

    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`Installation: ${outcome}`);

    // Reset le prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);

    // Ne plus afficher pendant 7 jours
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // Vérifier si l'utilisateur a déjà refusé récemment
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);

      if (daysSinceDismissed < 7) {
        setShowInstallPrompt(false);
      }
    }
  }, []);

  return (
    <AnimatePresence>
      {showInstallPrompt && deferredPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
        >
          <div className="bg-gradient-to-r from-spa-rose-500 to-spa-turquoise-500 text-white p-4 rounded-2xl shadow-2xl">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0">
                <img
                  src="/icons/icon-72x72.png"
                  alt="Logo"
                  className="w-10 h-10 rounded-lg"
                />
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  Installer Spa Management
                </h3>
                <p className="text-sm text-white/90 mb-3">
                  Accédez rapidement à l'application depuis votre écran d'accueil
                </p>

                <button
                  onClick={handleInstallClick}
                  className="w-full bg-white text-spa-rose-600 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Installer l'application
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
