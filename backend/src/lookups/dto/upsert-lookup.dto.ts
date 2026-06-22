import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateLookupDto {
  @IsString()
  nome: string;
}

export class UpdateLookupDto {
  @IsOptional()
  @IsString()
  nome?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
