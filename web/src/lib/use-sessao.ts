'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { obterSessao } from './auth';
import type { PerfilUsuario, SessaoUsuario } from './types';

export function useSessao(perfisPermitidos: PerfilUsuario[]) {
  const router = useRouter();
  const [sessao, setSessao] = useState<SessaoUsuario | null | undefined>(undefined);

  useEffect(() => {
    const atual = obterSessao();
    if (!atual || !perfisPermitidos.includes(atual.perfil)) {
      router.replace('/login');
      return;
    }
    setSessao(atual);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return sessao;
}
