import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { Photo } from '../types/types';

// Fix Leaflet default icon paths in bundlers without using 'any'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapComponentProps {
  photos?: Photo[];
  markers?: { position: [number, number]; title: string }[];
  onPhotoClick?: (photo: Photo) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ photos = [], markers = [], onPhotoClick }) => {
  const [tileError, setTileError] = useState(false);

  // Filter only photos with real, valid GPS coordinates
  const geotaggedPhotos = photos.filter(
    (p) =>
      typeof p.metadata?.latitude === 'number' &&
      typeof p.metadata?.longitude === 'number' &&
      !isNaN(p.metadata.latitude) &&
      !isNaN(p.metadata.longitude)
  );

  // If explicit markers prop is passed (legacy/custom)
  const legacyMarkers = markers.filter(
    (m) =>
      typeof m.position[0] === 'number' &&
      typeof m.position[1] === 'number' &&
      !isNaN(m.position[0]) &&
      !isNaN(m.position[1])
  );

  const hasPhotos = geotaggedPhotos.length > 0;
  const hasLegacy = legacyMarkers.length > 0;

  if (!hasPhotos && !hasLegacy) {
    return (
      <div className="w-full h-full min-h-[300px] bg-surface-container-low rounded-2xl flex flex-col items-center justify-center p-6 text-center border border-outline-variant/30">
        <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-3">
          <span className="material-symbols-outlined text-3xl">location_off</span>
        </div>
        <h3 className="text-headline-sm font-bold text-on-surface">Aucune coordonnée GPS</h3>
        <p className="text-body-sm text-on-surface-variant max-w-sm mt-1">
          Les photos importées avec des métadonnées EXIF de géolocalisation apparaîtront automatiquement sur cette carte.
        </p>
      </div>
    );
  }

  // Determine initial center
  const center: [number, number] = hasPhotos
    ? [geotaggedPhotos[0].metadata!.latitude!, geotaggedPhotos[0].metadata!.longitude!]
    : legacyMarkers[0].position;

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-2xl overflow-hidden shadow-inner">
      {tileError && (
        <div className="absolute top-3 left-3 right-3 z-[1000] bg-amber-500/90 text-white text-label-sm font-medium px-4 py-2 rounded-xl backdrop-blur-md shadow-md flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">wifi_off</span>
          <span>Mode hors ligne : les tuiles cartographiques détaillées ne peuvent pas être chargées.</span>
        </div>
      )}

      <MapContainer
        center={center}
        zoom={geotaggedPhotos.length > 1 ? 5 : 12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          eventHandlers={{
            tileerror: () => setTileError(true),
          }}
        />

        {/* Real Geotagged Photos */}
        {geotaggedPhotos.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.metadata!.latitude!, photo.metadata!.longitude!]}
          >
            <Popup>
              <div className="p-1 space-y-2 max-w-[200px]">
                <p className="font-bold text-sm text-gray-900 leading-snug">{photo.alt || 'Photo'}</p>
                {photo.metadata?.location && (
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                    {photo.metadata.location}
                  </p>
                )}
                <p className="text-[11px] text-gray-500">{photo.date}</p>
                {onPhotoClick && (
                  <button
                    onClick={() => onPhotoClick(photo)}
                    className="w-full mt-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Voir la photo
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fallback Legacy Markers if any */}
        {!hasPhotos &&
          legacyMarkers.map((marker, idx) => (
            <Marker key={idx} position={marker.position}>
              <Popup>{marker.title}</Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
