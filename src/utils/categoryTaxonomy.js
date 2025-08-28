// Centralized, table-driven taxonomy for wellness categories and synonyms.
// Extend this map as taxonomy grows; prefer lowercase keys.
export const CATEGORY_SYNONYMS = {
  breathing: ['breathing', 'mindfulness', 'relaxation', 'stress_management', 'respiration'],
  mindfulness: ['mindfulness', 'meditation', 'relaxation', 'breathing'],
  movement: ['movement', 'activity', 'exercise', 'fitness', 'yoga', 'stretching'],
  gratitude: ['gratitude', 'journaling', 'thanks', 'appreciation'],
  reflection: ['reflection', 'journaling', 'introspection'],
};

export const canonicalizeCategory = (cat) => {
  if (!cat) return null;
  const c = String(cat).toLowerCase();
  if (CATEGORY_SYNONYMS[c]) return c;
  // Find containing synonym
  for (const [key, arr] of Object.entries(CATEGORY_SYNONYMS)) {
    if (arr.includes(c)) return key;
  }
  return c;
};

export const getSynonyms = (cat) => {
  const canon = canonicalizeCategory(cat);
  return CATEGORY_SYNONYMS[canon] || [canon];
};

export const findMatchingGoalByTaxonomy = (goals, resource) => {
  const candidates = getSynonyms(resource?.category);
  return (goals || []).find((g) => candidates.includes(String(g?.category || '').toLowerCase()));
};
