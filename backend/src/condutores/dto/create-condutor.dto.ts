import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCondutorDto {
  @IsString()
  postoGraduacao: string;

  @IsString()
  nomeGuerra: string;

  @IsString()
  matricula: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  senhaInicial?: string;
}
