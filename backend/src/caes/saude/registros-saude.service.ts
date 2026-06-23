import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRegistroSaudeDto } from './dto/create-registro-saude.dto';

@Injectable()
export class RegistrosSaudeService {
  constructor(private readonly prisma: PrismaService) {}

  private async garantirCaoExiste(caoId: string) {
    const cao = await this.prisma.cao.findUnique({ where: { id: caoId } });
    if (!cao) throw new NotFoundException('Cão não encontrado');
  }

  async findAll(caoId: string) {
    await this.garantirCaoExiste(caoId);
    return this.prisma.registroSaudeCao.findMany({
      where: { caoId },
      orderBy: { data: 'desc' },
    });
  }

  async create(caoId: string, dto: CreateRegistroSaudeDto, userId: string) {
    await this.garantirCaoExiste(caoId);
    return this.prisma.registroSaudeCao.create({
      data: {
        ...dto,
        caoId,
        data: new Date(dto.data),
        proximaData: dto.proximaData ? new Date(dto.proximaData) : undefined,
        criadoPorId: userId,
      },
    });
  }
}
