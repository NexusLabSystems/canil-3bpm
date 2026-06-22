import {
  Controller,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PerfilUsuario } from '@prisma/client';

@Controller('auditoria')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(PerfilUsuario.ADMIN)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get()
  listar(
    @Query('entidade') entidade: string | undefined,
    @Query('userId') userId: string | undefined,
    @Query('take', new ParseIntPipe({ optional: true })) take = 50,
    @Query('skip', new ParseIntPipe({ optional: true })) skip = 0,
  ) {
    return this.auditoriaService.listar({ entidade, userId, take, skip });
  }
}
