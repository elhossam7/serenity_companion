// Simple localStorage-based cache for last-synced reads (privacy-friendly, user-scoped)
// Keys are namespaced by userId to avoid accidental cross-user leaks.

const ns = (userId, key) => `sc:${userId || 'anon'}:${key}`;

export const offlineCache = {
  set(userId, key, value) {
    try {
      const payload = { v: 1, t: Date.now(), value };
      localStorage.setItem(ns(userId, key), JSON.stringify(payload));
    } catch (_) {}
  },
  get(userId, key) {
    try {
      const raw = localStorage.getItem(ns(userId, key));
      if (!raw) return undefined;
      const parsed = JSON.parse(raw);
      return parsed?.value;
    } catch (_) {
      return undefined;
    }
  },
  remove(userId, key) {
    try { localStorage.removeItem(ns(userId, key)); } catch (_) {}
  }
};
