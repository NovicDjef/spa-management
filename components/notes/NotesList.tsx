'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FileText, Clock, User, AlertCircle, Edit2, X, Check, Loader2 } from 'lucide-react';
import { useUpdateNoteMutation } from '@/lib/redux/services/api';
import { ProfilePhotoDisplay } from '@/components/profile/ProfilePhotoDisplay';

interface Note {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    nom: string;
    prenom: string;
    role: string;
    photoUrl?: string;
  };
}

interface NotesListProps {
  notes: Note[];
  isLoading?: boolean;
  currentUserId?: string;
  currentUserRole?: string;
}

export function NotesList({ notes, isLoading = false, currentUserId, currentUserRole }: NotesListProps) {
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  // Vérifier si une note peut être modifiée (24h + auteur + rôle MASSOTHERAPEUTE ou ADMIN)
  const canEditNote = (note: Note): boolean => {
    if (!currentUserId || !currentUserRole) return false;
    
    // Vérifier que c'est la note de l'utilisateur actuel
    if (note.author.id !== currentUserId) return false;
    
    // Vérifier le rôle (MASSOTHERAPEUTE ou ADMIN)
    if (currentUserRole !== 'MASSOTHERAPEUTE' && currentUserRole !== 'ADMIN') return false;
    
    // Vérifier que moins de 24h se sont écoulées
    const noteDate = new Date(note.createdAt);
    const now = new Date();
    const diffInMs = now.getTime() - noteDate.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    
    return diffInHours < 24;
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      await updateNote({
        noteId,
        content: editContent.trim(),
      }).unwrap();
      setEditingNoteId(null);
      setEditContent('');
    } catch (error) {
      console.error('Erreur lors de la modification de la note:', error);
    }
  };

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
        const canEdit = canEditNote(note);
        const isEditing = editingNoteId === note.id;

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
              <div className="flex items-start gap-3 flex-1">
                <ProfilePhotoDisplay
                  photoUrl={note.author.photoUrl || null}
                  userName={`${note.author.prenom} ${note.author.nom}`}
                  size="md"
                  className="flex-shrink-0"
                />
                <div className="flex-1">
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
              {/* Bouton de modification */}
              {canEdit && !isEditing && (
                <button
                  onClick={() => handleStartEdit(note)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-spa-menthe-600 hover:text-spa-menthe-700 hover:bg-spa-menthe-50 rounded-lg transition-colors"
                  title="Modifier la note (disponible pendant 24h)"
                >
                  <Edit2 className="w-4 h-4" />
                  Modifier
                </button>
              )}
            </div>

            {/* Contenu de la note ou formulaire d'édition */}
            <div className="pl-13">
              {isEditing ? (
                <div className="space-y-3">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={5}
                    className="input-spa resize-none w-full"
                    disabled={isUpdating}
                    placeholder="Modifier votre note..."
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                    <button
                      onClick={() => handleSaveEdit(note.id)}
                      disabled={isUpdating || !editContent.trim()}
                      className="px-4 py-2 text-sm bg-spa-menthe-500 text-white hover:bg-spa-menthe-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enregistrement...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Enregistrer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-spa-beige-50 rounded-xl">
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              )}
            </div>

            {/* Info de traçabilité */}
            {!isOwnNote && !isEditing && (
              <div className="mt-3 pl-13 flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle className="w-3 h-3" />
                <span>
                  Note ajoutée par <strong>{note.author.prenom} {note.author.nom}</strong> - non modifiable
                </span>
              </div>
            )}
            {isOwnNote && !canEdit && !isEditing && (
              <div className="mt-3 pl-13 flex items-center gap-2 text-xs text-gray-500">
                <AlertCircle className="w-3 h-3" />
                <span>La modification n'est plus disponible (délai de 24h dépassé)</span>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
