'use client';

import { useEffect, useState } from 'react';
import { useSessao } from '@/lib/use-sessao';
import { apiFetch, ApiError } from '@/lib/api';
import type { Binomio, Cao } from '@/lib/types';

interface Condutor {
  id: string;
  nomeGuerra: string;
}

export default function BinomiosPage() {
  const sessao = useSessao(['COMANDANTE', 'ADMIN']);
  const [binomios, setBinomios] = useState<Binomio[]>([]);
  const [condutores, setCondutores] = useState<Condutor[]>([]);
  const [caes, setCaes] = useState<Cao[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [condutorId, setCondutorId] = useState('');
  const [caoId, setCaoId] = useState('');
  const [dataInicio, setDataInicio] = useState('');

  async function carregar() {
    const [listaBinomios, listaCondutores, listaCaes] = await Promise.all([
      apiFetch<Binomio[]>('/binomios'),
      apiFetch<Condutor[]>('/condutores'),
      apiFetch<Cao[]>('/caes'),
    ]);
    setBinomios(listaBinomios);
    setCondutores(listaCondutores);
    setCaes(listaCaes);
  }

  useEffect(() => {
    if (sessao) carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await apiFetch('/binomios', {
        method: 'POST',
        body: JSON.stringify({ condutorId, caoId, dataInicio }),
      });
      setCondutorId('');
      setCaoId('');
      setDataInicio('');
      setMostrarForm(false);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar o binômio');
    } finally {
      setSalvando(false);
    }
  }

  async function handleEncerrar(id: string) {
    const dataFim = new Date().toISOString().slice(0, 10);
    await apiFetch(`/binomios/${id}/encerrar`, { method: 'PATCH', body: JSON.stringify({ dataFim }) });
    await carregar();
  }

  if (!sessao) return null;
  const podeEditar = sessao.perfil === 'ADMIN';

  return (
    <main className="flex-1 space-y-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-canil-text">Binômios</h1>
        {podeEditar && (
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="rounded bg-canil-gold px-3 py-1.5 text-sm font-semibold text-canil-bg"
          >
            {mostrarForm ? 'Cancelar' : 'Novo binômio'}
          </button>
        )}
      </header>

      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-3 rounded border border-canil-border bg-canil-bg-elevated p-4"
        >
          <select
            value={condutorId}
            onChange={(e) => setCondutorId(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          >
            <option value="">Condutor...</option>
            {condutores.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nomeGuerra}
              </option>
            ))}
          </select>
          <select
            value={caoId}
            onChange={(e) => setCaoId(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          >
            <option value="">Cão...</option>
            {caes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
          {erro && <p className="col-span-2 text-sm text-red-400">{erro}</p>}
          <p className="col-span-2 text-xs text-canil-text-muted">
            Se o cão já tiver um binômio ativo, ele será encerrado automaticamente na data de início deste.
          </p>
          <button
            type="submit"
            disabled={salvando}
            className="col-span-2 rounded bg-canil-gold px-3 py-2 text-sm font-semibold text-canil-bg disabled:opacity-50"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      <table className="w-full rounded border border-canil-border bg-canil-bg-elevated text-sm">
        <thead className="border-b border-canil-border text-left text-canil-text-muted">
          <tr>
            <th className="p-3">Condutor</th>
            <th className="p-3">Cão</th>
            <th className="p-3">Início</th>
            <th className="p-3">Fim</th>
            {podeEditar && <th className="p-3" />}
          </tr>
        </thead>
        <tbody>
          {binomios.map((b) => (
            <tr key={b.id} className="border-b border-canil-border last:border-0">
              <td className="p-3 font-medium text-canil-text">{b.condutor?.nomeGuerra}</td>
              <td className="p-3 text-canil-text-muted">{b.cao?.nome}</td>
              <td className="p-3 text-canil-text-muted">
                {new Date(b.dataInicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
              </td>
              <td className="p-3 text-canil-text-muted">
                {b.dataFim ? new Date(b.dataFim).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'Ativo'}
              </td>
              {podeEditar && (
                <td className="p-3">
                  {!b.dataFim && (
                    <button onClick={() => handleEncerrar(b.id)} className="text-sm text-red-400">
                      Encerrar
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
          {binomios.length === 0 && (
            <tr>
              <td colSpan={5} className="p-3 text-center text-canil-text-muted">
                Nenhum binômio cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
