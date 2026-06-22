'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from './api';
import type { Binomio } from './types';

const CACHE_KEY = 'canil:binomio-ativo';

export function useBinomioAtivo() {
  const [binomio, setBinomio] = useState<Binomio | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const cacheado = localStorage.getItem(CACHE_KEY);
    if (cacheado) setBinomio(JSON.parse(cacheado));

    apiFetch<Binomio>('/binomios/meu')
      .then((b) => {
        setBinomio(b);
        localStorage.setItem(CACHE_KEY, JSON.stringify(b));
      })
      .catch((err) => {
        // Sem rede e sem cache: não há binômio para pré-selecionar.
        if (!cacheado) setErro(err.message ?? 'Não foi possível carregar o binômio');
      })
      .finally(() => setCarregando(false));
  }, []);

  return { binomio, erro, carregando };
}
