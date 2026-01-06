'use client';

import React from 'react';

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
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizeClass = sizeClasses[size];

  if (photoUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden ${className}`}>
        <img
          src={photoUrl}
          alt={userName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} bg-gradient-to-br from-spa-rose-400 to-spa-lavande-500
        rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {getInitials(userName)}
    </div>
  );
}
