import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum DecisaoRevisao {
  VALIDADA = 'VALIDADA',
  DEVOLVIDA = 'DEVOLVIDA',
}

export class RevisarApreensaoDto {
  @IsEnum(DecisaoRevisao)
  decisao: DecisaoRevisao;

  @IsOptional()
  @IsString()
  observacao?: string;
}
