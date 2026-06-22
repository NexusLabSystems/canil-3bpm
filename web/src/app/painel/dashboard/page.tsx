'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSessao } from '@/lib/use-sessao';
import { apiFetch } from '@/lib/api';
import type { Apreensao, TipoEventoOcorrencia } from '@/lib/types';
import { IconMap, IconPaw, IconShield, IconTarget } from '../../icons';

const TIPO_ROTULO: Record<string, string> = {
  ENTORPECENTE: 'Entorpecente',
  ARMA: 'Arma',
  MUNICAO: 'Munição',
  DINHEIRO: 'Dinheiro',
  VEICULO: 'Veículo',
  OUTROS: 'Outros',
};

const STATUS_ESTILO: Record<string, string> = {
  PENDENTE_REVISAO: 'border-amber-700 text-amber-400',
  VALIDADA: 'border-canil-gold text-canil-gold',
  DEVOLVIDA: 'border-red-700 text-red-400',
  RASCUNHO: 'border-canil-border text-canil-text-muted',
};

const STATUS_ROTULO: Record<string, string> = {
  PENDENTE_REVISAO: 'Aguardando revisão',
  VALIDADA: 'Validada',
  DEVOLVIDA: 'Devolvida',
  RASCUNHO: 'Rascunho',
};

const EVENTO_ROTULO: Record<TipoEventoOcorrencia, string> = {
  OPERACAO_PROGRAMADA: 'Operação programada',
  OCORRENCIA_PATRULHAMENTO: 'Ocorrência de patrulhamento',
  APOIO_OUTRA_UNIDADE: 'Apoio a outra unidade',
};

const formatadorMoeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function contarOrdenado(itens: Apreensao[], chave: (a: Apreensao) => string) {
  const contagem: Record<string, number> = {};
  for (const a of itens) {
    const nome = chave(a);
    contagem[nome] = (contagem[nome] ?? 0) + 1;
  }
  return Object.entries(contagem).sort((a, b) => b[1] - a[1]);
}

export default function DashboardPage() {
  const sessao = useSessao(['COMANDANTE', 'ADMIN']);
  const [apreensoes, setApreensoes] = useState<Apreensao[]>([]);
  const [periodo, setPeriodo] = useState<'tudo' | 'mes'>('tudo');

  useEffect(() => {
    if (!sessao) return;
    apiFetch<Apreensao[]>('/apreensoes').then(setApreensoes).catch(() => {});
  }, [sessao]);

  const filtradas = useMemo(() => {
    if (periodo === 'tudo') return apreensoes;
    const agora = new Date();
    return apreensoes.filter((a) => {
      const data = new Date(a.horario);
      return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
    });
  }, [apreensoes, periodo]);

  const porTipo = useMemo(() => contarOrdenado(filtradas, (a) => a.tipo), [filtradas]);
  const maiorPorTipo = porTipo[0]?.[1] ?? 0;

  const rankingCaes = useMemo(() => contarOrdenado(filtradas, (a) => a.cao?.nome ?? 'Desconhecido'), [filtradas]);
  const rankingBinomios = useMemo(
    () =>
      contarOrdenado(
        filtradas,
        (a) => `${a.binomio?.condutor?.nomeGuerra ?? 'Sem condutor'} + ${a.cao?.nome ?? '?'}`,
      ),
    [filtradas],
  );

  const valorTotal = useMemo(
    () => filtradas.reduce((soma, a) => soma + (a.valorEstimado ?? 0), 0),
    [filtradas],
  );

  const porEvento = useMemo(
    () => contarOrdenado(filtradas, (a) => a.ocorrencia?.tipoEvento ?? 'OCORRENCIA_PATRULHAMENTO'),
    [filtradas],
  );

  const recentes = useMemo(
    () =>
      [...filtradas]
        .sort((a, b) => new Date(b.horario).getTime() - new Date(a.horario).getTime())
        .slice(0, 6),
    [filtradas],
  );

  if (!sessao) return null;

  return (
    <main className="flex-1 space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-canil-text">Indicadores</h1>
          <p className="text-sm text-canil-text-muted">Visão geral das apreensões do pelotão</p>
        </div>
        <div className="flex rounded border border-canil-border bg-canil-bg-elevated p-1 text-xs">
          {(['tudo', 'mes'] as const).map((opcao) => (
            <button
              key={opcao}
              onClick={() => setPeriodo(opcao)}
              className={`rounded px-3 py-1.5 font-medium ${
                periodo === opcao ? 'bg-canil-gold text-canil-bg' : 'text-canil-text-muted'
              }`}
            >
              {opcao === 'tudo' ? 'Todo o período' : 'Este mês'}
            </button>
          ))}
        </div>
      </header>

      {/* KPIs */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded border border-canil-border bg-canil-bg-elevated p-4">
          <div className="flex items-center gap-2 text-canil-text-muted">
            <IconPaw className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Total de apreensões</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-canil-gold">{filtradas.length}</p>
        </div>
        <div className="rounded border border-canil-border bg-canil-bg-elevated p-4">
          <div className="flex items-center gap-2 text-canil-text-muted">
            <IconTarget className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Valor estimado apreendido</p>
          </div>
          <p className="mt-2 text-2xl font-bold text-canil-text">{formatadorMoeda.format(valorTotal)}</p>
        </div>
        <div className="rounded border border-canil-border bg-canil-bg-elevated p-4">
          <div className="flex items-center gap-2 text-canil-text-muted">
            <IconShield className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Cão destaque</p>
          </div>
          <p className="mt-2 text-lg font-bold text-canil-text">{rankingCaes[0]?.[0] ?? '—'}</p>
          {rankingCaes[0] && <p className="text-xs text-canil-text-muted">{rankingCaes[0][1]} apreensões</p>}
        </div>
        <div className="rounded border border-canil-border bg-canil-bg-elevated p-4">
          <div className="flex items-center gap-2 text-canil-text-muted">
            <IconMap className="h-4 w-4" />
            <p className="text-xs uppercase tracking-wide">Binômio destaque</p>
          </div>
          <p className="mt-2 text-lg font-bold text-canil-text">{rankingBinomios[0]?.[0] ?? '—'}</p>
          {rankingBinomios[0] && (
            <p className="text-xs text-canil-text-muted">{rankingBinomios[0][1]} apreensões</p>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Por tipo */}
        <section className="rounded border border-canil-border bg-canil-bg-elevated p-4">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-canil-text">Apreensões por tipo</h2>
          <div className="space-y-3">
            {porTipo.map(([tipo, total]) => (
              <div key={tipo}>
                <div className="mb-1 flex justify-between text-xs text-canil-text-muted">
                  <span>{TIPO_ROTULO[tipo] ?? tipo}</span>
                  <span className="font-medium text-canil-text">{total}</span>
                </div>
                <div className="h-2 rounded-full bg-canil-border">
                  <div
                    className="h-2 rounded-full bg-canil-gold"
                    style={{ width: `${maiorPorTipo ? (total / maiorPorTipo) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {porTipo.length === 0 && <p className="text-sm text-canil-text-muted">Sem dados ainda.</p>}
          </div>
        </section>

        {/* Comparativo de origem */}
        <section className="rounded border border-canil-border bg-canil-bg-elevated p-4">
          <h2 className="mb-4 text-sm font-semibold tracking-wide text-canil-text">
            Operações x ocorrências
          </h2>
          <div className="space-y-3">
            {porEvento.map(([evento, total]) => (
              <div key={evento}>
                <div className="mb-1 flex justify-between text-xs text-canil-text-muted">
                  <span>{EVENTO_ROTULO[evento as TipoEventoOcorrencia] ?? evento}</span>
                  <span className="font-medium text-canil-text">{total}</span>
                </div>
                <div className="h-2 rounded-full bg-canil-border">
                  <div
                    className="h-2 rounded-full bg-canil-gold-soft"
                    style={{ width: `${filtradas.length ? (total / filtradas.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
            {porEvento.length === 0 && <p className="text-sm text-canil-text-muted">Sem dados ainda.</p>}
          </div>
        </section>

        {/* Ranking cães */}
        <section className="rounded border border-canil-border bg-canil-bg-elevated p-4">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-canil-text">Ranking por cão</h2>
          <ul className="space-y-2">
            {rankingCaes.map(([nome, total], i) => (
              <li key={nome} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-canil-text-muted">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-canil-border text-xs text-canil-gold">
                    {i + 1}
                  </span>
                  {nome}
                </span>
                <span className="font-medium text-canil-text">{total}</span>
              </li>
            ))}
            {rankingCaes.length === 0 && <p className="text-sm text-canil-text-muted">Sem dados ainda.</p>}
          </ul>
        </section>

        {/* Ranking binômios */}
        <section className="rounded border border-canil-border bg-canil-bg-elevated p-4">
          <h2 className="mb-3 text-sm font-semibold tracking-wide text-canil-text">Ranking por binômio</h2>
          <ul className="space-y-2">
            {rankingBinomios.map(([nome, total], i) => (
              <li key={nome} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-canil-text-muted">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-canil-border text-xs text-canil-gold">
                    {i + 1}
                  </span>
                  {nome}
                </span>
                <span className="font-medium text-canil-text">{total}</span>
              </li>
            ))}
            {rankingBinomios.length === 0 && <p className="text-sm text-canil-text-muted">Sem dados ainda.</p>}
          </ul>
        </section>
      </div>

      {/* Atividade recente */}
      <section className="rounded border border-canil-border bg-canil-bg-elevated p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-canil-text">Atividade recente</h2>
        <ul className="divide-y divide-canil-border">
          {recentes.map((a) => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium text-canil-text">
                  {TIPO_ROTULO[a.tipo] ?? a.tipo} — {a.cao?.nome}
                </p>
                <p className="text-xs text-canil-text-muted">
                  {new Date(a.horario).toLocaleString('pt-BR')} · {a.binomio?.condutor?.nomeGuerra}
                </p>
              </div>
              <span
                className={`rounded border px-2 py-0.5 text-xs font-medium ${
                  STATUS_ESTILO[a.status] ?? 'border-canil-border text-canil-text-muted'
                }`}
              >
                {STATUS_ROTULO[a.status] ?? a.status}
              </span>
            </li>
          ))}
          {recentes.length === 0 && <p className="text-sm text-canil-text-muted">Sem dados ainda.</p>}
        </ul>
      </section>
    </main>
  );
}
