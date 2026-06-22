'use client';

import { Fragment, useEffect, useState } from 'react';
import { useSessao } from '@/lib/use-sessao';
import { apiFetch } from '@/lib/api';
import type { LogAuditoria } from '@/lib/types';

const ACAO_ESTILO: Record<string, string> = {
  CRIACAO: 'border-canil-gold text-canil-gold',
  ATUALIZACAO: 'border-amber-700 text-amber-400',
  EXCLUSAO: 'border-red-700 text-red-400',
  REVISAO: 'border-canil-gold text-canil-gold',
  ENCERRAMENTO: 'border-amber-700 text-amber-400',
  LOGIN: 'border-canil-border text-canil-text-muted',
};

const ACAO_ROTULO: Record<string, string> = {
  CRIACAO: 'Criação',
  ATUALIZACAO: 'Atualização',
  EXCLUSAO: 'Exclusão',
  REVISAO: 'Revisão',
  ENCERRAMENTO: 'Encerramento',
  LOGIN: 'Login',
};

export default function AuditoriaPage() {
  const sessao = useSessao(['ADMIN']);
  const [logs, setLogs] = useState<LogAuditoria[]>([]);
  const [expandido, setExpandido] = useState<string | null>(null);

  useEffect(() => {
    if (!sessao) return;
    apiFetch<LogAuditoria[]>('/auditoria?take=100').then(setLogs).catch(() => {});
  }, [sessao]);

  if (!sessao) return null;

  return (
    <main className="flex-1 space-y-4 p-6">
      <header>
        <h1 className="text-xl font-semibold text-canil-text">Log de auditoria</h1>
        <p className="text-sm text-canil-text-muted">
          Quem acessou, criou, editou ou excluiu o quê e quando — últimos 100 registros.
        </p>
      </header>

      <div className="overflow-hidden rounded border border-canil-border bg-canil-bg-elevated">
        <table className="w-full text-sm">
          <thead className="border-b border-canil-border text-left text-canil-text-muted">
            <tr>
              <th className="p-3">Data/hora</th>
              <th className="p-3">Usuário</th>
              <th className="p-3">Ação</th>
              <th className="p-3">Entidade</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <Fragment key={log.id}>
                <tr
                  onClick={() => setExpandido(expandido === log.id ? null : log.id)}
                  className="cursor-pointer border-b border-canil-border last:border-0 hover:bg-canil-bg"
                >
                  <td className="p-3 text-canil-text-muted">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </td>
                  <td className="p-3 font-medium text-canil-text">
                    {log.user?.username} <span className="text-xs text-canil-text-muted">({log.user?.perfil})</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded border px-2 py-0.5 text-xs font-medium ${
                        ACAO_ESTILO[log.acao] ?? 'border-canil-border text-canil-text-muted'
                      }`}
                    >
                      {ACAO_ROTULO[log.acao] ?? log.acao}
                    </span>
                  </td>
                  <td className="p-3 text-canil-text-muted">
                    {log.entidade} <span className="text-xs">#{log.entidadeId.slice(0, 8)}</span>
                  </td>
                  <td className="p-3 text-xs text-canil-text-muted">
                    {log.detalhes ? (expandido === log.id ? 'ocultar' : 'ver detalhes') : ''}
                  </td>
                </tr>
                {expandido === log.id && log.detalhes && (
                  <tr className="border-b border-canil-border bg-canil-bg last:border-0">
                    <td colSpan={5} className="p-3">
                      <pre className="overflow-x-auto text-xs text-canil-text-muted">
                        {JSON.stringify(log.detalhes, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="p-3 text-center text-canil-text-muted">
                  Nenhum registro ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
