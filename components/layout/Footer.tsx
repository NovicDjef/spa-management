'use client';

import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="container-spa">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Copyright */}
          <div className="text-center sm:text-left">
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} Spa Renaissance. Tous droits réservés.
            </p>
          </div>

          {/* Développeur */}
          <div className="text-center sm:text-right">
            <p className="text-sm text-gray-600 flex items-center gap-2 justify-center sm:justify-end">
              Développé par{' '}
              <a
                href="https://novic.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-spa-turquoise-600 hover:text-spa-turquoise-700 font-medium transition-colors group"
              >
                Novic.dev
                <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
