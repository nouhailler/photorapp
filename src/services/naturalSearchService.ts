import type { SearchFilters } from './searchEngine';

export interface ParsedNaturalQuery {
  extractedFilters: SearchFilters;
  semanticTags: string[];
  inferredSeason?: 'hiver' | 'printemps' | 'été' | 'automne';
  inferredCategory?: string;
  originalQuery: string;
}

const SEASON_MONTHS: Record<string, number[]> = {
  hiver: [12, 1, 2],
  winter: [12, 1, 2],
  printemps: [3, 4, 5],
  spring: [3, 4, 5],
  ete: [6, 7, 8],
  été: [6, 7, 8],
  summer: [6, 7, 8],
  automne: [9, 10, 11],
  autumn: [9, 10, 11],
  fall: [9, 10, 11],
};

const SCENE_SYNONYMS: Record<string, string[]> = {
  montagne: ['montagne', 'sommet', 'neige', 'alpes', 'nature'],
  plage: ['plage', 'mer', 'océan', 'sable', 'côte', 'eau'],
  mer: ['mer', 'océan', 'plage', 'eau', 'côte'],
  foret: ['forêt', 'bois', 'arbres', 'nature', 'verdure'],
  forêt: ['forêt', 'bois', 'arbres', 'nature', 'verdure'],
  ville: ['ville', 'urbain', 'architecture', 'bâtiment', 'rue'],
  batiment: ['bâtiment', 'architecture', 'immeuble', 'monument', 'ville'],
  bâtiment: ['bâtiment', 'architecture', 'immeuble', 'monument', 'ville'],
  coucher: ['coucher de soleil', 'crépuscule', 'doré'],
  nuit: ['nuit', 'nocturne', 'sombre'],
  portrait: ['portrait', 'personne', 'visage', 'gens'],
  chien: ['chien', 'animal', 'faune'],
  chat: ['chat', 'animal', 'faune'],
  animal: ['animal', 'faune', 'sauvage'],
  voiture: ['voiture', 'véhicule', 'auto'],
  fleur: ['fleur', 'nature', 'jardin', 'plante'],
  jardin: ['jardin', 'parc', 'nature', 'verdure', 'fleur'],
};

/**
 * Parses natural language input queries in French & English into structured search filters.
 * Enables queries like "Photos de montagnes en hiver", "Chiens dans un jardin", "Bâtiments anciens", "Voitures rouges".
 */
export function parseNaturalLanguageQuery(inputQuery: string): ParsedNaturalQuery {
  const cleanInput = inputQuery.trim().toLowerCase();
  const filters: SearchFilters = {};
  const semanticTags: string[] = [];

  // Remove common French stop words
  const stopWords = new Set([
    'photos', 'photo', 'de', 'des', 'du', 'la', 'le', 'les', 'en', 'dans', 'un', 'une', 'sur', 'avec', 'par',
    'prises', 'prise', 'mes', 'au', 'aux', 'qui', 'sont'
  ]);

  const rawTokens = cleanInput.split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter((token) => !stopWords.has(token));

  // 1. Detect Favorites / Coups de cœur
  if (
    cleanInput.includes('favori') ||
    cleanInput.includes('coup de coeur') ||
    cleanInput.includes('coups de cœur') ||
    cleanInput.includes('préféré') ||
    cleanInput.includes('etoile')
  ) {
    filters.isFavorite = true;
  }

  // 2. Detect Blurry / Flou / Mauvaise qualité
  if (
    cleanInput.includes('flou') ||
    cleanInput.includes('floue') ||
    cleanInput.includes('ratee') ||
    cleanInput.includes('ratée')
  ) {
    filters.isBlurry = true;
  }

  // 3. Detect GPS / Géolocalisé
  if (
    cleanInput.includes('gps') ||
    cleanInput.includes('carte') ||
    cleanInput.includes('géolocalis') ||
    cleanInput.includes('geolocalis')
  ) {
    filters.hasGps = true;
  }

  // 4. Detect Year (e.g. 2020 to 2030)
  for (const token of rawTokens) {
    const yearNum = parseInt(token, 10);
    if (!isNaN(yearNum) && yearNum >= 1990 && yearNum <= 2040) {
      filters.year = yearNum;
      break;
    }
  }

  // 5. Detect Seasons
  let inferredSeason: ParsedNaturalQuery['inferredSeason'];
  for (const [seasonKey, months] of Object.entries(SEASON_MONTHS)) {
    if (cleanInput.includes(seasonKey)) {
      if (seasonKey.includes('hiver') || seasonKey.includes('winter')) inferredSeason = 'hiver';
      else if (seasonKey.includes('printemps') || seasonKey.includes('spring')) inferredSeason = 'printemps';
      else if (seasonKey.includes('ete') || seasonKey.includes('été') || seasonKey.includes('summer')) inferredSeason = 'été';
      else if (seasonKey.includes('automne') || seasonKey.includes('autumn') || seasonKey.includes('fall')) inferredSeason = 'automne';

      // Pick middle month as primary filter or let multi-match handle it
      filters.month = months[1];
      break;
    }
  }

  // 6. Detect Semantic Concept Synonyms
  let inferredCategory: string | undefined;
  const matchedConcepts: string[] = [];
  for (const [concept, synonyms] of Object.entries(SCENE_SYNONYMS)) {
    if (cleanInput.includes(concept)) {
      synonyms.forEach((s) => semanticTags.push(s));
      matchedConcepts.push(concept);
      inferredCategory = concept;
    }
  }

  // 7. Residual meaningful query words for text search
  const intentTokens = new Set([
    'favori', 'favoris', 'favorite', 'favorites', 'coup', 'coups', 'coeur', 'cœur', 'préféré', 'préférées', 'etoile',
    'flou', 'floue', 'flous', 'floues', 'ratee', 'ratée', 'ratées',
    'gps', 'carte', 'géolocalisé', 'géolocalisée', 'géolocalisées', 'geolocalise',
  ]);

  const remainingSearchTokens = meaningfulTokens.filter((token) => {
    if (filters.year && token === String(filters.year)) return false;
    if (inferredSeason && token.includes(inferredSeason)) return false;
    if (intentTokens.has(token)) return false;
    if (matchedConcepts.some((concept) => token.includes(concept))) return false;
    return true;
  });

  if (remainingSearchTokens.length > 0) {
    filters.query = remainingSearchTokens.join(' ');
  }

  return {
    extractedFilters: filters,
    semanticTags: Array.from(new Set(semanticTags)),
    inferredSeason,
    inferredCategory,
    originalQuery: inputQuery,
  };
}
