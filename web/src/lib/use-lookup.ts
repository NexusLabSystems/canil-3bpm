'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from './api';
import type { Lookup } from './types';

// Cacheia cada lista de apoio localmente para que os botões de seleção
// (tipo de substância, tipo de arma, tipo de ocorrência) continuem
// funcionando mesmo sem rede no momento do registro.
export function useLookup(tipo: 'especialidades' | 'tipos-substancia' | 'tipos-arma' | 'tipos-ocorrencia') {
  const cacheKey = `canil:lookup:${tipo}`;
  const [itens, setItens] = useState<Lookup[]>([]);

  useEffect(() => {
    const cacheado = localStorage.getItem(cacheKey);
    if (cacheado) setItens(JSON.parse(cacheado));

    apiFetch<Lookup[]>(`/lookups/${tipo}?ativos=true`)
      .then((dados) => {
        setItens(dados);
        localStorage.setItem(cacheKey, JSON.stringify(dados));
      })
      .catch(() => {
        /* offline: mantém o que já estiver em cache */
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  return itens;
}
