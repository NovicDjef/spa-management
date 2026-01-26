/**
 * Utilitaires pour la gestion des cookies côté client
 */

/**
 * Récupère la valeur d'un cookie par son nom
 * @param name - Le nom du cookie à récupérer
 * @returns La valeur du cookie ou null si non trouvé
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return decodeURIComponent(cookieValue);
    }
  }

  return null;
}

/**
 * Définit un cookie
 * @param name - Le nom du cookie
 * @param value - La valeur du cookie
 * @param options - Options du cookie (expires, path, domain, secure, sameSite)
 */
export function setCookie(
  name: string,
  value: string,
  options: {
    expires?: Date | number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
  } = {}
): void {
  if (typeof document === 'undefined') {
    return;
  }

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.expires) {
    if (typeof options.expires === 'number') {
      const date = new Date();
      date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    } else {
      cookieString += `; expires=${options.expires.toUTCString()}`;
    }
  }

  if (options.path) {
    cookieString += `; path=${options.path}`;
  } else {
    cookieString += '; path=/';
  }

  if (options.domain) {
    cookieString += `; domain=${options.domain}`;
  }

  if (options.secure) {
    cookieString += '; secure';
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`;
  }

  document.cookie = cookieString;
}

/**
 * Supprime un cookie
 * @param name - Le nom du cookie à supprimer
 * @param path - Le chemin du cookie (par défaut: '/')
 */
export function deleteCookie(name: string, path: string = '/'): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}`;
}
