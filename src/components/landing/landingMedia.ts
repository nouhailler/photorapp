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

export interface DemoPhotoItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  location: string;
  dateLabel: string;
  camera: string;
  exif: string;
  category: 'Nature' | 'Littoral' | 'Ville' | 'Voyage';
  tags: string[];
  isFavorite: boolean;
  hasGps: boolean;
  dimensions: string;
}

export const EDITORIAL_PHOTOS = {
  alpineLake: {
    src: alpineLakeImg,
    alt: 'Illustration photographique : lac alpin entouré de sommets enneigés au lever du soleil',
    title: 'Massif alpin au lever du jour',
    exifSample: '24mm · f/2.8 · 1/500s · ISO 100',
    sceneLabel: 'Nature & Paysage',
  },
  coastalSunset: {
    src: coastalSunsetImg,
    alt: 'Illustration photographique : crique rocheuse méditerranéenne au crépuscule',
    title: 'Crique côtière au crépuscule',
    exifSample: '35mm · f/4.0 · 1/160s · ISO 200',
    sceneLabel: 'Plage & Mer',
  },
  cityArch: {
    src: cityArchImg,
    alt: 'Illustration photographique : rue européenne bordée de façades en pierre claire',
    title: 'Façades urbaines le matin',
    exifSample: '50mm · f/5.6 · 1/250s · ISO 160',
    sceneLabel: 'Architecture & Ville',
  },
  forestTrail: {
    src: forestTrailImg,
    alt: 'Illustration photographique : sentier forestier dans les pins sous la lumière matinale',
    title: 'Sentier forestier matinal',
    exifSample: '28mm · f/2.0 · 1/125s · ISO 400',
    sceneLabel: 'Nature & Paysage',
  },
} as const;

export const DEMO_PHOTOS: DemoPhotoItem[] = [
  {
    id: 'demo-alpine-lake',
    src: alpineLakeImg,
    alt: 'Cliché de démonstration : lac alpin aux reflets clairs devant des sommets montagneux',
    title: 'Reflets sur le lac alpin',
    location: 'Haute-Savoie, France',
    dateLabel: '14 juillet 2024',
    camera: 'Fujifilm X-T5 · XF 23mm',
    exif: '24mm · f/2.8 · 1/500s · ISO 100',
    category: 'Nature',
    tags: ['montagne', 'lac', 'été'],
    isFavorite: true,
    hasGps: true,
    dimensions: '4032 × 3024 px',
  },
  {
    id: 'demo-snow-peaks',
    src: snowPeaksImg,
    alt: 'Cliché de démonstration : sommets enneigés sous un ciel d’hiver lumineux',
    title: 'Crêtes d’altitude en janvier',
    location: 'Valais, Suisse',
    dateLabel: '19 janvier 2024',
    camera: 'Sony Alpha 7 IV · 35mm GM',
    exif: '35mm · f/5.6 · 1/1000s · ISO 100',
    category: 'Voyage',
    tags: ['montagne', 'neige', 'hiver'],
    isFavorite: true,
    hasGps: true,
    dimensions: '4240 × 3180 px',
  },
  {
    id: 'demo-golden-beach',
    src: goldenBeachImg,
    alt: 'Cliché de démonstration : plage de sable doré et vagues calmes en fin d’après-midi',
    title: 'Rivage atlantique en fin d’après-midi',
    location: 'Morbihan, France',
    dateLabel: '8 août 2024',
    camera: 'Leica Q3 · Summilux 28mm',
    exif: '28mm · f/4.0 · 1/640s · ISO 100',
    category: 'Littoral',
    tags: ['plage', 'mer', 'été'],
    isFavorite: false,
    hasGps: true,
    dimensions: '4000 × 3000 px',
  },
  {
    id: 'demo-night-bridge',
    src: nightBridgeImg,
    alt: 'Cliché de démonstration : pont en pierre illuminé à l’heure bleue avec reflets sur le fleuve',
    title: 'Heure bleue sur les quais',
    location: 'Paris, France',
    dateLabel: '12 novembre 2024',
    camera: 'Nikon Zf · Nikkor 40mm',
    exif: '40mm · f/2.0 · 1/60s · ISO 800',
    category: 'Ville',
    tags: ['ville', 'nuit', 'architecture'],
    isFavorite: true,
    hasGps: true,
    dimensions: '4032 × 3024 px',
  },
  {
    id: 'demo-coastal-sunset',
    src: coastalSunsetImg,
    alt: 'Cliché de démonstration : crique rocheuse méditerranéenne éclairée par le soleil couchant',
    title: 'Crique calcaire au crépuscule',
    location: 'Cassis, France',
    dateLabel: '22 septembre 2023',
    camera: 'Canon EOS R6 II · RF 35mm',
    exif: '35mm · f/4.0 · 1/160s · ISO 200',
    category: 'Littoral',
    tags: ['mer', 'coucher de soleil', 'côte'],
    isFavorite: false,
    hasGps: true,
    dimensions: '3840 × 2880 px',
  },
  {
    id: 'demo-city-arch',
    src: cityArchImg,
    alt: 'Cliché de démonstration : rue piétonne européenne bordée d’immeubles en pierre claire',
    title: 'Perspective matinale en pierre claire',
    location: 'Lyon, France',
    dateLabel: '3 mai 2024',
    camera: 'Ricoh GR IIIx · 40mm',
    exif: '40mm · f/5.6 · 1/250s · ISO 160',
    category: 'Ville',
    tags: ['ville', 'bâtiment', 'architecture'],
    isFavorite: false,
    hasGps: false,
    dimensions: '3600 × 2700 px',
  },
  {
    id: 'demo-forest-trail',
    src: forestTrailImg,
    alt: 'Cliché de démonstration : sentier forestier dans les pins traversé par la lumière du matin',
    title: 'Sous-bois dans la brume matinale',
    location: 'Vosges, France',
    dateLabel: '15 octobre 2023',
    camera: 'Fujifilm X100VI · 23mm',
    exif: '28mm · f/2.0 · 1/125s · ISO 400',
    category: 'Nature',
    tags: ['forêt', 'nature', 'automne'],
    isFavorite: true,
    hasGps: true,
    dimensions: '4000 × 3000 px',
  },
  {
    id: 'demo-botanical-bloom',
    src: botanicalBloomImg,
    alt: 'Cliché de démonstration : floraison corail et blanche dans un jardin botanique ensoleillé',
    title: 'Floraison du jardin botanique',
    location: 'Annecy, France',
    dateLabel: '27 avril 2024',
    camera: 'OM System OM-1 · 50mm Macro',
    exif: '50mm · f/2.8 · 1/320s · ISO 200',
    category: 'Nature',
    tags: ['fleur', 'jardin', 'printemps'],
    isFavorite: false,
    hasGps: false,
    dimensions: '3888 × 2916 px',
  },
];
