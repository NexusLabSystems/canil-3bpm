import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApreensoesService } from './apreensoes.service';
import { CreateApreensaoDto } from './dto/create-apreensao.dto';
import { UpdateApreensaoDto } from './dto/update-apreensao.dto';
import { RevisarApreensaoDto } from './dto/revisar-apreensao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { PerfilUsuario } from '@prisma/client';

@Controller('apreensoes')
@UseGuards(JwtAuthGuard)
export class ApreensoesController {
  constructor(private readonly apreensoesService: ApreensoesService) {}

  @Get()
  findAll(
    @Query('status') status: string | undefined,
    @Query('caoId') caoId: string | undefined,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.apreensoesService.findAll({ status, caoId }, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.apreensoesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateApreensaoDto, @CurrentUser() user: JwtPayload) {
    return this.apreensoesService.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApreensaoDto) {
    return this.apreensoesService.update(id, dto);
  }

  @Patch(':id/revisar')
  @UseGuards(RolesGuard)
  @Roles(PerfilUsuario.COMANDANTE, PerfilUsuario.ADMIN)
  revisar(
    @Param('id') id: string,
    @Body() dto: RevisarApreensaoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.apreensoesService.revisar(id, dto, user);
  }
}
