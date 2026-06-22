import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { UpdateOcorrenciaDto } from './dto/update-ocorrencia.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';

const include = {
  tipoOcorrencia: true,
  binomios: { include: { binomio: { include: { condutor: true, cao: true } } } },
};

@Injectable()
export class OcorrenciasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.ocorrencia.findMany({ include, orderBy: { dataHora: 'desc' } });
  }

  async findOne(id: string) {
    const ocorrencia = await this.prisma.ocorrencia.findUnique({ where: { id }, include });
    if (!ocorrencia) throw new NotFoundException('Ocorrência não encontrada');
    return ocorrencia;
  }

  create(dto: CreateOcorrenciaDto, user: JwtPayload) {
    const { binomioIds, ...data } = dto;
    return this.prisma.ocorrencia.create({
      data: {
        ...data,
        dataHora: new Date(dto.dataHora),
        criadoPorId: user.sub,
        binomios: { create: binomioIds.map((binomioId) => ({ binomioId })) },
      },
      include,
    });
  }

  async update(id: string, dto: UpdateOcorrenciaDto) {
    await this.findOne(id);
    const { binomioIds, dataHora, ...data } = dto;

    return this.prisma.$transaction(async (tx) => {
      if (binomioIds) {
        await tx.ocorrenciaBinomio.deleteMany({ where: { ocorrenciaId: id } });
        await tx.ocorrenciaBinomio.createMany({
          data: binomioIds.map((binomioId) => ({ ocorrenciaId: id, binomioId })),
        });
      }

      return tx.ocorrencia.update({
        where: { id },
        data: { ...data, dataHora: dataHora ? new Date(dataHora) : undefined },
        include,
      });
    });
  }
}
