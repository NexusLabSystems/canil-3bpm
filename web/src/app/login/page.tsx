'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { salvarSessao } from '@/lib/auth';
import type { SessaoUsuario } from '@/lib/types';
import { IconShield } from '../icons';

interface LoginResponse {
  accessToken: string;
  user: SessaoUsuario;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const resposta = await apiFetch<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      salvarSessao(resposta.accessToken, resposta.user);

      if (resposta.user.perfil === 'CONDUTOR') {
        router.push('/campo/nova-apreensao');
      } else {
        router.push('/painel/dashboard');
      }
    } catch (err) {
      setErro(err instanceof ApiError ? err.message : 'Não foi possível conectar ao servidor');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-canil-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded border border-canil-border bg-canil-bg-elevated p-6 shadow-lg"
      >
        <Link href="/" className="flex items-center gap-2">
          <IconShield className="h-7 w-7 text-canil-gold" />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-widest text-canil-text">CANIL</p>
            <p className="text-xs tracking-widest text-canil-gold">3º BPM</p>
          </div>
        </Link>

        <div>
          <h1 className="text-lg font-semibold text-canil-text">Acessar o sistema</h1>
          <p className="text-sm text-canil-text-muted">Entre com seu usuário e senha</p>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-canil-text-muted" htmlFor="username">
            Usuário
          </label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
            className="w-full rounded-md border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-canil-text-muted" htmlFor="password">
            Senha
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-canil-border bg-canil-bg px-3 py-2 text-canil-text focus:border-canil-gold focus:outline-none"
          />
        </div>

        {erro && <p className="text-sm text-red-400">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-md bg-canil-gold px-3 py-2 font-semibold tracking-wide text-canil-bg disabled:opacity-60"
        >
          {carregando ? 'ENTRANDO...' : 'ENTRAR'}
        </button>
      </form>
    </main>
  );
}
