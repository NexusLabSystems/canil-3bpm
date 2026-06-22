'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obterSessao } from '@/lib/auth';

interface Props {
  className?: string;
  children: React.ReactNode;
}

// Aponta para o login por padrão (igual ao HTML servido), e troca para a
// tela certa do usuário já autenticado depois que o componente monta —
// evita mismatch de hidratação entre servidor e cliente.
export default function AcessarLink({ className, children }: Props) {
  const [href, setHref] = useState('/login');

  useEffect(() => {
    const sessao = obterSessao();
    if (!sessao) return;
    setHref(sessao.perfil === 'CONDUTOR' ? '/campo/nova-apreensao' : '/painel/dashboard');
  }, []);

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
