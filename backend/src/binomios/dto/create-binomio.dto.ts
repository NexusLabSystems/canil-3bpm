import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateBinomioDto {
  @IsString()
  condutorId: string;

  @IsString()
  caoId: string;

  @IsDateString()
  dataInicio: string;

  @IsOptional()
  @IsDateString()
  dataFim?: string;
}
