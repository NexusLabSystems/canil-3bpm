import { get, set } from 'idb-keyval';
import { apiFetch, uploadFoto } from './api';
import type { Ocorrencia, RegistroCampoPayload } from './types';

const QUEUE_KEY = 'canil:fila-registros';

export interface RegistroEnfileirado {
  clientId: string;
  payload: RegistroCampoPayload;
  // a foto fica guardada como blob no IndexedDB e só é enviada ao MinIO
  // no momento da sincronização (online ou offline, o registro não se perde).
  fotoBlob?: Blob;
  criadoEm: string;
}

async function lerFila(): Promise<RegistroEnfileirado[]> {
  return (await get(QUEUE_KEY)) ?? [];
}

async function gravarFila(fila: RegistroEnfileirado[]) {
  await set(QUEUE_KEY, fila);
}

async function enfileirar(payload: RegistroCampoPayload, fotoBlob?: Blob) {
  const fila = await lerFila();
  const item: RegistroEnfileirado = {
    clientId: crypto.randomUUID(),
    payload,
    fotoBlob,
    criadoEm: new Date().toISOString(),
  };
  await gravarFila([...fila, item]);
  return item;
}

export async function listarFila() {
  return lerFila();
}

async function enviarRegistro(payload: RegistroCampoPayload, fotoBlob?: Blob) {
  const { caoId, binomioId, tipoEvento, tipoOcorrenciaId, numeroBO, apreensao } = payload;

  const fotos = [...(apreensao.fotos ?? [])];
  if (fotoBlob) {
    const { url } = await uploadFoto(fotoBlob, 'apreensao.jpg');
    fotos.push(url);
  }

  const ocorrencia = await apiFetch<Ocorrencia>('/ocorrencias', {
    method: 'POST',
    body: JSON.stringify({
      tipoEvento,
      tipoOcorrenciaId,
      numeroBO,
      dataHora: apreensao.horario,
      latitude: apreensao.latitude,
      longitude: apreensao.longitude,
      binomioIds: [binomioId],
    }),
  });

  await apiFetch('/apreensoes', {
    method: 'POST',
    body: JSON.stringify({ ...apreensao, fotos, caoId, binomioId, ocorrenciaId: ocorrencia.id }),
  });
}

// Tenta enviar direto à API; se falhar por falta de rede, guarda na fila
// local para sincronizar depois — o registro em campo funciona 100% offline.
export async function registrarApreensao(payload: RegistroCampoPayload, fotoBlob?: Blob) {
  try {
    await enviarRegistro(payload, fotoBlob);
    return { sincronizado: true as const };
  } catch (erro) {
    if (erro instanceof TypeError) {
      await enfileirar(payload, fotoBlob);
      return { sincronizado: false as const };
    }
    throw erro;
  }
}

export async function sincronizarFila(): Promise<{ enviados: number; restantes: number }> {
  const fila = await lerFila();
  if (fila.length === 0) return { enviados: 0, restantes: 0 };

  const pendentes: RegistroEnfileirado[] = [];
  let enviados = 0;

  for (const item of fila) {
    try {
      await enviarRegistro(item.payload, item.fotoBlob);
      enviados++;
    } catch {
      pendentes.push(item);
    }
  }

  await gravarFila(pendentes);
  return { enviados, restantes: pendentes.length };
}
