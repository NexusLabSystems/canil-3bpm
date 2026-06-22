import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBinomioDto } from './dto/create-binomio.dto';
import { EncerrarBinomioDto } from './dto/encerrar-binomio.dto';

@Injectable()
export class BinomiosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.binomio.findMany({
      include: { condutor: true, cao: true },
      orderBy: { dataInicio: 'desc' },
    });
  }

  async findOne(id: string) {
    const binomio = await this.prisma.binomio.findUnique({
      where: { id },
      include: { condutor: true, cao: true },
    });
    if (!binomio) throw new NotFoundException('Binômio não encontrado');
    return binomio;
  }

  async findAtivoPorCondutor(condutorId: string) {
    const binomio = await this.prisma.binomio.findFirst({
      where: { condutorId, dataFim: null },
      include: { condutor: true, cao: { include: { especialidade: true } } },
    });
    if (!binomio) throw new NotFoundException('Nenhum binômio ativo para este condutor');
    return binomio;
  }

  // Ao criar um novo binômio para um cão que já tem um vínculo ativo,
  // encerra o vínculo anterior na data de início do novo — preserva o
  // histórico para que apreensões antigas continuem com o condutor da época.
  create(dto: CreateBinomioDto) {
    const dataInicio = new Date(dto.dataInicio);

    return this.prisma.$transaction(async (tx) => {
      await tx.binomio.updateMany({
        where: { caoId: dto.caoId, dataFim: null },
        data: { dataFim: dataInicio },
      });

      return tx.binomio.create({
        data: {
          condutorId: dto.condutorId,
          caoId: dto.caoId,
          dataInicio,
          dataFim: dto.dataFim ? new Date(dto.dataFim) : null,
        },
        include: { condutor: true, cao: true },
      });
    });
  }

  async encerrar(id: string, dto: EncerrarBinomioDto) {
    await this.findOne(id);
    return this.prisma.binomio.update({
      where: { id },
      data: { dataFim: new Date(dto.dataFim) },
    });
  }
}
