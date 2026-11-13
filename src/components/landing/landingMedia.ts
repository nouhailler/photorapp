import alpineLakeImg from '../../assets/images/hero_alpine_gallery_1794604291194.jpg';
import coastalSunsetImg from '../../assets/images/memory_coastal_sunset_1794604291769.jpg';
import cityArchImg from '../../assets/images/memory_city_architecture_1794604292041.jpg';
import forestTrailImg from '../../assets/images/memory_forest_trail_1794604292311.jpg';

export const GITHUB_REPO_URL = 'https://github.com/nouhailler/photorapp';
export const DEPLOYED_APP_URL = 'https://photorapp.swinux.ch/';

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
