'use client';

import { useState } from 'react';
import { apiFetch, ApiError } from '@/lib/api';
import type { Apreensao } from '@/lib/types';

interface Props {
  apreensao: Apreensao;
  onSalvo: () => Promise<void> | void;
}

// Segundo tempo do registro (blueprint 5.1): no canil, o condutor completa
// o que ficou pendente no momento do registro em campo — peso exato após a
// pesagem na balança e o número do BO/TCO.
export default function CompletarApreensao({ apreensao, onSalvo }: Props) {
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const [numeroBO, setNumeroBO] = useState(apreensao.ocorrencia?.numeroBO ?? '');
  const [pesoQuantidade, setPesoQuantidade] = useState(
    String(apreensao.entorpecente?.pesoQuantidade ?? ''),
  );
  const [formaAcondicionamento, setFormaAcondicionamento] = useState(
    apreensao.entorpecente?.formaAcondicionamento ?? '',
  );
  const [marca, setMarca] = useState(apreensao.arma?.marca ?? '');
  const [numeracao, setNumeracao] = useState(apreensao.arma?.numeracao ?? '');

  async function handleSalvar() {
    setSalvando(true);
    setErro(null);
    try {
      if (numeroBO !== (apreensao.ocorrencia?.numeroBO ?? '')) {
        await apiFetch(`/ocorrencias/${apreensao.ocorrenciaId}`, {
          method: 'PATCH',
          body: JSON.stringify({ numeroBO }),
        });
      }

      if (apreensao.tipo === 'ENTORPECENTE' && apreensao.entorpecente) {
        await apiFetch(`/apreensoes/${apreensao.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            entorpecente: {
              tipoSubstanciaId: apreensao.entorpecente.tipoSubstanciaId,
              pesoQuantidade: Number(pesoQuantidade),
              formaAcondicionamento,
            },
          }),
        });
      }

      if (apreensao.tipo === 'ARMA' && apreensao.arma) {
        await apiFetch(`/apreensoes/${apreensao.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            arma: { tipoArmaId: apreensao.arma.tipoArmaId, calibre: apreensao.arma.calibre, marca, numeracao },
          }),
        });
      }

      await onSalvo();
      setAberto(false);
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Erro ao salvar os dados complementares');
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-2 text-xs font-medium text-canil-gold"
      >
        Completar registro
      </button>
    );
  }

  return (
    <div className="mt-2 space-y-2 rounded-md border border-canil-border bg-canil-bg p-3">
      <div className="space-y-1">
        <label className="text-xs text-canil-text-muted">Número do BO/TCO</label>
        <input
          value={numeroBO}
          onChange={(e) => setNumeroBO(e.target.value)}
          className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2 text-sm"
        />
      </div>

      {apreensao.tipo === 'ENTORPECENTE' && (
        <>
          <div className="space-y-1">
            <label className="text-xs text-canil-text-muted">Peso/quantidade exato (g)</label>
            <input
              type="number"
              inputMode="decimal"
              value={pesoQuantidade}
              onChange={(e) => setPesoQuantidade(e.target.value)}
              className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-canil-text-muted">Forma de acondicionamento</label>
            <input
              value={formaAcondicionamento}
              onChange={(e) => setFormaAcondicionamento(e.target.value)}
              className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2 text-sm"
            />
          </div>
        </>
      )}

      {apreensao.tipo === 'ARMA' && (
        <>
          <div className="space-y-1">
            <label className="text-xs text-canil-text-muted">Marca</label>
            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-canil-text-muted">Numeração</label>
            <input
              value={numeracao}
              onChange={(e) => setNumeracao(e.target.value)}
              className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2 text-sm"
            />
          </div>
        </>
      )}

      {erro && <p className="text-xs text-red-400">{erro}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSalvar}
          disabled={salvando}
          className="rounded bg-canil-gold text-canil-bg px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
        <button type="button" onClick={() => setAberto(false)} className="px-3 py-1.5 text-xs text-canil-text-muted">
          Cancelar
        </button>
      </div>
    </div>
  );
}
