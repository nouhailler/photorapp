import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issue in React
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface MapComponentProps {
  markers: { position: [number, number], title: string }[];
}

const MapComponent: React.FC<MapComponentProps> = ({ markers }) => {
  const defaultCenter: [number, number] = markers.length > 0 ? markers[0].position : [48.8566, 2.3522]; // Paris default

  return (
    <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {markers.map((marker, idx) => (
        <Marker key={idx} position={marker.position}>
          <Popup>{marker.title}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;
