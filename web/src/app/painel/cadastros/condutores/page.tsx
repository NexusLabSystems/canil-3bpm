'use client';

import { useEffect, useState } from 'react';
import { useSessao } from '@/lib/use-sessao';
import { apiFetch, ApiError } from '@/lib/api';

interface Condutor {
  id: string;
  postoGraduacao: string;
  nomeGuerra: string;
  matricula: string;
  ativo: boolean;
  usuario?: { username: string; ativo: boolean } | null;
}

export default function CondutoresPage() {
  const sessao = useSessao(['COMANDANTE', 'ADMIN']);
  const [condutores, setCondutores] = useState<Condutor[]>([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [postoGraduacao, setPostoGraduacao] = useState('');
  const [nomeGuerra, setNomeGuerra] = useState('');
  const [matricula, setMatricula] = useState('');
  const [username, setUsername] = useState('');
  const [senhaInicial, setSenhaInicial] = useState('');

  async function carregar() {
    setCondutores(await apiFetch<Condutor[]>('/condutores'));
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
      await apiFetch('/condutores', {
        method: 'POST',
        body: JSON.stringify({
          postoGraduacao,
          nomeGuerra,
          matricula,
          username: username || undefined,
          senhaInicial: senhaInicial || undefined,
        }),
      });
      setPostoGraduacao('');
      setNomeGuerra('');
      setMatricula('');
      setUsername('');
      setSenhaInicial('');
      setMostrarForm(false);
      await carregar();
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar o condutor');
    } finally {
      setSalvando(false);
    }
  }

  if (!sessao) return null;
  const podeEditar = sessao.perfil === 'ADMIN';

  return (
    <main className="flex-1 space-y-4 p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-canil-text">Condutores</h1>
        {podeEditar && (
          <button
            onClick={() => setMostrarForm((v) => !v)}
            className="rounded bg-canil-gold px-3 py-1.5 text-sm font-semibold text-canil-bg"
          >
            {mostrarForm ? 'Cancelar' : 'Novo condutor'}
          </button>
        )}
      </header>

      {mostrarForm && (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-3 rounded border border-canil-border bg-canil-bg-elevated p-4"
        >
          <input
            placeholder="Posto/graduação"
            value={postoGraduacao}
            onChange={(e) => setPostoGraduacao(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
          <input
            placeholder="Nome de guerra"
            value={nomeGuerra}
            onChange={(e) => setNomeGuerra(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
          <input
            placeholder="Matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            required
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
          <div />
          <input
            placeholder="Usuário de acesso (opcional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
          <input
            placeholder="Senha inicial (opcional)"
            type="password"
            value={senhaInicial}
            onChange={(e) => setSenhaInicial(e.target.value)}
            className="rounded border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
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

      <table className="w-full rounded border border-canil-border bg-canil-bg-elevated text-sm">
        <thead className="border-b border-canil-border text-left text-canil-text-muted">
          <tr>
            <th className="p-3">Nome de guerra</th>
            <th className="p-3">Posto/graduação</th>
            <th className="p-3">Matrícula</th>
            <th className="p-3">Usuário</th>
          </tr>
        </thead>
        <tbody>
          {condutores.map((c) => (
            <tr key={c.id} className="border-b border-canil-border last:border-0">
              <td className="p-3 font-medium text-canil-text">{c.nomeGuerra}</td>
              <td className="p-3 text-canil-text-muted">{c.postoGraduacao}</td>
              <td className="p-3 text-canil-text-muted">{c.matricula}</td>
              <td className="p-3 text-canil-text-muted">{c.usuario?.username ?? '—'}</td>
            </tr>
          ))}
          {condutores.length === 0 && (
            <tr>
              <td colSpan={4} className="p-3 text-center text-canil-text-muted">
                Nenhum condutor cadastrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
