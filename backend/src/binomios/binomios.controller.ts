import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { BinomiosService } from './binomios.service';
import { CreateBinomioDto } from './dto/create-binomio.dto';
import { EncerrarBinomioDto } from './dto/encerrar-binomio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PerfilUsuario } from '@prisma/client';

@Controller('binomios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BinomiosController {
  constructor(private readonly binomiosService: BinomiosService) {}

  // Binômio ativo do condutor logado: pré-seleção automática na tela de campo.
  @Get('meu')
  @Roles(PerfilUsuario.CONDUTOR)
  findMeu(@CurrentUser() user: JwtPayload) {
    if (!user.condutorId) {
      throw new NotFoundException('Usuário não está vinculado a um condutor');
    }
    return this.binomiosService.findAtivoPorCondutor(user.condutorId);
  }

  @Get()
  @Roles(PerfilUsuario.COMANDANTE, PerfilUsuario.ADMIN)
  findAll() {
    return this.binomiosService.findAll();
  }

  @Get(':id')
  @Roles(PerfilUsuario.COMANDANTE, PerfilUsuario.ADMIN)
  findOne(@Param('id') id: string) {
    return this.binomiosService.findOne(id);
  }

  @Post()
  @Roles(PerfilUsuario.ADMIN)
  create(@Body() dto: CreateBinomioDto) {
    return this.binomiosService.create(dto);
  }

  @Patch(':id/encerrar')
  @Roles(PerfilUsuario.ADMIN)
  encerrar(@Param('id') id: string, @Body() dto: EncerrarBinomioDto) {
    return this.binomiosService.encerrar(id, dto);
  }
}
