import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { TipoRegistroSaude } from '@prisma/client';

export class CreateRegistroSaudeDto {
  @IsEnum(TipoRegistroSaude)
  tipo: TipoRegistroSaude;

  @IsString()
  descricao: string;

  @IsDateString()
  data: string;

  @IsOptional()
  @IsDateString()
  proximaData?: string;

  @IsOptional()
  @IsString()
  veterinario?: string;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
