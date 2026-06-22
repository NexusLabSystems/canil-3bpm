import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export const LOOKUP_TYPES = [
  'especialidades',
  'tipos-substancia',
  'tipos-arma',
  'tipos-ocorrencia',
] as const;

export type LookupType = (typeof LOOKUP_TYPES)[number];

@Injectable()
export class LookupsService {
  constructor(private readonly prisma: PrismaService) {}

  // O delegate varia de modelo para modelo; tratamos como `any` aqui porque
  // os 4 lookups compartilham exatamente o mesmo formato (id, nome, ativo).
  private delegate(tipo: LookupType): any {
    switch (tipo) {
      case 'especialidades':
        return this.prisma.especialidade;
      case 'tipos-substancia':
        return this.prisma.tipoSubstancia;
      case 'tipos-arma':
        return this.prisma.tipoArma;
      case 'tipos-ocorrencia':
        return this.prisma.tipoOcorrencia;
    }
  }

  findAll(tipo: LookupType, somenteAtivos = false) {
    return this.delegate(tipo).findMany({
      where: somenteAtivos ? { ativo: true } : undefined,
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(tipo: LookupType, id: string) {
    const item = await this.delegate(tipo).findUnique({ where: { id } });
    if (!item) throw new NotFoundException(`Item não encontrado em ${tipo}`);
    return item;
  }

  create(tipo: LookupType, nome: string) {
    return this.delegate(tipo).create({ data: { nome } });
  }

  update(tipo: LookupType, id: string, data: { nome?: string; ativo?: boolean }) {
    return this.delegate(tipo).update({ where: { id }, data });
  }

  remove(tipo: LookupType, id: string) {
    return this.delegate(tipo).update({ where: { id }, data: { ativo: false } });
  }
}
