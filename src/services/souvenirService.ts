import type { Photo, PhotoSouvenir } from '../types/types';

/**
 * Local Photographic Souvenirs & Memories Generator.
 * Calculates retrospective memories strictly from authentic photo dates, EXIF and locations.
 * Never invents dates, locations or events.
 */

export function generateSouvenirs(photos: Photo[], referenceDate = new Date()): PhotoSouvenir[] {
  if (!photos || photos.length === 0) return [];

  const souvenirs: PhotoSouvenir[] = [];
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1; // 1-12
  const refDay = referenceDate.getDate(); // 1-31

  // Format month and day with leading zeroes
  const targetMMDD = `${String(refMonth).padStart(2, '0')}-${String(refDay).padStart(2, '0')}`;

  // 1. « Ce jour-là, il y a 1 an »
  const oneYearAgoDateStr = `${refYear - 1}-${targetMMDD}`;
  const exactlyOneYearPhotos = photos.filter((p) => p.date === oneYearAgoDateStr);

  if (exactlyOneYearPhotos.length > 0) {
    souvenirs.push({
      id: `souvenir-1year-${oneYearAgoDateStr}`,
      title: 'Ce jour-là, il y a 1 an',
      subtitle: `Revivez votre journée du ${refDay}/${refMonth}/${refYear - 1}`,
      type: 'on_this_day',
      periodLabel: `Il y a 1 an (${refYear - 1})`,
      photos: exactlyOneYearPhotos,
      coverPhoto: exactlyOneYearPhotos.find((p) => p.isFavorite) || exactlyOneYearPhotos[0],
      dateKey: oneYearAgoDateStr,
    });
  }

  // 2. « Ce jour-là, il y a plusieurs années » (2, 3, 5, 10 ans)
  const pastYears = [2, 3, 5, 7, 10];
  for (const yearsAgo of pastYears) {
    const pastYear = refYear - yearsAgo;
    const pastDateStr = `${pastYear}-${targetMMDD}`;
    const pastYearPhotos = photos.filter((p) => p.date === pastDateStr);

    if (pastYearPhotos.length > 0) {
      souvenirs.push({
        id: `souvenir-past-${yearsAgo}y-${pastDateStr}`,
        title: `Ce jour-là, il y a ${yearsAgo} ans`,
        subtitle: `Vos souvenirs du ${refDay}/${refMonth}/${pastYear}`,
        type: 'past_years',
        periodLabel: `Il y a ${yearsAgo} ans (${pastYear})`,
        photos: pastYearPhotos,
        coverPhoto: pastYearPhotos.find((p) => p.isFavorite) || pastYearPhotos[0],
        dateKey: pastDateStr,
      });
    }
  }

  // 3. « Photos de cette période de l'année » (Quinzaine actuelle des années passées)
  // Window of +/- 5 days around today in past years
  const seasonalPhotos = photos.filter((p) => {
    if (!p.date) return false;
    const photoYear = parseInt(p.date.substring(0, 4), 10);
    if (isNaN(photoYear) || photoYear >= refYear) return false;

    const photoMonth = parseInt(p.date.substring(5, 7), 10);
    const photoDay = parseInt(p.date.substring(8, 10), 10);

    if (photoMonth === refMonth && Math.abs(photoDay - refDay) <= 6) {
      return true;
    }
    return false;
  });

  if (seasonalPhotos.length >= 3) {
    souvenirs.push({
      id: `souvenir-season-${refMonth}-${refDay}`,
      title: 'À cette période de l’année',
      subtitle: `Une sélection de moments capturés les années passées au mois de ${new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(referenceDate)}`,
      type: 'same_season',
      periodLabel: 'Même saison',
      photos: seasonalPhotos.slice(0, 20),
      coverPhoto: seasonalPhotos.find((p) => p.isFavorite) || seasonalPhotos[0],
      dateKey: targetMMDD,
    });
  }

  // 4. « Escapades & Voyages » (Grappes de photos prises dans un même lieu)
  const locationGroups: Record<string, Photo[]> = {};
  for (const photo of photos) {
    const loc = photo.metadata?.location?.trim();
    if (loc && loc !== 'Lieu inconnu') {
      if (!locationGroups[loc]) locationGroups[loc] = [];
      locationGroups[loc].push(photo);
    }
  }

  for (const [location, locPhotos] of Object.entries(locationGroups)) {
    if (locPhotos.length >= 4) {
      // Find oldest photo date for period description
      const sortedByDate = [...locPhotos].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      const firstDate = sortedByDate[0].date || '';
      const year = firstDate.substring(0, 4);

      souvenirs.push({
        id: `souvenir-trip-${location.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        title: `Escapade à ${location}`,
        subtitle: `${locPhotos.length} photographies mémorables${year ? ` (${year})` : ''}`,
        type: 'trip',
        periodLabel: location,
        photos: locPhotos,
        coverPhoto: locPhotos.find((p) => p.isFavorite) || locPhotos[0],
        dateKey: location,
      });

      // Limit to max 3 trips to keep souvenirs curated
      if (souvenirs.filter((s) => s.type === 'trip').length >= 3) break;
    }
  }

  // 5. « Coups de cœur oubliés » (Favoris anciens)
  const sixMonthsAgo = new Date(referenceDate);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsIso = sixMonthsAgo.toISOString().split('T')[0];

  const forgottenFavorites = photos.filter((p) => p.isFavorite && (p.date || '') < sixMonthsIso);
  if (forgottenFavorites.length >= 3) {
    souvenirs.push({
      id: 'souvenir-forgotten-favorites',
      title: 'Vos coups de cœur de toujours',
      subtitle: `${forgottenFavorites.length} photos préférées qui méritent d'être redécouvertes`,
      type: 'forgotten_favorites',
      periodLabel: 'Coups de cœur',
      photos: forgottenFavorites.slice(0, 16),
      coverPhoto: forgottenFavorites[0],
      dateKey: 'favorites',
    });
  }

  return souvenirs;
}
