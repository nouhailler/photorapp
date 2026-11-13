import { useState, useEffect } from 'react';
import { usePhotos } from '../context/usePhotos';
import type { Photo } from '../types/types';

export const usePhotoUrl = (photo: Photo, isThumbnail = false): string => {
  const { getPhotoUrl } = usePhotos();
  const [localUrl, setLocalUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    if (photo.storage === 'local') {
      getPhotoUrl(photo, isThumbnail).then((newUrl) => {
        if (isMounted) {
          setLocalUrl(newUrl);
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [photo, isThumbnail, getPhotoUrl]);

  if (photo.storage === 'remote' || !photo.storage) {
    return photo.url;
  }

  return localUrl || photo.url;
};
