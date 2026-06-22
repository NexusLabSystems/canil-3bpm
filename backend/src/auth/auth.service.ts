import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { AuditoriaService } from '../auditoria/auditoria.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async login(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user || !user.ativo) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(password, user.passwordHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      perfil: user.perfil,
      condutorId: user.condutorId ?? undefined,
    };

    await this.auditoriaService.registrar({
      userId: user.id,
      acao: 'LOGIN',
      entidade: 'auth',
      entidadeId: user.id,
    });

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        username: user.username,
        perfil: user.perfil,
        condutor: user.condutor,
      },
    };
  }
}
