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
  montagne: ['montagne', 'sommet', 'neige', 'alpes', 'nature', 'mountain', 'snow', 'peak'],
  mountain: ['mountain', 'montagne', 'peak', 'snow', 'neige', 'alps', 'nature'],
  plage: ['plage', 'mer', 'océan', 'sable', 'côte', 'eau', 'beach', 'sea', 'ocean'],
  beach: ['beach', 'plage', 'sea', 'mer', 'ocean', 'océan', 'sand', 'coast', 'water'],
  mer: ['mer', 'océan', 'plage', 'eau', 'côte', 'sea', 'ocean', 'beach'],
  sea: ['sea', 'ocean', 'beach', 'plage', 'mer', 'water', 'coast'],
  ocean: ['ocean', 'océan', 'sea', 'beach', 'plage', 'mer', 'water'],
  foret: ['forêt', 'bois', 'arbres', 'nature', 'verdure', 'forest', 'woods', 'trees'],
  forêt: ['forêt', 'bois', 'arbres', 'nature', 'verdure', 'forest', 'woods', 'trees'],
  forest: ['forest', 'forêt', 'woods', 'trees', 'nature', 'greenery'],
  ville: ['ville', 'urbain', 'architecture', 'bâtiment', 'rue', 'city', 'urban', 'building'],
  city: ['city', 'ville', 'urban', 'urbain', 'architecture', 'street', 'building'],
  batiment: ['bâtiment', 'architecture', 'immeuble', 'monument', 'ville', 'building'],
  bâtiment: ['bâtiment', 'architecture', 'immeuble', 'monument', 'ville', 'building'],
  building: ['building', 'bâtiment', 'architecture', 'monument', 'city', 'ville'],
  coucher: ['coucher de soleil', 'crépuscule', 'doré', 'sunset', 'dusk', 'golden'],
  sunset: ['sunset', 'coucher de soleil', 'dusk', 'crépuscule', 'golden', 'doré'],
  nuit: ['nuit', 'nocturne', 'sombre', 'night', 'dark'],
  night: ['night', 'nuit', 'nocturne', 'dark', 'sombre'],
  portrait: ['portrait', 'personne', 'visage', 'gens', 'person', 'face', 'people'],
  people: ['portrait', 'personne', 'visage', 'people', 'person'],
  chien: ['chien', 'animal', 'faune', 'dog'],
  dog: ['dog', 'chien', 'animal', 'pet', 'wildlife'],
  chat: ['chat', 'animal', 'faune', 'cat'],
  cat: ['cat', 'chat', 'animal', 'pet'],
  animal: ['animal', 'faune', 'sauvage', 'wildlife'],
  voiture: ['voiture', 'véhicule', 'auto', 'car', 'vehicle'],
  car: ['car', 'voiture', 'vehicle', 'auto'],
  fleur: ['fleur', 'nature', 'jardin', 'plante', 'flower', 'garden'],
  flower: ['flower', 'fleur', 'nature', 'garden', 'jardin', 'plant'],
  jardin: ['jardin', 'parc', 'nature', 'verdure', 'fleur', 'garden', 'park'],
  garden: ['garden', 'jardin', 'park', 'parc', 'nature', 'flower', 'fleur'],
};

/**
 * Parses natural language input queries in French & English into structured search filters.
 * Enables queries like "Photos de montagnes en hiver", "Mountains in winter", "Beach photos with GPS".
 */
export function parseNaturalLanguageQuery(inputQuery: string): ParsedNaturalQuery {
  const cleanInput = inputQuery.trim().toLowerCase();
  const filters: SearchFilters = {};
  const semanticTags: string[] = [];

  // Remove common French and English stop words
  const stopWords = new Set([
    'photos', 'photo', 'de', 'des', 'du', 'la', 'le', 'les', 'en', 'dans', 'un', 'une', 'sur', 'avec', 'par',
    'prises', 'prise', 'mes', 'au', 'aux', 'qui', 'sont', 'à',
    'the', 'a', 'an', 'in', 'on', 'at', 'with', 'from', 'for', 'of', 'my', 'that', 'are', 'near', 'by', 'taken',
  ]);

  const rawTokens = cleanInput.split(/\s+/).filter(Boolean);
  const meaningfulTokens = rawTokens.filter((token) => !stopWords.has(token));

  // 1. Detect Favorites / Coups de cœur
  if (
    cleanInput.includes('favori') ||
    cleanInput.includes('coup de coeur') ||
    cleanInput.includes('coups de cœur') ||
    cleanInput.includes('préféré') ||
    cleanInput.includes('etoile') ||
    cleanInput.includes('starred') ||
    cleanInput.includes('best')
  ) {
    filters.isFavorite = true;
  }

  // 2. Detect Blurry / Flou / Mauvaise qualité
  if (
    cleanInput.includes('flou') ||
    cleanInput.includes('floue') ||
    cleanInput.includes('ratee') ||
    cleanInput.includes('ratée') ||
    cleanInput.includes('blur') ||
    cleanInput.includes('out of focus') ||
    cleanInput.includes('low quality')
  ) {
    filters.isBlurry = true;
  }

  // 3. Detect GPS / Géolocalisé
  if (
    cleanInput.includes('gps') ||
    cleanInput.includes('carte') ||
    cleanInput.includes('géolocalis') ||
    cleanInput.includes('geolocalis') ||
    cleanInput.includes('geotag') ||
    cleanInput.includes('location') ||
    cleanInput.includes('map')
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
  let matchedSeasonKey: string | undefined;
  for (const [seasonKey, months] of Object.entries(SEASON_MONTHS)) {
    if (cleanInput.includes(seasonKey)) {
      matchedSeasonKey = seasonKey;
      if (seasonKey.includes('hiver') || seasonKey.includes('winter')) inferredSeason = 'hiver';
      else if (seasonKey.includes('printemps') || seasonKey.includes('spring')) inferredSeason = 'printemps';
      else if (seasonKey.includes('ete') || seasonKey.includes('été') || seasonKey.includes('summer')) inferredSeason = 'été';
      else if (seasonKey.includes('automne') || seasonKey.includes('autumn') || seasonKey.includes('fall')) inferredSeason = 'automne';

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
    'favori', 'favoris', 'favorite', 'favorites', 'coup', 'coups', 'coeur', 'cœur', 'préféré', 'préférées', 'etoile', 'starred', 'best',
    'flou', 'floue', 'flous', 'floues', 'ratee', 'ratée', 'ratées', 'blur', 'blurry',
    'gps', 'carte', 'géolocalisé', 'géolocalisée', 'géolocalisées', 'geolocalise', 'geotag', 'geotagged', 'location', 'map',
  ]);

  const remainingSearchTokens = meaningfulTokens.filter((token) => {
    if (filters.year && token === String(filters.year)) return false;
    if (inferredSeason && token.includes(inferredSeason)) return false;
    if (matchedSeasonKey && token.includes(matchedSeasonKey)) return false;
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
