'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { useAddNoteMutation } from '@/lib/redux/services/api';

interface AddNoteFormProps {
  clientId: string;
  onNoteAdded?: () => void;
}

export function AddNoteForm({ clientId, onNoteAdded }: AddNoteFormProps) {
  const [addNote, { isLoading }] = useAddNoteMutation();
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!note.trim()) {
      setError('Veuillez entrer une note');
      return;
    }

    try {
      await addNote({
        clientId,
        content: note.trim(),
      }).unwrap();

      setNote('');
      onNoteAdded?.();
    } catch (err: any) {
      setError(err.data?.message || 'Une erreur est survenue');
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="card-spa p-6"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Ajouter une note</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="note" className="label-spa">
            Votre note de traitement
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => {
              setNote(e.target.value);
              if (error) setError('');
            }}
            placeholder="Décrivez le traitement effectué, les observations, les recommandations..."
            rows={5}
            className={`input-spa resize-none ${error ? 'border-red-500' : ''}`}
            disabled={isLoading}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-600 text-sm mt-2"
            >
              {error}
            </motion.p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {note.length} caractère{note.length !== 1 ? 's' : ''}
          </p>
          <button
            type="submit"
            disabled={isLoading || !note.trim()}
            className="btn-primary flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Ajouter la note
              </>
            )}
          </button>
        </div>

        <div className="p-3 bg-spa-beige-50 rounded-xl text-sm text-gray-600">
          <strong>Note:</strong> Votre nom et la date/heure seront automatiquement enregistrés
          avec cette note. Vous ne pourrez pas modifier les notes une fois ajoutées.
        </div>
      </div>
    </motion.form>
  );
}
