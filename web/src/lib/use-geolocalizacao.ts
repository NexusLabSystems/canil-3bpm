'use client';

import { useCallback, useEffect, useState } from 'react';

export function useGeolocalizacao() {
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  const buscar = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setErro('Geolocalização não suportada neste dispositivo');
      return;
    }

    setBuscando(true);
    setErro(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setBuscando(false);
      },
      () => {
        setErro('Não foi possível obter a localização. Verifique a permissão de GPS.');
        setBuscando(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    buscar();
  }, [buscar]);

  return { coords, erro, buscando, tentarNovamente: buscar };
}
