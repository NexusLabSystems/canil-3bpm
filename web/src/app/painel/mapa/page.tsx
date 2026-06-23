'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSessao } from '@/lib/use-sessao';
import { apiFetch } from '@/lib/api';
import type { Apreensao, TipoApreensao } from '@/lib/types';

const MapaCalor = dynamic(() => import('./mapa-calor'), { ssr: false });

const TIPO_ROTULO: Record<TipoApreensao, string> = {
  ENTORPECENTE: 'Entorpecente',
  ARMA: 'Arma',
  MUNICAO: 'Munição',
  DINHEIRO: 'Dinheiro',
  VEICULO: 'Veículo',
  OUTROS: 'Outros',
};

export default function MapaPage() {
  const sessao = useSessao(['COMANDANTE', 'ADMIN']);
  const [apreensoes, setApreensoes] = useState<Apreensao[]>([]);
  const [periodo, setPeriodo] = useState<'tudo' | 'mes'>('tudo');
  const [tipoFiltro, setTipoFiltro] = useState<TipoApreensao | 'TODOS'>('TODOS');

  useEffect(() => {
    if (!sessao) return;
    apiFetch<Apreensao[]>('/apreensoes').then(setApreensoes).catch(() => {});
  }, [sessao]);

  const filtradas = useMemo(() => {
    let lista = apreensoes;
    if (periodo === 'mes') {
      const agora = new Date();
      lista = lista.filter((a) => {
        const data = new Date(a.horario);
        return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
      });
    }
    if (tipoFiltro !== 'TODOS') lista = lista.filter((a) => a.tipo === tipoFiltro);
    return lista;
  }, [apreensoes, periodo, tipoFiltro]);

  const pontos = useMemo(
    () => filtradas.map((a) => ({ latitude: a.latitude, longitude: a.longitude })),
    [filtradas],
  );

  if (!sessao) return null;

  return (
    <main className="flex-1 space-y-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-canil-text">Mapa de calor</h1>
          <p className="text-sm text-canil-text-muted">
            {pontos.length} apreensão(ões) no recorte selecionado — útil pra planejar onde concentrar operações.
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value as 'tudo' | 'mes')}
            className="rounded border border-canil-border bg-canil-bg-elevated px-3 py-2 text-sm text-canil-text"
          >
            <option value="tudo">Todo o período</option>
            <option value="mes">Este mês</option>
          </select>
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as TipoApreensao | 'TODOS')}
            className="rounded border border-canil-border bg-canil-bg-elevated px-3 py-2 text-sm text-canil-text"
          >
            <option value="TODOS">Todos os tipos</option>
            {Object.entries(TIPO_ROTULO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </div>
      </header>

      <MapaCalor pontos={pontos} />
    </main>
  );
}
