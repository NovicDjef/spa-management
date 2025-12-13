'use client';

import { motion } from 'framer-motion';
import { FileText, Clock, User, AlertCircle } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    nom: string;
    prenom: string;
    role: string;
  };
}

interface NotesListProps {
  notes: Note[];
  isLoading?: boolean;
  currentUserId?: string;
}

export function NotesList({ notes, isLoading = false, currentUserId }: NotesListProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInMs / (1000 * 60));
      return `Il y a ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `Il y a ${hours} heure${hours !== 1 ? 's' : ''}`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `Il y a ${days} jour${days !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'MASSOTHERAPEUTE':
        return 'Massothérapeute';
      case 'ESTHETICIENNE':
        return 'Esthéticienne';
      case 'SECRETAIRE':
        return 'Secrétaire';
      case 'ADMIN':
        return 'Administrateur';
      default:
        return role;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'MASSOTHERAPEUTE':
        return 'bg-spa-menthe-100 text-spa-menthe-700';
      case 'ESTHETICIENNE':
        return 'bg-spa-lavande-100 text-spa-lavande-700';
      case 'SECRETAIRE':
        return 'bg-spa-rose-100 text-spa-rose-700';
      case 'ADMIN':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="card-spa p-8 text-center">
        <div className="loading-spinner mx-auto"></div>
        <p className="text-gray-600 mt-4">Chargement des notes...</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card-spa p-8 text-center"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune note pour le moment</h3>
        <p className="text-gray-600">
          Les notes de traitement apparaîtront ici une fois ajoutées par les professionnels.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-spa-rose-500" />
        Historique des notes ({notes.length})
      </h3>

      {notes.map((note, index) => {
        const isOwnNote = currentUserId === note.author.id;

        return (
          <motion.div
            key={note.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`card-spa p-6 ${isOwnNote ? 'ring-2 ring-spa-rose-200' : ''}`}
          >
            {/* En-tête */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-spa-rose-100 to-spa-lavande-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-spa-rose-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-800">
                      {note.author.prenom} {note.author.nom}
                      {isOwnNote && (
                        <span className="ml-2 text-xs text-spa-rose-600 font-normal">(Vous)</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`badge text-xs ${getRoleBadgeColor(note.author.role)}`}>
                      {getRoleLabel(note.author.role)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contenu de la note */}
            <div className="pl-13">
              <div className="p-4 bg-spa-beige-50 rounded-xl">
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
              </div>
            </div>

            {/* Info de traçabilité */}
            {!isOwnNote && (
              <div className="mt-3 pl-13 flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle className="w-3 h-3" />
                <span>Note ajoutée par un autre professionnel - non modifiable</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
