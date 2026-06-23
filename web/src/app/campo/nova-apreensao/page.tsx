'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSessao } from '@/lib/use-sessao';
import { useBinomioAtivo } from '@/lib/use-binomio-ativo';
import { useGeolocalizacao } from '@/lib/use-geolocalizacao';
import { useLookup } from '@/lib/use-lookup';
import { registrarApreensao } from '@/lib/offline-queue';
import { limparSessao } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import type { RegistroCampoPayload, TipoApreensao, TipoEventoOcorrencia } from '@/lib/types';

const MapaPinArrastavel = dynamic(() => import('./mapa-pin-arrastavel'), { ssr: false });

// Fallback quando o GPS falhar e o condutor escolher registro tardio sem
// nenhuma coordenada disponível ainda: centro aproximado do Brasil, só
// pra dar um ponto de partida pro pino ser arrastado até o lugar certo.
const COORDS_PADRAO = { latitude: -15.78, longitude: -47.93 };

const TIPOS: { valor: TipoApreensao; rotulo: string }[] = [
  { valor: 'ENTORPECENTE', rotulo: 'Entorpecente' },
  { valor: 'ARMA', rotulo: 'Arma' },
  { valor: 'MUNICAO', rotulo: 'Munição' },
  { valor: 'DINHEIRO', rotulo: 'Dinheiro' },
  { valor: 'VEICULO', rotulo: 'Veículo' },
  { valor: 'OUTROS', rotulo: 'Outros' },
];

const TIPOS_EVENTO: { valor: TipoEventoOcorrencia; rotulo: string }[] = [
  { valor: 'OCORRENCIA_PATRULHAMENTO', rotulo: 'Patrulhamento' },
  { valor: 'OPERACAO_PROGRAMADA', rotulo: 'Operação programada' },
  { valor: 'APOIO_OUTRA_UNIDADE', rotulo: 'Apoio a outra unidade' },
];

export default function NovaApreensaoPage() {
  const router = useRouter();
  const sessao = useSessao(['CONDUTOR']);
  const { binomio, erro: erroBinomio } = useBinomioAtivo();
  const { coords, erro: erroGps, buscando: buscandoGps, tentarNovamente: tentarGpsNovamente } = useGeolocalizacao();
  const tiposSubstancia = useLookup('tipos-substancia');
  const tiposArma = useLookup('tipos-arma');
  const tiposOcorrencia = useLookup('tipos-ocorrencia');

  const [registroTardio, setRegistroTardio] = useState(false);
  const [localManual, setLocalManual] = useState<{ latitude: number; longitude: number } | null>(null);

  const [tipo, setTipo] = useState<TipoApreensao | null>(null);
  const [tipoEvento, setTipoEvento] = useState<TipoEventoOcorrencia>('OCORRENCIA_PATRULHAMENTO');
  const [tipoOcorrenciaId, setTipoOcorrenciaId] = useState('');
  const [tipoSubstanciaId, setTipoSubstanciaId] = useState('');
  const [pesoQuantidade, setPesoQuantidade] = useState('');
  const [formaAcondicionamento, setFormaAcondicionamento] = useState('');
  const [tipoArmaId, setTipoArmaId] = useState('');
  const [calibre, setCalibre] = useState('');
  const [quantidadeMunicao, setQuantidadeMunicao] = useState('');
  const [descricaoOutro, setDescricaoOutro] = useState('');
  const [valorEstimado, setValorEstimado] = useState('');
  const [foto, setFoto] = useState<File | null>(null);

  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState<
    { tipo: 'ok' | 'offline' | 'erro'; texto: string; sessaoExpirada?: boolean } | null
  >(null);

  if (!sessao) return null;

  const coordsEfetivas = registroTardio ? localManual : coords;

  function handleToggleRegistroTardio() {
    if (!registroTardio) setLocalManual(coords ?? COORDS_PADRAO);
    setRegistroTardio((v) => !v);
  }

  function montarApreensao(): RegistroCampoPayload['apreensao'] | null {
    if (!tipo || !coordsEfetivas) return null;

    const base = {
      tipo,
      latitude: coordsEfetivas.latitude,
      longitude: coordsEfetivas.longitude,
      localAproximado: registroTardio,
      horario: new Date().toISOString(),
      valorEstimado: valorEstimado ? Number(valorEstimado) : undefined,
    };

    switch (tipo) {
      case 'ENTORPECENTE':
        if (!tipoSubstanciaId || !pesoQuantidade) return null;
        return {
          ...base,
          entorpecente: {
            tipoSubstanciaId,
            pesoQuantidade: Number(pesoQuantidade),
            formaAcondicionamento,
          },
        };
      case 'ARMA':
        if (!tipoArmaId) return null;
        return { ...base, arma: { tipoArmaId, calibre } };
      case 'MUNICAO':
        if (!calibre || !quantidadeMunicao) return null;
        return { ...base, municao: { calibre, quantidade: Number(quantidadeMunicao) } };
      case 'DINHEIRO':
      case 'VEICULO':
      case 'OUTROS':
        if (!descricaoOutro) return null;
        return { ...base, outro: { descricao: descricaoOutro } };
    }
  }

  async function handleSubmit() {
    if (!binomio || !tipoOcorrenciaId) {
      setMensagem({ tipo: 'erro', texto: 'Selecione o tipo de ocorrência antes de salvar.' });
      return;
    }

    const apreensao = montarApreensao();
    if (!apreensao) {
      setMensagem({ tipo: 'erro', texto: 'Preencha os campos obrigatórios do tipo selecionado.' });
      return;
    }

    setEnviando(true);
    setMensagem(null);

    try {
      const resultado = await registrarApreensao(
        {
          caoId: binomio.caoId,
          binomioId: binomio.id,
          tipoEvento,
          tipoOcorrenciaId,
          apreensao,
        },
        foto ?? undefined,
      );

      setMensagem(
        resultado.sincronizado
          ? { tipo: 'ok', texto: 'Apreensão registrada e sincronizada com sucesso.' }
          : {
              tipo: 'offline',
              texto: 'Sem sinal: apreensão (e foto, se houver) guardada no aparelho e será enviada automaticamente quando a rede voltar.',
            },
      );
      setTipo(null);
      setFoto(null);
      setRegistroTardio(false);
      setLocalManual(null);
    } catch (erro) {
      if (erro instanceof ApiError && erro.status === 401) {
        limparSessao();
        setMensagem({
          tipo: 'erro',
          texto: 'Sua sessão expirou. Faça login novamente — os dados preenchidos foram mantidos na tela.',
          sessaoExpirada: true,
        });
      } else {
        setMensagem({ tipo: 'erro', texto: 'Erro ao registrar a apreensão. Tente novamente.' });
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-4 bg-canil-bg p-4 text-canil-text">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Nova apreensão</h1>
          {binomio && (
            <p className="text-sm text-canil-text-muted">
              Binômio: {binomio.condutor?.nomeGuerra} + {binomio.cao?.nome}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Link href="/campo/historico" className="text-sm text-canil-gold">
            Histórico
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

      {erroBinomio && <p className="rounded bg-red-950 p-2 text-sm text-red-300">{erroBinomio}</p>}

      <section className="space-y-2">
        <label className="flex items-center gap-2 text-sm text-canil-text-muted">
          <input type="checkbox" checked={registroTardio} onChange={handleToggleRegistroTardio} />
          Registro tardio (fora do local da ocorrência)
        </label>

        {registroTardio ? (
          localManual && (
            <MapaPinArrastavel
              latitude={localManual.latitude}
              longitude={localManual.longitude}
              onChange={setLocalManual}
            />
          )
        ) : (
          <>
            {erroGps && (
              <div className="flex items-center justify-between gap-2 rounded bg-amber-950 p-2 text-sm text-amber-300">
                <span>{erroGps}</span>
                <button
                  type="button"
                  onClick={tentarGpsNovamente}
                  disabled={buscandoGps}
                  className="shrink-0 rounded border border-amber-700 px-2 py-1 text-xs font-medium disabled:opacity-50"
                >
                  {buscandoGps ? 'Buscando...' : 'Tentar novamente'}
                </button>
              </div>
            )}
            {coords && (
              <p className="text-xs text-canil-text-muted">
                GPS: {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
              </p>
            )}
          </>
        )}
      </section>

      <section className="space-y-2">
        <label className="text-sm text-canil-text-muted">Tipo de evento</label>
        <select
          value={tipoEvento}
          onChange={(e) => setTipoEvento(e.target.value as TipoEventoOcorrencia)}
          className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
        >
          {TIPOS_EVENTO.map((t) => (
            <option key={t.valor} value={t.valor}>
              {t.rotulo}
            </option>
          ))}
        </select>

        <label className="text-sm text-canil-text-muted">Tipo de ocorrência</label>
        <select
          value={tipoOcorrenciaId}
          onChange={(e) => setTipoOcorrenciaId(e.target.value)}
          className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
        >
          <option value="">Selecione...</option>
          {tiposOcorrencia.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </section>

      <section className="space-y-2">
        <p className="text-sm text-canil-text-muted">O que foi apreendido?</p>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map((t) => (
            <button
              key={t.valor}
              type="button"
              onClick={() => setTipo(t.valor)}
              className={`rounded-lg border px-4 py-6 text-base font-medium ${
                tipo === t.valor
                  ? 'border-canil-gold bg-canil-bg-elevated text-canil-gold'
                  : 'border-canil-border bg-canil-bg-elevated text-canil-text'
              }`}
            >
              {t.rotulo}
            </button>
          ))}
        </div>
      </section>

      {tipo === 'ENTORPECENTE' && (
        <section className="space-y-2">
          <select
            value={tipoSubstanciaId}
            onChange={(e) => setTipoSubstanciaId(e.target.value)}
            className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
          >
            <option value="">Substância...</option>
            {tiposSubstancia.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nome}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Peso/quantidade estimado (g)"
            value={pesoQuantidade}
            onChange={(e) => setPesoQuantidade(e.target.value)}
            className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
          />
          <input
            placeholder="Forma de acondicionamento (pode completar depois)"
            value={formaAcondicionamento}
            onChange={(e) => setFormaAcondicionamento(e.target.value)}
            className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
          />
        </section>
      )}

      {tipo === 'ARMA' && (
        <section className="space-y-2">
          <select
            value={tipoArmaId}
            onChange={(e) => setTipoArmaId(e.target.value)}
            className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
          >
            <option value="">Tipo de arma...</option>
            {tiposArma.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
          <input
            placeholder="Calibre (opcional)"
            value={calibre}
            onChange={(e) => setCalibre(e.target.value)}
            className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
          />
        </section>
      )}

      {tipo === 'MUNICAO' && (
        <section className="space-y-2">
          <input
            placeholder="Calibre"
            value={calibre}
            onChange={(e) => setCalibre(e.target.value)}
            className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
          />
          <input
            type="number"
            placeholder="Quantidade"
            value={quantidadeMunicao}
            onChange={(e) => setQuantidadeMunicao(e.target.value)}
            className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
          />
        </section>
      )}

      {(tipo === 'DINHEIRO' || tipo === 'VEICULO' || tipo === 'OUTROS') && (
        <section className="space-y-2">
          <textarea
            placeholder="Descrição"
            value={descricaoOutro}
            onChange={(e) => setDescricaoOutro(e.target.value)}
            className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
          />
        </section>
      )}

      {tipo && (
        <section className="space-y-2">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Valor estimado em R$ (opcional)"
            value={valorEstimado}
            onChange={(e) => setValorEstimado(e.target.value)}
            className="w-full rounded-md border border-canil-border bg-canil-bg-elevated px-3 py-2"
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-canil-text-muted"
          />
          {foto && <p className="text-xs text-canil-text-muted">Foto anexada: {foto.name}</p>}
        </section>
      )}

      {mensagem && (
        <div
          className={`rounded p-2 text-sm ${
            mensagem.tipo === 'ok'
              ? 'bg-canil-bg-elevated text-canil-gold'
              : mensagem.tipo === 'offline'
                ? 'bg-amber-950 text-amber-300'
                : 'bg-red-950 text-red-300'
          }`}
        >
          <p>{mensagem.texto}</p>
          {mensagem.sessaoExpirada && (
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="mt-2 rounded border border-red-400 px-3 py-1 text-xs font-medium"
            >
              Fazer login novamente
            </button>
          )}
        </div>
      )}

      <button
        type="button"
        disabled={!tipo || !coordsEfetivas || enviando}
        onClick={handleSubmit}
        className="mt-auto w-full rounded-md bg-canil-gold text-canil-bg px-4 py-3 text-base font-semibold disabled:opacity-50"
      >
        {enviando ? 'Salvando...' : 'Salvar apreensão'}
      </button>
    </main>
  );
}
