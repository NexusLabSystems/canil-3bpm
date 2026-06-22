import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { SexoCao, StatusCao } from '@prisma/client';

export class CreateCaoDto {
  @IsString()
  nome: string;

  @IsString()
  raca: string;

  @IsEnum(SexoCao)
  sexo: SexoCao;

  @IsDateString()
  dataNascimento: string;

  @IsString()
  registro: string;

  @IsString()
  especialidadeId: string;

  @IsOptional()
  @IsEnum(StatusCao)
  status?: StatusCao;

  @IsOptional()
  @IsString()
  fotoUrl?: string;
}
