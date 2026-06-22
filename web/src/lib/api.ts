import { obterToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = obterToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? 'Erro inesperado');
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function uploadFoto(blob: Blob, nomeArquivo: string): Promise<{ url: string }> {
  const token = obterToken();
  const formData = new FormData();
  formData.append('file', blob, nomeArquivo);

  const res = await fetch(`${API_URL}/uploads/foto`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? 'Erro ao enviar foto');
  }

  return res.json();
}
