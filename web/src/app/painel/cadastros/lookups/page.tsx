'use client';

import { useEffect, useState } from 'react';
import { useSessao } from '@/lib/use-sessao';
import { apiFetch, ApiError } from '@/lib/api';
import type { Lookup } from '@/lib/types';

const TIPOS = [
  { valor: 'especialidades', rotulo: 'Especialidades' },
  { valor: 'tipos-substancia', rotulo: 'Tipos de substância' },
  { valor: 'tipos-arma', rotulo: 'Tipos de arma' },
  { valor: 'tipos-ocorrencia', rotulo: 'Tipos de ocorrência' },
] as const;

type TipoLookup = (typeof TIPOS)[number]['valor'];

export default function LookupsPage() {
  const sessao = useSessao(['COMANDANTE', 'ADMIN']);
  const [tipo, setTipo] = useState<TipoLookup>('especialidades');
  const [itens, setItens] = useState<Lookup[]>([]);
  const [novoNome, setNovoNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  async function carregar(t: TipoLookup) {
    setItens(await apiFetch<Lookup[]>(`/lookups/${t}`));
  }

  useEffect(() => {
    if (sessao) carregar(tipo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessao, tipo]);

  async function handleAdicionar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setSalvando(true);
    try {
      await apiFetch(`/lookups/${tipo}`, { method: 'POST', body: JSON.stringify({ nome: novoNome }) });
      setNovoNome('');
      await carregar(tipo);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar');
    } finally {
      setSalvando(false);
    }
  }

  async function handleToggleAtivo(item: Lookup) {
    await apiFetch(`/lookups/${tipo}/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ ativo: !item.ativo }),
    });
    await carregar(tipo);
  }

  if (!sessao) return null;
  const podeEditar = sessao.perfil === 'ADMIN';

  return (
    <main className="flex-1 space-y-4 p-6">
      <h1 className="text-xl font-semibold text-canil-text">Listas de apoio</h1>

      <div className="flex gap-2 border-b border-canil-border">
        {TIPOS.map((t) => (
          <button
            key={t.valor}
            onClick={() => setTipo(t.valor)}
            className={`px-3 py-2 text-sm ${
              tipo === t.valor
                ? 'border-b-2 border-canil-gold font-medium text-canil-gold'
                : 'text-canil-text-muted'
            }`}
          >
            {t.rotulo}
          </button>
        ))}
      </div>

      {podeEditar && (
        <form onSubmit={handleAdicionar} className="flex gap-2">
          <input
            placeholder="Novo item"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            required
            className="flex-1 rounded border border-canil-border bg-canil-bg-elevated px-3 py-2 text-sm text-canil-text focus:border-canil-gold focus:outline-none"
          />
          <button
            type="submit"
            disabled={salvando}
            className="rounded bg-canil-gold px-3 py-2 text-sm font-semibold text-canil-bg disabled:opacity-50"
          >
            Adicionar
          </button>
        </form>
      )}
      {erro && <p className="text-sm text-red-400">{erro}</p>}

      <ul className="divide-y divide-canil-border rounded border border-canil-border bg-canil-bg-elevated">
        {itens.map((item) => (
          <li key={item.id} className="flex items-center justify-between p-3 text-sm">
            <span className={item.ativo ? 'text-canil-text' : 'text-canil-text-muted line-through'}>
              {item.nome}
            </span>
            {podeEditar && (
              <button onClick={() => handleToggleAtivo(item)} className="text-xs text-canil-text-muted">
                {item.ativo ? 'Desativar' : 'Reativar'}
              </button>
            )}
          </li>
        ))}
        {itens.length === 0 && (
          <li className="p-3 text-center text-sm text-canil-text-muted">Nenhum item.</li>
        )}
      </ul>
    </main>
  );
}
