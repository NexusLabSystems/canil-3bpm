import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCondutorDto } from './dto/create-condutor.dto';
import { UpdateCondutorDto } from './dto/update-condutor.dto';

const SALT_ROUNDS = 10;

@Injectable()
export class CondutoresService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.condutor.findMany({
      include: { usuario: { select: { id: true, username: true, ativo: true } } },
      orderBy: { nomeGuerra: 'asc' },
    });
  }

  async findOne(id: string) {
    const condutor = await this.prisma.condutor.findUnique({
      where: { id },
      include: {
        usuario: { select: { id: true, username: true, ativo: true } },
        binomios: { include: { cao: true }, orderBy: { dataInicio: 'desc' } },
      },
    });
    if (!condutor) throw new NotFoundException('Condutor não encontrado');
    return condutor;
  }

  async create(dto: CreateCondutorDto) {
    const { username, senhaInicial, ...condutorData } = dto;

    return this.prisma.condutor.create({
      data: {
        ...condutorData,
        ...(username && senhaInicial
          ? {
              usuario: {
                create: {
                  username,
                  passwordHash: await bcrypt.hash(senhaInicial, SALT_ROUNDS),
                  perfil: 'CONDUTOR',
                },
              },
            }
          : {}),
      },
      include: { usuario: { select: { id: true, username: true, ativo: true } } },
    });
  }

  async update(id: string, dto: UpdateCondutorDto) {
    await this.findOne(id);
    const { username, senhaInicial, ...condutorData } = dto;
    return this.prisma.condutor.update({ where: { id }, data: condutorData });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.condutor.update({ where: { id }, data: { ativo: false } });
  }
}
