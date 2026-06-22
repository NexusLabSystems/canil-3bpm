import { ArrayMinSize, IsArray, IsDateString, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TipoEventoOcorrencia } from '@prisma/client';

export class CreateOcorrenciaDto {
  @IsEnum(TipoEventoOcorrencia)
  tipoEvento: TipoEventoOcorrencia;

  @IsString()
  tipoOcorrenciaId: string;

  @IsDateString()
  dataHora: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  numeroBO?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  binomioIds: string[];
}
