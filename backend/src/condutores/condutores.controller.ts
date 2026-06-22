import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CondutoresService } from './condutores.service';
import { CreateCondutorDto } from './dto/create-condutor.dto';
import { UpdateCondutorDto } from './dto/update-condutor.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('condutores')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CondutoresController {
  constructor(private readonly condutoresService: CondutoresService) {}

  @Get()
  @Roles(PerfilUsuario.COMANDANTE, PerfilUsuario.ADMIN)
  findAll() {
    return this.condutoresService.findAll();
  }

  @Get(':id')
  @Roles(PerfilUsuario.COMANDANTE, PerfilUsuario.ADMIN)
  findOne(@Param('id') id: string) {
    return this.condutoresService.findOne(id);
  }

  @Post()
  @Roles(PerfilUsuario.ADMIN)
  create(@Body() dto: CreateCondutorDto) {
    return this.condutoresService.create(dto);
  }

  @Patch(':id')
  @Roles(PerfilUsuario.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCondutorDto) {
    return this.condutoresService.update(id, dto);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.ADMIN)
  remove(@Param('id') id: string) {
    return this.condutoresService.remove(id);
  }
}
