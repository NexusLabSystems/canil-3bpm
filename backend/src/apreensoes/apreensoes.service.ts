import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApreensaoDto } from './dto/create-apreensao.dto';
import { UpdateApreensaoDto } from './dto/update-apreensao.dto';
import { DecisaoRevisao, RevisarApreensaoDto } from './dto/revisar-apreensao.dto';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { TipoApreensao } from '@prisma/client';

const include = {
  cao: true,
  binomio: { include: { condutor: true } },
  ocorrencia: true,
  fotos: true,
  entorpecente: { include: { tipoSubstancia: true } },
  arma: { include: { tipoArma: true } },
  municao: true,
  outro: true,
};

@Injectable()
export class ApreensoesService {
  constructor(private readonly prisma: PrismaService) {}

  // Condutor só pode ver as próprias apreensões, mesmo que filtros sejam
  // manipulados na requisição (a restrição final tem que valer no servidor).
  async findAll(filtros: { status?: string; caoId?: string }, user: JwtPayload) {
    let caoId = filtros.caoId;

    if (user.perfil === 'CONDUTOR') {
      const binomio = user.condutorId
        ? await this.prisma.binomio.findFirst({
            where: { condutorId: user.condutorId, dataFim: null },
          })
        : null;
      caoId = binomio?.caoId ?? '__nenhum__';
    }

    return this.prisma.apreensao.findMany({
      where: { status: filtros.status as never, caoId },
      include,
      orderBy: { horario: 'desc' },
    });
  }

  async findOne(id: string) {
    const apreensao = await this.prisma.apreensao.findUnique({ where: { id }, include });
    if (!apreensao) throw new NotFoundException('Apreensão não encontrada');
    return apreensao;
  }

  private tipoEspecificoData(dto: CreateApreensaoDto | UpdateApreensaoDto) {
    switch (dto.tipo) {
      case TipoApreensao.ENTORPECENTE:
        if (!dto.entorpecente) throw new BadRequestException('Dados de entorpecente são obrigatórios');
        return { entorpecente: { create: dto.entorpecente } };
      case TipoApreensao.ARMA:
        if (!dto.arma) throw new BadRequestException('Dados de arma são obrigatórios');
        return { arma: { create: dto.arma } };
      case TipoApreensao.MUNICAO:
        if (!dto.municao) throw new BadRequestException('Dados de munição são obrigatórios');
        return { municao: { create: dto.municao } };
      case TipoApreensao.DINHEIRO:
      case TipoApreensao.VEICULO:
      case TipoApreensao.OUTROS:
        if (!dto.outro) throw new BadRequestException('Descrição é obrigatória');
        return { outro: { create: dto.outro } };
      default:
        return {};
    }
  }

  create(dto: CreateApreensaoDto, user: JwtPayload) {
    const { fotos, entorpecente, arma, municao, outro, ...data } = dto;

    return this.prisma.apreensao.create({
      data: {
        ...data,
        horario: new Date(dto.horario),
        criadoPorId: user.sub,
        status: 'PENDENTE_REVISAO',
        fotos: fotos ? { create: fotos.map((url) => ({ url })) } : undefined,
        ...this.tipoEspecificoData(dto),
      },
      include,
    });
  }

  // Registro em dois tempos: o condutor completa peso exato, nº do BO etc. depois.
  async update(id: string, dto: UpdateApreensaoDto) {
    const atual = await this.findOne(id);
    const { fotos, entorpecente, arma, municao, outro, horario, ...data } = dto;

    return this.prisma.apreensao.update({
      where: { id },
      data: {
        ...data,
        horario: horario ? new Date(horario) : undefined,
        ...(entorpecente && atual.tipo === TipoApreensao.ENTORPECENTE
          ? { entorpecente: { update: entorpecente } }
          : {}),
        ...(arma && atual.tipo === TipoApreensao.ARMA ? { arma: { update: arma } } : {}),
        ...(municao && atual.tipo === TipoApreensao.MUNICAO ? { municao: { update: municao } } : {}),
        ...(outro &&
        ([TipoApreensao.DINHEIRO, TipoApreensao.VEICULO, TipoApreensao.OUTROS] as TipoApreensao[]).includes(
          atual.tipo,
        )
          ? { outro: { update: outro } }
          : {}),
      },
      include,
    });
  }

  async revisar(id: string, dto: RevisarApreensaoDto, user: JwtPayload) {
    await this.findOne(id);
    return this.prisma.apreensao.update({
      where: { id },
      data: {
        status: dto.decisao === DecisaoRevisao.VALIDADA ? 'VALIDADA' : 'DEVOLVIDA',
        observacaoRevisao: dto.observacao,
        revisadoPorId: user.sub,
        revisadoEm: new Date(),
      },
      include,
    });
  }
}
