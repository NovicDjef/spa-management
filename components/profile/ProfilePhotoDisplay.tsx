'use client';

import React, { useState, useEffect } from 'react';

interface ProfilePhotoDisplayProps {
  photoUrl?: string | null;
  userName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-2xl',
};

export function ProfilePhotoDisplay({
  photoUrl,
  userName,
  size = 'md',
  className = ''
}: ProfilePhotoDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getFullPhotoUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;

    // Si l'URL est déjà complète (commence par http:// ou https://), la retourner telle quelle
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // Utiliser l'URL de base dédiée pour les photos de profil
    const photoBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL_PHOTO_PROFILE || 'http://localhost:5003';

    // Assurer qu'il n'y a pas de double slash
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    return `${photoBaseUrl}${cleanUrl}`;
  };

  const sizeClass = sizeClasses[size];
  const fullPhotoUrl = getFullPhotoUrl(photoUrl);

  // Réinitialiser l'état d'erreur quand l'URL change
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [photoUrl]);

  // Si pas de photo, afficher les initiales
  if (!fullPhotoUrl) {
    return (
      <div
        className={`${sizeClass} bg-gradient-to-br from-spa-rose-400 to-spa-lavande-500
          rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      >
        {getInitials(userName)}
      </div>
    );
  }

  // Afficher la photo avec fallback sur initiales en cas d'erreur
  return (
    <div className={`${sizeClass} rounded-full overflow-hidden relative ${className}`}>
      {/* Afficher les initiales en arrière-plan tant que l'image ne charge pas */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-spa-rose-400 to-spa-lavande-500 flex items-center justify-center text-white font-semibold">
          {getInitials(userName)}
        </div>
      )}

      {/* Afficher les initiales si erreur */}
      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-spa-rose-400 to-spa-lavande-500 flex items-center justify-center text-white font-semibold">
          {getInitials(userName)}
        </div>
      )}

      {/* Image */}
      {!imageError && (
        <img
          key={photoUrl} // Force re-render quand l'URL change
          src={fullPhotoUrl}
          alt={userName}
          className={`w-full h-full object-cover ${imageLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => {
            setImageLoaded(true);
          }}
          onError={() => {
            setImageError(true);
          }}
        />
      )}
    </div>
  );
}
