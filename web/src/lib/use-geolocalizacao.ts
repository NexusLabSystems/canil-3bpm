'use client';

import { useEffect, useState } from 'react';

export function useGeolocalizacao() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setErro('Geolocalização não suportada neste dispositivo');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setErro('Não foi possível obter a localização. Verifique a permissão de GPS.'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return { coords, erro };
}
