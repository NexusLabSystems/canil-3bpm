import { IsDateString } from 'class-validator';

export class EncerrarBinomioDto {
  @IsDateString()
  dataFim: string;
}
