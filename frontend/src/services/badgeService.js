import { BADGES } from '../constants/badges';

const STORAGE_KEY = 'tcc_badges_unlocked';

/** Retorna array de IDs desbloqueados */
export function getUnlockedBadges() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/** Verifica se um badge já foi desbloqueado */
export function isUnlocked(badgeId) {
  return getUnlockedBadges().includes(badgeId);
}

/**
 * Desbloqueia um badge e dispara evento global 'badge-unlocked'.
 * Retorna true se foi desbloqueado agora, false se já existia.
 */
export function unlockBadge(badgeId) {
  const unlocked = getUnlockedBadges();
  if (unlocked.includes(badgeId)) return false; // já tinha

  const badge = BADGES.find(b => b.id === badgeId);
  if (!badge) return false;

  const novaLista = [...unlocked, badgeId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(novaLista));

  // Dispara evento global que BadgeNotification vai escutar
  window.dispatchEvent(
    new CustomEvent('badge-unlocked', { detail: badge })
  );

  return true;
}
