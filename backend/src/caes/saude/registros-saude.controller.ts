import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { RegistrosSaudeService } from './registros-saude.service';
import { CreateRegistroSaudeDto } from './dto/create-registro-saude.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../../auth/strategies/jwt.strategy';
import { PerfilUsuario } from '@prisma/client';

@Controller('caes/:caoId/saude')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RegistrosSaudeController {
  constructor(private readonly registrosSaudeService: RegistrosSaudeService) {}

  @Get()
  @Roles(PerfilUsuario.COMANDANTE, PerfilUsuario.ADMIN)
  findAll(@Param('caoId') caoId: string) {
    return this.registrosSaudeService.findAll(caoId);
  }

  @Post()
  @Roles(PerfilUsuario.ADMIN)
  create(
    @Param('caoId') caoId: string,
    @Body() dto: CreateRegistroSaudeDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.registrosSaudeService.create(caoId, dto, user.sub);
  }
}
