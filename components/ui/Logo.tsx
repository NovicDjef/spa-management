'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
  xl: 'w-20 h-20',
};

/**
 * Composant Logo réutilisable
 * Affiche le logo Spa Renaissance depuis /icons/
 */
export function Logo({ size = 'md', className = '' }: LogoProps) {
  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden shadow-soft ${className}`}>
      <img
        src="/icons/icon-192x192.png"
        alt="Spa Renaissance Logo"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
