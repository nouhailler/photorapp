import type { Photo, Album } from '../../types/types';

export const INITIAL_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA283JL4L32MIkGKCyWwEH5d_RB0Oz7EjEiQg_KCIPnkJgEE6QQE5oX9KdQ_BbZdNc7pAHxs1xuc_lJjvVClvMIeAQvneIFM0H4FRGMD2SKFv11hVanuv4Dwt1wOSWvEsio6u6-_mhC54SJdGST2fkSAgH-tmzKrr9341kYkNiJFIrqaCrZXmxjuxl0ud14xI_eOeYk9LfHTVJ591Zn0gKpcxlOdWwTtZtriRDMN6ErR81dxchVgC9rwFtORbs2y_8S-bEi7RqNEY0',
    alt: 'Breathtaking landscape of a serene lake nestled between snow-capped mountains',
    date: '2026-06-08',
    isFavorite: true,
    albumIds: ['summer-2023'],
    tags: ['landscape', 'mountains', 'lake'],
    metadata: {
      device: 'iPhone 15 Pro',
      resolution: '12MP',
      date: '2023-10-14 18:42',
      location: 'Chamonix, France',
      exif: { shutterSpeed: '1/250s', aperture: 'f/1.8', iso: '32', focalLength: '24mm' }
    }
  },
  {
    id: '2',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCN2Zrlq7XCC_sGxQZ-3FCOJXdEPRL-EUTBsIHEHbu5qrSPyJi2AUlp4LWf7G5HKzTp_JK4zx06RldnCeRp9HSB0VYh2d8EMug5tuG_LDvFJm41bjQ9asqp0gGpaE1ZSMV1QuNoErEzJ77RwuStu40RbULDbfVWw_HMzLnYwpttpb-5hSYDceUcApX5ZesRzNGJHgaah-DLeJoMT5_PAn_4tGbKeELM5S9TkbpBkdrsPygYTw7bZkH-6W868KbaURWugAWNAOd78C4',
    alt: 'Joyful candid moment at a minimalist outdoor wedding',
    date: '2026-06-08',
    isFavorite: false,
    albumIds: [],
    tags: ['wedding', 'people', 'joy'],
  },
  {
    id: '3',
    url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8LxLjLLuQL_IEJKNU3j--yW4d3c8xoLS0ER2-njpvkTY19ktebXZysY4zq8SmK434SgLdSDGrFohEPoikbQJjCyFqBRG8PVelOhLmTXbWnvrP0GR0NlcvPI3tquxaTsc44yuSm2SJbAXbjdjqhxAVi0Hvb187Tyfvvrb9U4V1Evc_dM7sj466RoXdO8X0RCir5dFwUyn3jvqGKvkZq8E-BFhUc7uxsSph5206WgsqH1afZsEw03OZRYyaBqZbh63AcpQYTGw1h8U',
    alt: 'Eiffel Tower in Paris during golden hour',
    date: '2026-06-07',
    isFavorite: false,
    albumIds: [],
    tags: ['paris', 'architecture', 'travel'],
    metadata: {
      device: 'Canon EOS R5',
      resolution: '45MP',
      date: '2023-09-20 19:15',
      location: 'Paris, France',
      exif: { shutterSpeed: '1/100s', aperture: 'f/2.8', iso: '100', focalLength: '35mm' }
    }
  }
];

export const INITIAL_ALBUMS: Album[] = [
  {
    id: 'summer-2023',
    title: 'Summer 2023',
    coverPhotoId: '1',
    photoCount: 124,
    isShared: true,
    isPrivate: false,
    type: 'personal'
  },
  {
    id: 'nordic-travel',
    title: 'Nordic Travel',
    coverPhotoId: '3',
    photoCount: 215,
    isShared: false,
    isPrivate: true,
    type: 'personal'
  }
];
