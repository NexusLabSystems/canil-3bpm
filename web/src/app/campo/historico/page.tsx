'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessao } from '@/lib/use-sessao';
import { apiFetch } from '@/lib/api';
import { limparSessao } from '@/lib/auth';
import { listarFila, sincronizarFila, type RegistroEnfileirado } from '@/lib/offline-queue';
import type { Apreensao } from '@/lib/types';
import CompletarApreensao from './completar-apreensao';

const STATUS_ROTULO: Record<string, string> = {
  PENDENTE_REVISAO: 'Aguardando revisão',
  VALIDADA: 'Validada',
  DEVOLVIDA: 'Devolvida pelo comando',
  RASCUNHO: 'Rascunho',
};

export default function HistoricoPage() {
  const router = useRouter();
  const sessao = useSessao(['CONDUTOR']);
  const [apreensoes, setApreensoes] = useState<Apreensao[]>([]);
  const [fila, setFila] = useState<RegistroEnfileirado[]>([]);
  const [sincronizando, setSincronizando] = useState(false);

  async function carregarApreensoes() {
    const dados = await apiFetch<Apreensao[]>('/apreensoes');
    setApreensoes(dados);
  }

  useEffect(() => {
    if (!sessao) return;
    apiFetch<Apreensao[]>('/apreensoes').then(setApreensoes).catch(() => {});
    listarFila().then(setFila);
  }, [sessao]);

  async function handleSincronizar() {
    setSincronizando(true);
    try {
      await sincronizarFila();
      setFila(await listarFila());
      const atualizado = await apiFetch<Apreensao[]>('/apreensoes');
      setApreensoes(atualizado);
    } finally {
      setSincronizando(false);
    }
  }

  if (!sessao) return null;

  return (
    <main className="flex flex-1 flex-col gap-4 bg-canil-bg p-4 text-canil-text">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">Histórico</h1>
        <div className="flex items-center gap-3">
          <Link href="/campo/nova-apreensao" className="text-sm text-canil-gold">
            Nova apreensão
          </Link>
          <button
            type="button"
            onClick={() => {
              limparSessao();
              router.replace('/login');
            }}
            className="text-sm text-red-400"
          >
            Sair
          </button>
        </div>
      </header>

      {fila.length > 0 && (
        <section className="rounded-md bg-amber-950 p-3">
          <p className="text-sm text-amber-300">
            {fila.length} registro(s) aguardando sincronização neste aparelho.
          </p>
          <button
            onClick={handleSincronizar}
            disabled={sincronizando}
            className="mt-2 rounded bg-amber-700 px-3 py-1 text-sm disabled:opacity-50"
          >
            {sincronizando ? 'Sincronizando...' : 'Sincronizar agora'}
          </button>
        </section>
      )}

      <ul className="space-y-2">
        {apreensoes.map((a) => (
          <li key={a.id} className="rounded-md border border-canil-border bg-canil-bg-elevated p-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{a.tipo}</span>
              <span className="text-xs text-canil-text-muted">{STATUS_ROTULO[a.status]}</span>
            </div>
            <p className="text-xs text-canil-text-muted">{new Date(a.horario).toLocaleString('pt-BR')}</p>
            {a.localAproximado && (
              <p className="text-xs text-amber-400">Local aproximado (registro tardio)</p>
            )}
            {a.fotos.length > 0 && (
              <div className="mt-2 flex gap-2">
                {a.fotos.map((f) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={f.id} src={f.url} alt="Foto da apreensão" className="h-16 w-16 rounded object-cover" />
                ))}
              </div>
            )}
            {(a.status === 'RASCUNHO' || a.status === 'PENDENTE_REVISAO') && (
              <CompletarApreensao apreensao={a} onSalvo={carregarApreensoes} />
            )}
          </li>
        ))}
        {apreensoes.length === 0 && (
          <p className="text-sm text-canil-text-muted">Nenhuma apreensão registrada ainda.</p>
        )}
      </ul>
    </main>
  );
}
