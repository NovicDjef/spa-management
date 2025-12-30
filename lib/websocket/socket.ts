import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

/**
 * Initialiser la connexion WebSocket
 * @param token JWT token pour l'authentification
 * @returns Instance Socket.io
 */
export function initializeSocket(token: string): Socket {
  // Si déjà connecté, retourner l'instance existante
  if (socket?.connected) return socket;

  // Extraire l'URL de base (sans /api)
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api', '') || 'http://localhost:5003';

  console.log('🔌 Initialisation WebSocket:', baseUrl);

  // Créer la connexion Socket.io
  socket = io(baseUrl, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 3, // Réduit de 5 à 3 tentatives
    timeout: 5000, // Timeout de 5 secondes
  });

  let isConnected = false;

  // Événements de connexion
  socket.on('connect', () => {
    isConnected = true;
    console.log('✅ WebSocket connecté:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    isConnected = false;
    console.log('❌ WebSocket déconnecté:', reason);
  });

  socket.on('connect_error', (error) => {
    // Ne logger qu'une seule fois au lieu de toutes les tentatives
    if (!isConnected) {
      console.warn('⚠️ WebSocket non disponible (mode hors ligne). Les mises à jour en temps réel sont désactivées.');
      // Désactiver les tentatives de reconnexion après la première erreur
      socket.io.opts.reconnection = false;
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    isConnected = true;
    console.log('🔄 WebSocket reconnecté après', attemptNumber, 'tentatives');
  });

  return socket;
}

/**
 * Récupérer l'instance Socket.io actuelle
 * @returns Instance Socket.io ou null
 */
export function getSocket(): Socket | null {
  return socket;
}

/**
 * Déconnecter le WebSocket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('🔌 WebSocket déconnecté');
  }
}

/**
 * S'abonner à un événement de réservation
 * @param event Type d'événement ('created' | 'updated' | 'cancelled')
 * @param callback Fonction appelée lors de l'événement
 */
export function onBookingEvent(
  event: 'created' | 'updated' | 'cancelled' | 'status_changed',
  callback: (data: any) => void
): void {
  if (!socket) {
    console.warn('⚠️ Socket non initialisé, impossible de s\'abonner à l\'événement:', event);
    return;
  }

  const eventName = `booking:${event}`;
  socket.on(eventName, callback);
  console.log('📡 Abonné à l\'événement:', eventName);
}

/**
 * Se désabonner d'un événement de réservation
 * @param event Type d'événement
 */
export function offBookingEvent(event: 'created' | 'updated' | 'cancelled' | 'status_changed'): void {
  if (!socket) return;

  const eventName = `booking:${event}`;
  socket.off(eventName);
  console.log('🔇 Désabonné de l\'événement:', eventName);
}

/**
 * Émettre un événement vers le serveur
 * @param event Nom de l'événement
 * @param data Données à envoyer
 */
export function emitEvent(event: string, data?: any): void {
  if (!socket || !socket.connected) {
    console.warn('⚠️ Socket non connecté, impossible d\'émettre:', event);
    return;
  }

  socket.emit(event, data);
  console.log('📤 Événement émis:', event, data);
}
