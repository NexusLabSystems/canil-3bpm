'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSessao } from '@/lib/use-sessao';
import { apiFetch, ApiError } from '@/lib/api';
import type { Cao, Lookup } from '@/lib/types';

const STATUS_OPCOES = ['ATIVO', 'EM_TREINAMENTO', 'AFASTADO', 'REFORMADO'];

function vacinaInfo(cao: Cao): { texto: string; vencida: boolean } | null {
  const ultima = cao.registrosSaude?.[0];
  if (!ultima) return null;
  if (!ultima.proximaData) return { texto: 'Sem próxima dose registrada', vencida: false };
  const vencida = new Date(ultima.proximaData) < new Date();
  return {
    texto: `Próxima dose: ${new Date(ultima.proximaData).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`,
    vencida,
  };
}

export default function CaesPage() {
  const sessao = useSessao(['COMANDANTE', 'ADMIN']);
  const [caes, setCaes] = useState<Cao[]>([]);
  const [especialidades, setEspecialidades] = useState<Lookup[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [sexo, setSexo] = useState<'MACHO' | 'FEMEA'>('MACHO');
  const [dataNascimento, setDataNascimento] = useState('');
  const [registro, setRegistro] = useState('');
  const [especialidadeId, setEspecialidadeId] = useState('');

  async function carregar() {
    const [listaCaes, listaEspecialidades] = await Promise.all([
      apiFetch<Cao[]>('/caes'),
      apiFetch<Lookup[]>('/lookups/especialidades?ativos=true'),
    ]);
    setCaes(listaCaes);
    setEspecialidades(listaEspecialidades);
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
      await apiFetch('/caes', {
        method: 'POST',
        body: JSON.stringify({ nome, raca, sexo, dataNascimento, registro, especialidadeId }),
      });
      setNome('');
      setRaca('');
      setRegistro('');
      setDataNascimento('');
      setEspecialidadeId('');
      setMostrarForm(false);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar o cão');
    } finally {
      setSalvando(false);
    }
  }

  async function handleStatusChange(id: string, status: string) {
    await apiFetch(`/caes/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    await carregar();
  }

  if (!sessao) return null;
  const podeEditar = sessao.perfil === 'ADMIN';

  return (
    <main className="flex-1 space-y-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-canil-text">Cães</h1>
        {podeEditar && (
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="rounded bg-canil-gold px-3 py-1.5 text-sm font-semibold text-canil-bg"
          >
            {mostrarForm ? 'Cancelar' : 'Novo cão'}
          </button>
        )}
      </header>

      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-3 rounded border border-canil-border bg-canil-bg-elevated p-4"
        >
          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
          <input
            placeholder="Raça"
            value={raca}
            onChange={(e) => setRaca(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
          <select
            value={sexo}
            onChange={(e) => setSexo(e.target.value as 'MACHO' | 'FEMEA')}
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          >
            <option value="MACHO">Macho</option>
            <option value="FEMEA">Fêmea</option>
          </select>
          <input
            type="date"
            value={dataNascimento}
            onChange={(e) => setDataNascimento(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
          <input
            placeholder="Registro/microchip"
            value={registro}
            onChange={(e) => setRegistro(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
          <select
            value={especialidadeId}
            onChange={(e) => setEspecialidadeId(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          >
            <option value="">Especialidade...</option>
            {especialidades.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nome}
              </option>
            ))}
          </select>
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

      <table className="w-full rounded border border-canil-border bg-canil-bg-elevated text-sm">
        <thead className="border-b border-canil-border text-left text-canil-text-muted">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">Raça</th>
            <th className="p-3">Especialidade</th>
            <th className="p-3">Vacinação</th>
            <th className="p-3">Status</th>
            <th className="p-3" />
          </tr>
        </thead>
        <tbody>
          {caes.map((c) => {
            const vacina = vacinaInfo(c);
            return (
              <tr key={c.id} className="border-b border-canil-border last:border-0">
                <td className="p-3 font-medium text-canil-text">{c.nome}</td>
                <td className="p-3 text-canil-text-muted">{c.raca}</td>
                <td className="p-3 text-canil-text-muted">{c.especialidade?.nome}</td>
                <td className="p-3">
                  {vacina ? (
                    <span className={`text-xs ${vacina.vencida ? 'text-red-400' : 'text-canil-text-muted'}`}>
                      {vacina.vencida ? 'Vacina vencida' : vacina.texto}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-400">Sem registro de vacina</span>
                  )}
                </td>
                <td className="p-3">
                  {podeEditar ? (
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c.id, e.target.value)}
                      className="rounded border border-canil-border bg-canil-bg px-2 py-1 text-canil-text"
                    >
                      {STATUS_OPCOES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-canil-text-muted">{c.status}</span>
                  )}
                </td>
                <td className="p-3">
                  <Link href={`/painel/cadastros/caes/${c.id}`} className="text-sm text-canil-gold">
                    Ver saúde
                  </Link>
                </td>
              </tr>
            );
          })}
          {caes.length === 0 && (
            <tr>
              <td colSpan={6} className="p-3 text-center text-canil-text-muted">
                Nenhum cão cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
