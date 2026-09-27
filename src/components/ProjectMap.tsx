import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Incident {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

function FitBounds({ center, incidents }: { center: { lat: number; lng: number }; incidents: Incident[] }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [[center.lat, center.lng], ...incidents.map((i): [number, number] => [i.lat, i.lng])];
    if (points.length > 1) {
      map.fitBounds(points, { padding: [32, 32], maxZoom: 16 });
    } else {
      map.setView([center.lat, center.lng], 14);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center.lat, center.lng, incidents.length]);
  return null;
}

export function ProjectMap({
  center,
  label,
  incidents = [],
  height = 280,
}: {
  center: { lat: number; lng: number };
  label: string;
  incidents?: Incident[];
  height?: number;
}) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-sm border border-[var(--color-line)]">
      <MapContainer center={[center.lat, center.lng]} zoom={14} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds center={center} incidents={incidents} />
        <Marker position={[center.lat, center.lng]}>
          <Popup>{label}</Popup>
        </Marker>
        {incidents.map((inc) => (
          <CircleMarker
            key={inc.id}
            center={[inc.lat, inc.lng]}
            radius={7}
            pathOptions={{ color: '#9A3A2E', fillColor: '#9A3A2E', fillOpacity: 0.6 }}
          >
            <Popup>{inc.label}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
