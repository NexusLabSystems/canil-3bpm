import { Module } from '@nestjs/common';
import { ApreensoesService } from './apreensoes.service';
import { ApreensoesController } from './apreensoes.controller';

@Module({
  controllers: [ApreensoesController],
  providers: [ApreensoesService],
})
export class ApreensoesModule {}
