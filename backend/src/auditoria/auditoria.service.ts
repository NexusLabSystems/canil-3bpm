import { Injectable, Logger } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface RegistrarAuditoria {
  userId: string;
  acao: string;
  entidade: string;
  entidadeId: string;
  detalhes?: Record<string, unknown>;
}

@Injectable()
export class AuditoriaService {
  private readonly logger = new Logger(AuditoriaService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Nunca deve quebrar a requisição original por falha ao gravar o log.
  async registrar(dados: RegistrarAuditoria) {
    try {
      await this.prisma.logAuditoria.create({
        data: {
          userId: dados.userId,
          acao: dados.acao,
          entidade: dados.entidade,
          entidadeId: dados.entidadeId,
          detalhes: dados.detalhes as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (erro) {
      this.logger.error('Falha ao gravar log de auditoria', erro as Error);
    }
  }

  async listar(filtros: {
    entidade?: string;
    userId?: string;
    take: number;
    skip: number;
  }) {
    return this.prisma.logAuditoria.findMany({
      where: {
        entidade: filtros.entidade,
        userId: filtros.userId,
      },
      include: {
        user: { select: { username: true, perfil: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: filtros.take,
      skip: filtros.skip,
    });
  }
}
