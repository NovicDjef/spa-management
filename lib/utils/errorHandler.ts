/**
 * Extrait le message d'erreur depuis une erreur RTK Query ou une erreur générique
 *
 * @param error - L'objet erreur provenant d'un catch RTK Query
 * @param defaultMessage - Message par défaut si aucun message n'est trouvé
 * @returns Le message d'erreur à afficher à l'utilisateur
 */
export function extractErrorMessage(error: any, defaultMessage: string = 'Une erreur est survenue'): string {
  // Si l'erreur est nulle ou undefined
  if (!error) {
    return defaultMessage;
  }

  // Structure RTK Query FetchBaseQueryError: error.data.message
  if (error.data && typeof error.data.message === 'string') {
    return error.data.message;
  }

  // Structure RTK Query SerializedError: error.message
  if (typeof error.message === 'string') {
    return error.message;
  }

  // Si l'erreur a un champ error qui est une string
  if (typeof error.error === 'string') {
    return error.error;
  }

  // Si l'erreur est directement une string
  if (typeof error === 'string') {
    return error;
  }

  // Erreur réseau (status 0 généralement signifie que le backend n'est pas accessible)
  if (error.status === 0 || error.status === 'FETCH_ERROR') {
    return 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
  }

  // Erreur 401 - Non autorisé
  if (error.status === 401) {
    return 'Session expirée. Veuillez vous reconnecter.';
  }

  // Erreur 403 - Accès interdit
  if (error.status === 403) {
    return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
  }

  // Erreur 404 - Non trouvé
  if (error.status === 404) {
    return 'Ressource non trouvée.';
  }

  // Erreur 500 - Erreur serveur
  if (error.status === 500) {
    return 'Erreur serveur. Veuillez réessayer plus tard.';
  }

  // Si rien n'a fonctionné, retourner le message par défaut
  return defaultMessage;
}

/**
 * Extrait le message de succès depuis une réponse API
 *
 * @param response - La réponse de l'API
 * @param defaultMessage - Message par défaut si aucun message n'est trouvé
 * @returns Le message de succès à afficher à l'utilisateur
 */
export function extractSuccessMessage(response: any, defaultMessage: string = 'Opération réussie'): string {
  // Si la réponse est nulle ou undefined
  if (!response) {
    return defaultMessage;
  }

  // Structure standard: response.message
  if (typeof response.message === 'string') {
    return response.message;
  }

  // Si response.data existe et contient un message
  if (response.data && typeof response.data.message === 'string') {
    return response.data.message;
  }

  // Retourner le message par défaut
  return defaultMessage;
}
