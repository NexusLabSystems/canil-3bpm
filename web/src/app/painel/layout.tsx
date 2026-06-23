'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { obterSessao, limparSessao } from '@/lib/auth';
import type { SessaoUsuario } from '@/lib/types';
import { IconShield } from '../icons';

const LINKS = [
  { href: '/painel/dashboard', rotulo: 'Dashboard' },
  { href: '/painel/mapa', rotulo: 'Mapa de calor' },
  { href: '/painel/validacao', rotulo: 'Caixa de validação' },
  { href: '/painel/cadastros/caes', rotulo: 'Cães' },
  { href: '/painel/cadastros/condutores', rotulo: 'Condutores' },
  { href: '/painel/cadastros/binomios', rotulo: 'Binômios' },
  { href: '/painel/cadastros/lookups', rotulo: 'Listas de apoio' },
];

const LINK_AUDITORIA = { href: '/painel/auditoria', rotulo: 'Auditoria' };

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessao, setSessao] = useState<SessaoUsuario | null>(null);

  useEffect(() => {
    setSessao(obterSessao());
  }, []);

  function handleSair() {
    limparSessao();
    router.replace('/login');
  }

  return (
    <div className="flex flex-1 flex-col bg-canil-bg">
      <nav className="flex items-center justify-between gap-4 border-b border-canil-border bg-canil-bg-elevated px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <IconShield className="h-5 w-5 text-canil-gold" />
            <span className="text-xs font-bold tracking-widest text-canil-text">
              CANIL <span className="text-canil-gold">3º BPM</span>
            </span>
          </Link>
          <div className="hidden gap-4 md:flex">
            {[...LINKS, ...(sessao?.perfil === 'ADMIN' ? [LINK_AUDITORIA] : [])].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname.startsWith(link.href) ? 'text-canil-gold' : 'text-canil-text-muted'
                }`}
              >
                {link.rotulo}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {sessao && (
            <span className="text-sm text-canil-text-muted">
              {sessao.condutor?.nomeGuerra ?? sessao.username} · {sessao.perfil}
            </span>
          )}
          <button onClick={handleSair} className="text-sm font-medium text-red-400">
            Sair
          </button>
        </div>
      </nav>
      {children}
    </div>
  );
}
