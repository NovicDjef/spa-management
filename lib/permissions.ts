// Système de gestion des permissions basé sur les rôles

export type Role = 'ADMIN' | 'SECRETAIRE' | 'MASSOTHERAPEUTE' | 'ESTHETICIENNE' | 'CLIENT';

export const PERMISSIONS = {
  // Permissions liées aux clients
  VIEW_ALL_CLIENTS: ['ADMIN', 'SECRETAIRE'],
  VIEW_ASSIGNED_CLIENTS: ['ADMIN', 'SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'],
  CREATE_CLIENT: ['PUBLIC'], // PUBLIC signifie que n'importe qui peut créer un client
  EDIT_CLIENT: ['ADMIN'], // Seul l'admin peut modifier les clients
  DELETE_CLIENT: ['ADMIN'], // Seul l'admin peut supprimer les clients

  // Permissions liées aux assignations
  ASSIGN_CLIENTS: ['ADMIN', 'SECRETAIRE'],
  VIEW_ASSIGNMENTS: ['ADMIN', 'SECRETAIRE'],

  // Permissions liées aux notes
  ADD_NOTE: ['ADMIN', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'], // SECRETAIRE RETIRÉ
  VIEW_NOTES: ['ADMIN', 'SECRETAIRE', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'],
  EDIT_OWN_NOTE: ['ADMIN', 'MASSOTHERAPEUTE', 'ESTHETICIENNE'], // Peuvent éditer leurs propres notes
  DELETE_NOTE: ['ADMIN'], // Seul l'admin peut supprimer les notes

  // Permissions liées aux professionnels
  VIEW_PROFESSIONALS: ['ADMIN', 'SECRETAIRE'],
  MANAGE_PROFESSIONALS: ['ADMIN'],

  // Permissions liées aux employés (NOUVEAU)
  CREATE_USER: ['ADMIN'],
  VIEW_USERS: ['ADMIN'],
  EDIT_USER: ['ADMIN'],
  DELETE_USER: ['ADMIN'],
  RESET_PASSWORD: ['ADMIN'],

  // Permissions marketing (ADMIN uniquement)
  VIEW_MARKETING: ['ADMIN'],
  SEND_MARKETING_EMAIL: ['ADMIN'],
  EXPORT_CLIENT_DATA: ['ADMIN'],

  // Permissions d'administration
  FULL_ACCESS: ['ADMIN'],
} as const;

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export function hasPermission(userRole: Role | string | undefined | null, permission: keyof typeof PERMISSIONS): boolean {
  if (!userRole) return false;

  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles.includes(userRole as any);
}

/**
 * Vérifie si l'utilisateur est admin
 */
export function isAdmin(userRole: Role | string | undefined | null): boolean {
  return userRole === 'ADMIN';
}

/**
 * Vérifie si l'utilisateur est admin ou secrétaire
 */
export function isAdminOrSecretary(userRole: Role | string | undefined | null): boolean {
  return userRole === 'ADMIN' || userRole === 'SECRETAIRE';
}

/**
 * Vérifie si l'utilisateur est un professionnel (massothérapeute ou esthéticienne)
 */
export function isProfessional(userRole: Role | string | undefined | null): boolean {
  return userRole === 'MASSOTHERAPEUTE' || userRole === 'ESTHETICIENNE';
}

/**
 * Vérifie si un utilisateur peut voir un client spécifique
 * Les admins et secrétaires peuvent voir tous les clients
 * Les professionnels peuvent voir uniquement leurs clients assignés
 */
export function canViewClient(userRole: Role | string | undefined | null, isAssigned: boolean = false): boolean {
  if (!userRole) return false;

  // Admin et secrétaire peuvent voir tous les clients
  if (isAdminOrSecretary(userRole)) return true;

  // Les professionnels peuvent voir uniquement leurs clients assignés
  if (isProfessional(userRole)) return isAssigned;

  return false;
}

/**
 * Vérifie si un utilisateur peut ajouter une note à un client
 */
export function canAddNote(userRole: Role | string | undefined | null, isAssigned: boolean = false): boolean {
  if (!userRole) return false;

  // Admin et secrétaire peuvent ajouter des notes à tous les clients
  if (isAdminOrSecretary(userRole)) return true;

  // Les professionnels peuvent ajouter des notes uniquement à leurs clients assignés
  if (isProfessional(userRole)) return isAssigned;

  return false;
}

/**
 * Vérifie si un utilisateur peut éditer ou supprimer une note
 */
export function canEditNote(userRole: Role | string | undefined | null, noteAuthorId: string, userId: string): boolean {
  if (!userRole) return false;

  // Seul l'admin peut éditer/supprimer toutes les notes
  if (isAdmin(userRole)) return true;

  // Personne d'autre ne peut éditer les notes (pas même les leurs)
  return false;
}

/**
 * Retourne le label français d'un rôle
 */
export function getRoleLabel(role: Role | string): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrateur';
    case 'SECRETAIRE':
      return 'Secrétaire';
    case 'MASSOTHERAPEUTE':
      return 'Massothérapeute';
    case 'ESTHETICIENNE':
      return 'Esthéticienne';
    case 'CLIENT':
      return 'Client';
    default:
      return role;
  }
}

/**
 * Retourne la couleur associée à un rôle
 */
export function getRoleColor(role: Role | string): string {
  switch (role) {
    case 'ADMIN':
      return 'gray-800';
    case 'SECRETAIRE':
      return 'spa-turquoise-500';
    case 'MASSOTHERAPEUTE':
      return 'spa-menthe-500';
    case 'ESTHETICIENNE':
      return 'spa-lavande-500';
    default:
      return 'gray-500';
  }
}
