'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSessao } from '@/lib/use-sessao';
import { apiFetch, ApiError } from '@/lib/api';
import type { Cao, RegistroSaude, TipoRegistroSaude } from '@/lib/types';

const TIPO_OPCOES: { valor: TipoRegistroSaude; rotulo: string }[] = [
  { valor: 'VACINA', rotulo: 'Vacina' },
  { valor: 'CONSULTA', rotulo: 'Consulta' },
  { valor: 'EXAME', rotulo: 'Exame' },
  { valor: 'OUTRO', rotulo: 'Outro' },
];

const TIPO_ROTULO: Record<TipoRegistroSaude, string> = {
  VACINA: 'Vacina',
  CONSULTA: 'Consulta',
  EXAME: 'Exame',
  OUTRO: 'Outro',
};

export default function CaoDetalhePage() {
  const params = useParams<{ id: string }>();
  const sessao = useSessao(['COMANDANTE', 'ADMIN']);
  const [cao, setCao] = useState<Cao | null>(null);
  const [registros, setRegistros] = useState<RegistroSaude[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [tipo, setTipo] = useState<TipoRegistroSaude>('VACINA');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [proximaData, setProximaData] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [observacoes, setObservacoes] = useState('');

  async function carregar() {
    const [caoData, registrosData] = await Promise.all([
      apiFetch<Cao>(`/caes/${params.id}`),
      apiFetch<RegistroSaude[]>(`/caes/${params.id}/saude`),
    ]);
    setCao(caoData);
    setRegistros(registrosData);
  }

  useEffect(() => {
    if (sessao) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao, params.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await apiFetch(`/caes/${params.id}/saude`, {
        method: 'POST',
        body: JSON.stringify({
          tipo,
          descricao,
          data,
          proximaData: proximaData || undefined,
          veterinario: veterinario || undefined,
          observacoes: observacoes || undefined,
        }),
      });
      setDescricao('');
      setData('');
      setProximaData('');
      setVeterinario('');
      setObservacoes('');
      setMostrarForm(false);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar o registro');
    } finally {
      setSalvando(false);
    }
  }

  if (!sessao || !cao) return null;
  const podeEditar = sessao.perfil === 'ADMIN';

  return (
    <main className="flex-1 space-y-4 p-6">
      <Link href="/painel/cadastros/caes" className="text-sm text-canil-gold">
        ← Voltar pra lista de cães
      </Link>

      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-canil-text">{cao.nome}</h1>
          <p className="text-sm text-canil-text-muted">
            {cao.raca} · {cao.especialidade?.nome} · {cao.status}
          </p>
        </div>
        {podeEditar && (
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="rounded bg-canil-gold px-3 py-1.5 text-sm font-semibold text-canil-bg"
          >
            {mostrarForm ? 'Cancelar' : 'Novo registro'}
          </button>
        )}
      </header>

      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-3 rounded border border-canil-border bg-canil-bg-elevated p-4"
        >
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoRegistroSaude)}
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text"
          >
            {TIPO_OPCOES.map((t) => (
              <option key={t.valor} value={t.valor}>
                {t.rotulo}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text"
          />
          <input
            placeholder={tipo === 'VACINA' ? 'Nome da vacina' : 'Descrição'}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            required
            className="col-span-2 rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text"
          />
          <div className="space-y-1">
            <label className="text-xs text-canil-text-muted">
              {tipo === 'VACINA' ? 'Próxima dose (opcional)' : 'Próximo retorno (opcional)'}
            </label>
            <input
              type="date"
              value={proximaData}
              onChange={(e) => setProximaData(e.target.value)}
              className="w-full rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text"
            />
          </div>
          <input
            placeholder="Veterinário (opcional)"
            value={veterinario}
            onChange={(e) => setVeterinario(e.target.value)}
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text"
          />
          <textarea
            placeholder="Observações (opcional)"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            className="col-span-2 rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text"
          />
          {erro && <p className="col-span-2 text-sm text-red-400">{erro}</p>}
          <button
            type="submit"
            disabled={salvando}
            className="col-span-2 rounded bg-canil-gold px-3 py-2 text-sm font-semibold text-canil-bg disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      <section className="rounded border border-canil-border bg-canil-bg-elevated p-4">
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-canil-text">Histórico de saúde</h2>
        <ul className="space-y-3">
          {registros.map((r) => {
            const vencida = r.proximaData ? new Date(r.proximaData) < new Date() : false;
            return (
              <li key={r.id} className="rounded border border-canil-border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-canil-text">
                    {TIPO_ROTULO[r.tipo]} — {r.descricao}
                  </span>
                  <span className="text-xs text-canil-text-muted">
                    {new Date(r.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </span>
                </div>
                {r.proximaData && (
                  <p className={`mt-1 text-xs ${vencida ? 'text-red-400' : 'text-canil-text-muted'}`}>
                    {vencida ? 'Vencida em ' : 'Próxima em '}
                    {new Date(r.proximaData).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </p>
                )}
                {r.veterinario && (
                  <p className="mt-1 text-xs text-canil-text-muted">Responsável: {r.veterinario}</p>
                )}
                {r.observacoes && <p className="mt-1 text-xs text-canil-text-muted">{r.observacoes}</p>}
              </li>
            );
          })}
          {registros.length === 0 && (
            <p className="text-sm text-canil-text-muted">Nenhum registro de saúde ainda.</p>
          )}
        </ul>
      </section>
    </main>
  );
}
