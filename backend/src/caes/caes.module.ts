import { Module } from '@nestjs/common';
import { CaesService } from './caes.service';
import { CaesController } from './caes.controller';

@Module({
  controllers: [CaesController],
  providers: [CaesService],
})
export class CaesModule {}
