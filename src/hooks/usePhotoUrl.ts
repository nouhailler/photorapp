import { useState, useEffect } from 'react';
import { usePhotos } from '../context/PhotoContext';
import { Photo } from '../types/types';

export const usePhotoUrl = (photo: Photo) => {
  const { getPhotoUrl } = usePhotos();
  const [url, setUrl] = useState<string>(photo.storage === 'remote' ? photo.url : '');

  useEffect(() => {
    let isMounted = true;
    if (photo.storage === 'local') {
      getPhotoUrl(photo).then(newUrl => {
        if (isMounted) setUrl(newUrl);
      });
    } else {
      setUrl(photo.url);
    }
    return () => { isMounted = false; };
  }, [photo, getPhotoUrl]);

  return url;
};
