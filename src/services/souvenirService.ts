import type { Photo, PhotoSouvenir } from '../types/types';

import type { AppLang } from '../context/languageContextDef';

/**
 * Local Photographic Souvenirs & Memories Generator.
 * Calculates retrospective memories strictly from authentic photo dates, EXIF and locations.
 * Never invents dates, locations or events.
 */

export function generateSouvenirs(
  photos: Photo[],
  referenceDate = new Date(),
  lang: AppLang = 'fr'
): PhotoSouvenir[] {
  if (!photos || photos.length === 0) return [];

  const isEn = lang === 'en';
  const souvenirs: PhotoSouvenir[] = [];
  const refYear = referenceDate.getFullYear();
  const refMonth = referenceDate.getMonth() + 1; // 1-12
  const refDay = referenceDate.getDate(); // 1-31

  // Format month and day with leading zeroes
  const targetMMDD = `${String(refMonth).padStart(2, '0')}-${String(refDay).padStart(2, '0')}`;

  // 1. « Ce jour-là, il y a 1 an » / « On this day, 1 year ago »
  const oneYearAgoDateStr = `${refYear - 1}-${targetMMDD}`;
  const exactlyOneYearPhotos = photos.filter((p) => p.date === oneYearAgoDateStr);

  if (exactlyOneYearPhotos.length > 0) {
    souvenirs.push({
      id: `souvenir-1year-${oneYearAgoDateStr}`,
      title: isEn ? 'On this day, 1 year ago' : 'Ce jour-là, il y a 1 an',
      subtitle: isEn
        ? `Relive your day from ${refMonth}/${refDay}/${refYear - 1}`
        : `Revivez votre journée du ${refDay}/${refMonth}/${refYear - 1}`,
      type: 'on_this_day',
      periodLabel: isEn ? `1 year ago (${refYear - 1})` : `Il y a 1 an (${refYear - 1})`,
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
        title: isEn ? `On this day, ${yearsAgo} years ago` : `Ce jour-là, il y a ${yearsAgo} ans`,
        subtitle: isEn
          ? `Your memories from ${refMonth}/${refDay}/${pastYear}`
          : `Vos souvenirs du ${refDay}/${refMonth}/${pastYear}`,
        type: 'past_years',
        periodLabel: isEn ? `${yearsAgo} years ago (${pastYear})` : `Il y a ${yearsAgo} ans (${pastYear})`,
        photos: pastYearPhotos,
        coverPhoto: pastYearPhotos.find((p) => p.isFavorite) || pastYearPhotos[0],
        dateKey: pastDateStr,
      });
    }
  }

  // 3. « Photos de cette période de l'année »
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
    const monthName = new Intl.DateTimeFormat(isEn ? 'en-US' : 'fr-FR', { month: 'long' }).format(referenceDate);
    souvenirs.push({
      id: `souvenir-season-${refMonth}-${refDay}`,
      title: isEn ? 'This time of year' : 'À cette période de l’année',
      subtitle: isEn
        ? `A selection of moments captured in ${monthName} over past years`
        : `Une sélection de moments capturés les années passées au mois de ${monthName}`,
      type: 'same_season',
      periodLabel: isEn ? 'Same season' : 'Même saison',
      photos: seasonalPhotos.slice(0, 20),
      coverPhoto: seasonalPhotos.find((p) => p.isFavorite) || seasonalPhotos[0],
      dateKey: targetMMDD,
    });
  }

  // 4. « Escapades & Voyages » / « Trips & Getaways »
  const locationGroups: Record<string, Photo[]> = {};
  for (const photo of photos) {
    const loc = photo.metadata?.location?.trim();
    if (loc && loc !== 'Lieu inconnu' && loc !== 'Unknown location') {
      if (!locationGroups[loc]) locationGroups[loc] = [];
      locationGroups[loc].push(photo);
    }
  }

  for (const [location, locPhotos] of Object.entries(locationGroups)) {
    if (locPhotos.length >= 4) {
      const sortedByDate = [...locPhotos].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      const firstDate = sortedByDate[0].date || '';
      const year = firstDate.substring(0, 4);

      souvenirs.push({
        id: `souvenir-trip-${location.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        title: isEn ? `Trip to ${location}` : `Escapade à ${location}`,
        subtitle: isEn
          ? `${locPhotos.length} memorable photos${year ? ` (${year})` : ''}`
          : `${locPhotos.length} photographies mémorables${year ? ` (${year})` : ''}`,
        type: 'trip',
        periodLabel: location,
        photos: locPhotos,
        coverPhoto: locPhotos.find((p) => p.isFavorite) || locPhotos[0],
        dateKey: location,
      });

      if (souvenirs.filter((s) => s.type === 'trip').length >= 3) break;
    }
  }

  // 5. « Coups de cœur oubliés » / « Rediscovered Favorites »
  const sixMonthsAgo = new Date(referenceDate);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const sixMonthsIso = sixMonthsAgo.toISOString().split('T')[0];

  const forgottenFavorites = photos.filter((p) => p.isFavorite && (p.date || '') < sixMonthsIso);
  if (forgottenFavorites.length >= 3) {
    souvenirs.push({
      id: 'souvenir-forgotten-favorites',
      title: isEn ? 'All-time favorites' : 'Vos coups de cœur de toujours',
      subtitle: isEn
        ? `${forgottenFavorites.length} favorite photos worth rediscovering`
        : `${forgottenFavorites.length} photos préférées qui méritent d'être redécouvertes`,
      type: 'forgotten_favorites',
      periodLabel: isEn ? 'Favorites' : 'Coups de cœur',
      photos: forgottenFavorites.slice(0, 16),
      coverPhoto: forgottenFavorites[0],
      dateKey: 'favorites',
    });
  }

  return souvenirs;
}
