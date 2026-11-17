import alpineLakeImg from '../../assets/images/hero_alpine_gallery_1794604291194.jpg';
import coastalSunsetImg from '../../assets/images/memory_coastal_sunset_1794604291769.jpg';
import cityArchImg from '../../assets/images/memory_city_architecture_1794604292041.jpg';
import forestTrailImg from '../../assets/images/memory_forest_trail_1794604292311.jpg';
import snowPeaksImg from '../../assets/images/demo_snow_peaks_1794689900477.jpg';
import botanicalBloomImg from '../../assets/images/demo_botanical_bloom_1794689900918.jpg';
import nightBridgeImg from '../../assets/images/demo_night_bridge_1794689901746.jpg';
import goldenBeachImg from '../../assets/images/demo_golden_beach_1794689901283.jpg';

export const GITHUB_REPO_URL = 'https://github.com/nouhailler/photorapp';
export const DEPLOYED_APP_URL = 'https://photorapp.swinux.ch/';
export const YOUTUBE_VIDEO_ID = 'Z--ZypHe5LM';
export const YOUTUBE_TUTORIAL_URL = `https://www.youtube.com/watch?v=${YOUTUBE_VIDEO_ID}`;
export const YOUTUBE_EMBED_URL = `https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}?rel=0`;

export interface DemoPhotoItem {
  id: string;
  src: string;
  alt: string;
  altEn: string;
  title: string;
  titleEn: string;
  location: string;
  locationEn: string;
  dateLabel: string;
  dateLabelEn: string;
  camera: string;
  exif: string;
  category: 'Nature' | 'Littoral' | 'Ville' | 'Voyage';
  categoryEn: 'Nature' | 'Coast' | 'City' | 'Travel';
  tags: string[];
  tagsEn: string[];
  isFavorite: boolean;
  hasGps: boolean;
  dimensions: string;
}

export const EDITORIAL_PHOTOS = {
  alpineLake: {
    src: alpineLakeImg,
    alt: 'Illustration photographique : lac alpin entouré de sommets enneigés au lever du soleil',
    altEn: 'Editorial photograph: alpine lake surrounded by snow-dusted peaks at sunrise',
    title: 'Massif alpin au lever du jour',
    titleEn: 'Alpine range at dawn',
    exifSample: '24mm · f/2.8 · 1/500s · ISO 100',
    sceneLabel: 'Nature & Paysage',
  },
  coastalSunset: {
    src: coastalSunsetImg,
    alt: 'Illustration photographique : crique rocheuse méditerranéenne au crépuscule',
    altEn: 'Editorial photograph: rocky Mediterranean cove at dusk',
    title: 'Crique côtière au crépuscule',
    titleEn: 'Coastal cove at dusk',
    exifSample: '35mm · f/4.0 · 1/160s · ISO 200',
    sceneLabel: 'Plage & Mer',
  },
  cityArch: {
    src: cityArchImg,
    alt: 'Illustration photographique : rue européenne bordée de façades en pierre claire',
    altEn: 'Editorial photograph: European street lined with light stone facades',
    title: 'Façades urbaines le matin',
    titleEn: 'Morning city facades',
    exifSample: '50mm · f/5.6 · 1/250s · ISO 160',
    sceneLabel: 'Architecture & Ville',
  },
  forestTrail: {
    src: forestTrailImg,
    alt: 'Illustration photographique : sentier forestier dans les pins sous la lumière matinale',
    altEn: 'Editorial photograph: pine forest trail in morning sunlight',
    title: 'Sentier forestier matinal',
    titleEn: 'Morning forest trail',
    exifSample: '28mm · f/2.0 · 1/125s · ISO 400',
    sceneLabel: 'Nature & Paysage',
  },
} as const;

export const DEMO_PHOTOS: DemoPhotoItem[] = [
  {
    id: 'demo-alpine-lake',
    src: alpineLakeImg,
    alt: 'Cliché de démonstration : lac alpin aux reflets clairs devant des sommets montagneux',
    altEn: 'Demo photo: crystal alpine lake reflecting surrounding mountain peaks',
    title: 'Reflets sur le lac alpin',
    titleEn: 'Reflections on the alpine lake',
    location: 'Haute-Savoie, France',
    locationEn: 'Haute-Savoie, France',
    dateLabel: '14 juillet 2024',
    dateLabelEn: 'July 14, 2024',
    camera: 'Fujifilm X-T5 · XF 23mm',
    exif: '24mm · f/2.8 · 1/500s · ISO 100',
    category: 'Nature',
    categoryEn: 'Nature',
    tags: ['montagne', 'lac', 'été'],
    tagsEn: ['mountain', 'lake', 'summer'],
    isFavorite: true,
    hasGps: true,
    dimensions: '4032 × 3024 px',
  },
  {
    id: 'demo-snow-peaks',
    src: snowPeaksImg,
    alt: 'Cliché de démonstration : sommets enneigés sous un ciel d’hiver lumineux',
    altEn: 'Demo photo: snow-covered alpine ridges under a crisp winter sky',
    title: 'Crêtes d’altitude en janvier',
    titleEn: 'High-altitude ridges in January',
    location: 'Valais, Suisse',
    locationEn: 'Valais, Switzerland',
    dateLabel: '19 janvier 2024',
    dateLabelEn: 'January 19, 2024',
    camera: 'Sony Alpha 7 IV · 35mm GM',
    exif: '35mm · f/5.6 · 1/1000s · ISO 100',
    category: 'Voyage',
    categoryEn: 'Travel',
    tags: ['montagne', 'neige', 'hiver'],
    tagsEn: ['mountain', 'snow', 'winter'],
    isFavorite: true,
    hasGps: true,
    dimensions: '4240 × 3180 px',
  },
  {
    id: 'demo-golden-beach',
    src: goldenBeachImg,
    alt: 'Cliché de démonstration : plage de sable doré et vagues calmes en fin d’après-midi',
    altEn: 'Demo photo: golden sandy shoreline and calm ocean waves in late afternoon light',
    title: 'Rivage atlantique en fin d’après-midi',
    titleEn: 'Atlantic shore in late afternoon',
    location: 'Morbihan, France',
    locationEn: 'Brittany, France',
    dateLabel: '8 août 2024',
    dateLabelEn: 'August 8, 2024',
    camera: 'Leica Q3 · Summilux 28mm',
    exif: '28mm · f/4.0 · 1/640s · ISO 100',
    category: 'Littoral',
    categoryEn: 'Coast',
    tags: ['plage', 'mer', 'été'],
    tagsEn: ['beach', 'sea', 'summer'],
    isFavorite: false,
    hasGps: true,
    dimensions: '4000 × 3000 px',
  },
  {
    id: 'demo-night-bridge',
    src: nightBridgeImg,
    alt: 'Cliché de démonstration : pont en pierre illuminé à l’heure bleue avec reflets sur le fleuve',
    altEn: 'Demo photo: stone river bridge lit at blue hour with warm water reflections',
    title: 'Heure bleue sur les quais',
    titleEn: 'Blue hour along the riverfront',
    location: 'Paris, France',
    locationEn: 'Paris, France',
    dateLabel: '12 novembre 2024',
    dateLabelEn: 'November 12, 2024',
    camera: 'Nikon Zf · Nikkor 40mm',
    exif: '40mm · f/2.0 · 1/60s · ISO 800',
    category: 'Ville',
    categoryEn: 'City',
    tags: ['ville', 'nuit', 'architecture'],
    tagsEn: ['city', 'night', 'architecture'],
    isFavorite: true,
    hasGps: true,
    dimensions: '4032 × 3024 px',
  },
  {
    id: 'demo-coastal-sunset',
    src: coastalSunsetImg,
    alt: 'Cliché de démonstration : crique rocheuse méditerranéenne éclairée par le soleil couchant',
    altEn: 'Demo photo: limestone Mediterranean cove lit by the setting sun',
    title: 'Crique calcaire au crépuscule',
    titleEn: 'Limestone cove at twilight',
    location: 'Cassis, France',
    locationEn: 'Cassis, France',
    dateLabel: '22 septembre 2023',
    dateLabelEn: 'September 22, 2023',
    camera: 'Canon EOS R6 II · RF 35mm',
    exif: '35mm · f/4.0 · 1/160s · ISO 200',
    category: 'Littoral',
    categoryEn: 'Coast',
    tags: ['mer', 'coucher de soleil', 'côte'],
    tagsEn: ['sea', 'sunset', 'coast'],
    isFavorite: false,
    hasGps: true,
    dimensions: '3840 × 2880 px',
  },
  {
    id: 'demo-city-arch',
    src: cityArchImg,
    alt: 'Cliché de démonstration : rue piétonne européenne bordée d’immeubles en pierre claire',
    altEn: 'Demo photo: quiet European pedestrian street lined with pale stone facades',
    title: 'Perspective matinale en pierre claire',
    titleEn: 'Morning light on limestone facades',
    location: 'Lyon, France',
    locationEn: 'Lyon, France',
    dateLabel: '3 mai 2024',
    dateLabelEn: 'May 3, 2024',
    camera: 'Ricoh GR IIIx · 40mm',
    exif: '40mm · f/5.6 · 1/250s · ISO 160',
    category: 'Ville',
    categoryEn: 'City',
    tags: ['ville', 'bâtiment', 'architecture'],
    tagsEn: ['city', 'building', 'architecture'],
    isFavorite: false,
    hasGps: false,
    dimensions: '3600 × 2700 px',
  },
  {
    id: 'demo-forest-trail',
    src: forestTrailImg,
    alt: 'Cliché de démonstration : sentier forestier dans les pins traversé par la lumière du matin',
    altEn: 'Demo photo: pine forest footpath illuminated by morning mist',
    title: 'Sous-bois dans la brume matinale',
    titleEn: 'Pine woodland in morning mist',
    location: 'Vosges, France',
    locationEn: 'Vosges, France',
    dateLabel: '15 octobre 2023',
    dateLabelEn: 'October 15, 2023',
    camera: 'Fujifilm X100VI · 23mm',
    exif: '28mm · f/2.0 · 1/125s · ISO 400',
    category: 'Nature',
    categoryEn: 'Nature',
    tags: ['forêt', 'nature', 'automne'],
    tagsEn: ['forest', 'nature', 'autumn'],
    isFavorite: true,
    hasGps: true,
    dimensions: '4000 × 3000 px',
  },
  {
    id: 'demo-botanical-bloom',
    src: botanicalBloomImg,
    alt: 'Cliché de démonstration : floraison corail et blanche dans un jardin botanique ensoleillé',
    altEn: 'Demo photo: coral and white blossoms in a sunlit botanical garden',
    title: 'Floraison du jardin botanique',
    titleEn: 'Botanical garden bloom',
    location: 'Annecy, France',
    locationEn: 'Annecy, France',
    dateLabel: '27 avril 2024',
    dateLabelEn: 'April 27, 2024',
    camera: 'OM System OM-1 · 50mm Macro',
    exif: '50mm · f/2.8 · 1/320s · ISO 200',
    category: 'Nature',
    categoryEn: 'Nature',
    tags: ['fleur', 'jardin', 'printemps'],
    tagsEn: ['flower', 'garden', 'spring'],
    isFavorite: false,
    hasGps: false,
    dimensions: '3888 × 2916 px',
  },
];
