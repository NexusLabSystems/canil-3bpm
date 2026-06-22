import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { TipoApreensao } from '@prisma/client';

class EntorpecenteDto {
  @IsString()
  tipoSubstanciaId: string;

  @IsNumber()
  pesoQuantidade: number;

  @IsString()
  formaAcondicionamento: string;
}

class ArmaDto {
  @IsString()
  tipoArmaId: string;

  @IsOptional()
  @IsString()
  calibre?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  numeracao?: string;
}

class MunicaoDto {
  @IsString()
  calibre: string;

  @IsInt()
  @Min(1)
  quantidade: number;
}

class OutroDto {
  @IsString()
  descricao: string;
}

export class CreateApreensaoDto {
  @IsString()
  ocorrenciaId: string;

  @IsString()
  caoId: string;

  @IsString()
  binomioId: string;

  @IsEnum(TipoApreensao)
  tipo: TipoApreensao;

  @IsOptional()
  @IsNumber()
  valorEstimado?: number;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsDateString()
  horario: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotos?: string[];

  @ValidateIf((dto) => dto.tipo === TipoApreensao.ENTORPECENTE)
  @ValidateNested()
  @Type(() => EntorpecenteDto)
  entorpecente?: EntorpecenteDto;

  @ValidateIf((dto) => dto.tipo === TipoApreensao.ARMA)
  @ValidateNested()
  @Type(() => ArmaDto)
  arma?: ArmaDto;

  @ValidateIf((dto) => dto.tipo === TipoApreensao.MUNICAO)
  @ValidateNested()
  @Type(() => MunicaoDto)
  municao?: MunicaoDto;

  @ValidateIf((dto) =>
    [TipoApreensao.DINHEIRO, TipoApreensao.VEICULO, TipoApreensao.OUTROS].includes(dto.tipo),
  )
  @ValidateNested()
  @Type(() => OutroDto)
  outro?: OutroDto;
}
