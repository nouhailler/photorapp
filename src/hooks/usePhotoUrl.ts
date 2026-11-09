import { useState, useEffect } from 'react';
import { usePhotos } from '../context/usePhotos';
import type { Photo } from '../types/types';

export const usePhotoUrl = (photo: Photo): string => {
  const { getPhotoUrl } = usePhotos();
  const [localUrl, setLocalUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    if (photo.storage === 'local') {
      getPhotoUrl(photo).then((newUrl) => {
        if (isMounted) {
          setLocalUrl(newUrl);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [photo, getPhotoUrl]);

  if (photo.storage === 'remote' || !photo.storage) {
    return photo.url;
  }

  return localUrl || photo.url;
};
