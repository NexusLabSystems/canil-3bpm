import { Module } from '@nestjs/common';
import { CondutoresService } from './condutores.service';
import { CondutoresController } from './condutores.controller';

@Module({
  controllers: [CondutoresController],
  providers: [CondutoresService],
})
export class CondutoresModule {}
