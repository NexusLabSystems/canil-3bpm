import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LookupsModule } from './lookups/lookups.module';
import { CaesModule } from './caes/caes.module';
import { CondutoresModule } from './condutores/condutores.module';
import { BinomiosModule } from './binomios/binomios.module';
import { OcorrenciasModule } from './ocorrencias/ocorrencias.module';
import { ApreensoesModule } from './apreensoes/apreensoes.module';
import { UploadsModule } from './uploads/uploads.module';
import { AuditoriaModule } from './auditoria/auditoria.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    LookupsModule,
    CaesModule,
    CondutoresModule,
    BinomiosModule,
    OcorrenciasModule,
    ApreensoesModule,
    UploadsModule,
    AuditoriaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
