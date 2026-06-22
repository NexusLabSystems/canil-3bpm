import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LookupsService } from './lookups.service';
import type { LookupType } from './lookups.service';
import { LookupTypePipe } from './lookup-type.pipe';
import { CreateLookupDto, UpdateLookupDto } from './dto/upsert-lookup.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('lookups/:tipo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LookupsController {
  constructor(private readonly lookupsService: LookupsService) {}

  @Get()
  findAll(@Param('tipo', LookupTypePipe) tipo: LookupType, @Query('ativos') ativos?: string) {
    return this.lookupsService.findAll(tipo, ativos === 'true');
  }

  @Get(':id')
  findOne(@Param('tipo', LookupTypePipe) tipo: LookupType, @Param('id') id: string) {
    return this.lookupsService.findOne(tipo, id);
  }

  @Post()
  @Roles(PerfilUsuario.ADMIN)
  create(@Param('tipo', LookupTypePipe) tipo: LookupType, @Body() dto: CreateLookupDto) {
    return this.lookupsService.create(tipo, dto.nome);
  }

  @Patch(':id')
  @Roles(PerfilUsuario.ADMIN)
  update(
    @Param('tipo', LookupTypePipe) tipo: LookupType,
    @Param('id') id: string,
    @Body() dto: UpdateLookupDto,
  ) {
    return this.lookupsService.update(tipo, id, dto);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.ADMIN)
  remove(@Param('tipo', LookupTypePipe) tipo: LookupType, @Param('id') id: string) {
    return this.lookupsService.remove(tipo, id);
  }
}
