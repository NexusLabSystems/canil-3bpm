import { Module } from '@nestjs/common';
import { CaesService } from './caes.service';
import { CaesController } from './caes.controller';
import { RegistrosSaudeService } from './saude/registros-saude.service';
import { RegistrosSaudeController } from './saude/registros-saude.controller';

@Module({
  controllers: [CaesController, RegistrosSaudeController],
  providers: [CaesService, RegistrosSaudeService],
})
export class CaesModule {}
