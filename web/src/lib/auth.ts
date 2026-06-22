'use client';

import type { SessaoUsuario } from './types';

const TOKEN_KEY = 'canil:accessToken';
const SESSAO_KEY = 'canil:sessao';

export function salvarSessao(accessToken: string, sessao: SessaoUsuario) {
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(SESSAO_KEY, JSON.stringify(sessao));
}

export function obterToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function obterSessao(): SessaoUsuario | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSAO_KEY);
  return raw ? (JSON.parse(raw) as SessaoUsuario) : null;
}

export function limparSessao() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(SESSAO_KEY);
}
