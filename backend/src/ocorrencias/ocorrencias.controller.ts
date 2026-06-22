import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { OcorrenciasService } from './ocorrencias.service';
import { CreateOcorrenciaDto } from './dto/create-ocorrencia.dto';
import { UpdateOcorrenciaDto } from './dto/update-ocorrencia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller('ocorrencias')
@UseGuards(JwtAuthGuard)
export class OcorrenciasController {
  constructor(private readonly ocorrenciasService: OcorrenciasService) {}

  @Get()
  findAll() {
    return this.ocorrenciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ocorrenciasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOcorrenciaDto, @CurrentUser() user: JwtPayload) {
    return this.ocorrenciasService.create(dto, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOcorrenciaDto) {
    return this.ocorrenciasService.update(id, dto);
  }
}
