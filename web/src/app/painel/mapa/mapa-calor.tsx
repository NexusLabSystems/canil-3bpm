'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

interface Props {
  pontos: { latitude: number; longitude: number; intensidade?: number }[];
}

const CENTRO_PADRAO: [number, number] = [-15.78, -47.93];

export default function MapaCalor({ pontos }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const heatRef = useRef<L.HeatLayer | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const mapa = L.map(containerRef.current, {
      center: pontos[0] ? [pontos[0].latitude, pontos[0].longitude] : CENTRO_PADRAO,
      zoom: pontos.length ? 12 : 4,
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapa);

    mapRef.current = mapa;

    return () => {
      mapa.remove();
      mapRef.current = null;
      heatRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mapa = mapRef.current;
    if (!mapa) return;

    if (heatRef.current) {
      mapa.removeLayer(heatRef.current);
      heatRef.current = null;
    }

    if (pontos.length > 0) {
      const heat = L.heatLayer(
        pontos.map((p) => [p.latitude, p.longitude, p.intensidade ?? 1]),
        { radius: 25, blur: 20, maxZoom: 17 },
      ).addTo(mapa);
      heatRef.current = heat;

      const bounds = L.latLngBounds(pontos.map((p) => [p.latitude, p.longitude]));
      mapa.fitBounds(bounds, { maxZoom: 14, padding: [30, 30] });
    }
  }, [pontos]);

  return <div ref={containerRef} className="h-[28rem] w-full rounded-md border border-canil-border" />;
}
