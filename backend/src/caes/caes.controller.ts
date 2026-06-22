import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CaesService } from './caes.service';
import { CreateCaoDto } from './dto/create-cao.dto';
import { UpdateCaoDto } from './dto/update-cao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('caes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CaesController {
  constructor(private readonly caesService: CaesService) {}

  @Get()
  findAll() {
    return this.caesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.caesService.findOne(id);
  }

  @Post()
  @Roles(PerfilUsuario.ADMIN)
  create(@Body() dto: CreateCaoDto) {
    return this.caesService.create(dto);
  }

  @Patch(':id')
  @Roles(PerfilUsuario.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCaoDto) {
    return this.caesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(PerfilUsuario.ADMIN)
  remove(@Param('id') id: string) {
    return this.caesService.remove(id);
  }
}
