import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap } from 'rxjs';
import { AuditoriaService } from './auditoria.service';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

interface RequestComUsuario extends Request {
  user?: JwtPayload;
}

const ACAO_POR_METODO: Record<string, string> = {
  POST: 'CRIACAO',
  PATCH: 'ATUALIZACAO',
  DELETE: 'EXCLUSAO',
};

// Sub-rotas de ação (ex.: PATCH /apreensoes/:id/revisar) viram uma ação
// específica em vez de caírem em "ATUALIZACAO" genérico.
const ACOES_ESPECIFICAS: Record<string, string> = {
  revisar: 'REVISAO',
  encerrar: 'ENCERRAMENTO',
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ROTAS_IGNORADAS = ['auth', 'uploads', 'auditoria'];

const CAMPOS_SENSIVEIS = ['password', 'senha', 'senhaInicial', 'passwordHash'];

@Injectable()
export class AuditoriaInterceptor implements NestInterceptor {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<RequestComUsuario>();
    const metodo = req.method;

    if (!ACAO_POR_METODO[metodo]) return next.handle();

    const partes = req.originalUrl
      .split('?')[0]
      .split('/')
      .filter(Boolean)
      .slice(1); // remove o prefixo "api"

    if (partes.length === 0 || ROTAS_IGNORADAS.includes(partes[0]))
      return next.handle();

    const idSegment = partes.find((p) => UUID_REGEX.test(p));
    const semId = partes.filter((p) => !UUID_REGEX.test(p));
    const ultimaParte = semId[semId.length - 1];
    const acaoEspecifica = ACOES_ESPECIFICAS[ultimaParte];
    const entidade = (acaoEspecifica ? semId.slice(0, -1) : semId).join('/');
    const acao = acaoEspecifica ?? ACAO_POR_METODO[metodo];

    return next.handle().pipe(
      tap((resultado: unknown) => {
        const user = req.user;
        if (!user?.sub) return;

        const entidadeId =
          idSegment ?? (resultado as { id?: string } | undefined)?.id;
        if (!entidadeId) return;

        void this.auditoriaService.registrar({
          userId: user.sub,
          acao,
          entidade,
          entidadeId,
          detalhes: this.sanitizar(req.body),
        });
      }),
    );
  }

  private sanitizar(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object' || Array.isArray(body))
      return undefined;
    const copia = { ...(body as Record<string, unknown>) };
    for (const campo of CAMPOS_SENSIVEIS) delete copia[campo];
    return Object.keys(copia).length ? copia : undefined;
  }
}
