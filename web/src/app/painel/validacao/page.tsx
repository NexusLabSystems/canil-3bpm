'use client';

import { useEffect, useState } from 'react';
import { useSessao } from '@/lib/use-sessao';
import { apiFetch } from '@/lib/api';
import type { Apreensao } from '@/lib/types';

export default function ValidacaoPage() {
  const sessao = useSessao(['COMANDANTE', 'ADMIN']);
  const [pendentes, setPendentes] = useState<Apreensao[]>([]);
  const [processando, setProcessando] = useState<string | null>(null);

  async function carregar() {
    const dados = await apiFetch<Apreensao[]>('/apreensoes?status=PENDENTE_REVISAO');
    setPendentes(dados);
  }

  useEffect(() => {
    if (sessao) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao]);

  async function revisar(id: string, decisao: 'VALIDADA' | 'DEVOLVIDA') {
    setProcessando(id);
    try {
      await apiFetch(`/apreensoes/${id}/revisar`, {
        method: 'PATCH',
        body: JSON.stringify({ decisao }),
      });
      await carregar();
    } finally {
      setProcessando(null);
    }
  }

  if (!sessao) return null;

  return (
    <main className="flex-1 space-y-4 p-6">
      <h1 className="text-xl font-semibold text-canil-text">Caixa de validação</h1>

      <ul className="space-y-3">
        {pendentes.map((a) => (
          <li key={a.id} className="rounded border border-canil-border bg-canil-bg-elevated p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-canil-text">
                  {a.tipo} — {a.cao?.nome}
                </p>
                <p className="text-sm text-canil-text-muted">
                  {new Date(a.horario).toLocaleString('pt-BR')} · binômio{' '}
                  {a.binomio?.condutor?.nomeGuerra}
                </p>
                {a.localAproximado && (
                  <p className="text-xs text-amber-400">
                    Local aproximado — registrado fora do local/momento da ocorrência
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => revisar(a.id, 'VALIDADA')}
                  disabled={processando === a.id}
                  className="rounded bg-canil-gold px-3 py-1 text-sm font-semibold text-canil-bg disabled:opacity-50"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => revisar(a.id, 'DEVOLVIDA')}
                  disabled={processando === a.id}
                  className="rounded border border-red-400 px-3 py-1 text-sm text-red-400 disabled:opacity-50"
                >
                  Devolver
                </button>
              </div>
            </div>
          </li>
        ))}
        {pendentes.length === 0 && (
          <p className="text-sm text-canil-text-muted">Nenhum registro aguardando revisão.</p>
        )}
      </ul>
    </main>
  );
}
