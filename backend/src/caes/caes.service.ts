import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaoDto } from './dto/create-cao.dto';
import { UpdateCaoDto } from './dto/update-cao.dto';

@Injectable()
export class CaesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cao.findMany({
      include: { especialidade: true },
      orderBy: { nome: 'asc' },
    });
  }

  async findOne(id: string) {
    const cao = await this.prisma.cao.findUnique({
      where: { id },
      include: {
        especialidade: true,
        binomios: { include: { condutor: true }, orderBy: { dataInicio: 'desc' } },
      },
    });
    if (!cao) throw new NotFoundException('Cão não encontrado');
    return cao;
  }

  create(dto: CreateCaoDto) {
    return this.prisma.cao.create({
      data: { ...dto, dataNascimento: new Date(dto.dataNascimento) },
    });
  }

  async update(id: string, dto: UpdateCaoDto) {
    await this.findOne(id);
    return this.prisma.cao.update({
      where: { id },
      data: {
        ...dto,
        dataNascimento: dto.dataNascimento ? new Date(dto.dataNascimento) : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.cao.update({ where: { id }, data: { status: 'REFORMADO' } });
  }
}
