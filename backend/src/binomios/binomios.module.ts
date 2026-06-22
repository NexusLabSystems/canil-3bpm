import { Module } from '@nestjs/common';
import { BinomiosService } from './binomios.service';
import { BinomiosController } from './binomios.controller';

@Module({
  controllers: [BinomiosController],
  providers: [BinomiosService],
})
export class BinomiosModule {}
