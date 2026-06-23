'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const icone = L.icon({
  iconUrl: '/leaflet/marker-icon.png',
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  shadowUrl: '/leaflet/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Props {
  latitude: number;
  longitude: number;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

// Registro tardio: quando o condutor não está no local da ocorrência no
// momento do registro, o GPS automático capturaria a posição errada. Em
// vez disso, ele ajusta manualmente o pino pra onde a apreensão realmente
// aconteceu.
export default function MapaPinArrastavel({ latitude, longitude, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const mapa = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapa);

    const marker = L.marker([latitude, longitude], { icon: icone, draggable: true }).addTo(mapa);
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      onChange({ latitude: pos.lat, longitude: pos.lng });
    });

    mapRef.current = mapa;
    markerRef.current = marker;

    return () => {
      mapa.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-1">
      <div ref={containerRef} className="h-56 w-full rounded-md border border-canil-border" />
      <p className="text-xs text-canil-text-muted">Arraste o pino para o local correto da ocorrência.</p>
    </div>
  );
}
