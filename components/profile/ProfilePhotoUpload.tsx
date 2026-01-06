'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, X, Loader2 } from 'lucide-react';
import { ProfilePhotoDisplay } from './ProfilePhotoDisplay';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  userName: string;
  onUpload: (file: File) => Promise<void>;
  onDelete: () => Promise<void>;
  isUploading?: boolean;
  isDeleting?: boolean;
  mode?: 'self' | 'admin';
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  userName,
  onUpload,
  onDelete,
  isUploading = false,
  isDeleting = false,
  mode = 'self'
}: ProfilePhotoUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!validTypes.includes(file.type)) {
      return 'Format invalide. Utilisez JPEG, PNG ou WebP.';
    }

    if (file.size > maxSize) {
      return 'Fichier trop volumineux. Maximum 5 MB.';
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      await onUpload(selectedFile);
      setPreview(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      // Error handled by parent
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete();
    } catch (err) {
      // Error handled by parent
    }
  };

  const handleCancelPreview = () => {
    setPreview(null);
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Current Photo Display */}
      <div className="flex items-center justify-center">
        <ProfilePhotoDisplay
          photoUrl={currentPhotoUrl}
          userName={userName}
          size="xl"
        />
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 bg-spa-beige-50 rounded-xl border-2 border-spa-turquoise-200"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-700">Aperçu</p>
              <button
                onClick={handleCancelPreview}
                className="p-1 hover:bg-white rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex items-center justify-center mb-3">
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 rounded-full object-cover shadow-md"
              />
            </div>
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Téléversement...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Téléverser
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      {!preview && (
        <div className="flex gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            id="photo-upload"
          />
          <label
            htmlFor="photo-upload"
            className="flex-1 px-4 py-3 bg-spa-turquoise-50 text-spa-turquoise-700 rounded-xl
              hover:bg-spa-turquoise-100 transition-colors cursor-pointer flex items-center
              justify-center gap-2 font-medium"
          >
            <Camera className="w-5 h-5" />
            Choisir une photo
          </label>

          {currentPhotoUrl && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100
                transition-colors flex items-center justify-center gap-2 font-medium"
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Supprimer
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Format Info */}
      <p className="text-xs text-center text-gray-500">
        Formats acceptés : JPEG, PNG, WebP (max 5 MB)
      </p>
    </div>
  );
}
