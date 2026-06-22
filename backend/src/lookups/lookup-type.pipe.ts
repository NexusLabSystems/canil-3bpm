import { BadRequestException, PipeTransform } from '@nestjs/common';
import { LOOKUP_TYPES, LookupType } from './lookups.service';

export class LookupTypePipe implements PipeTransform {
  transform(value: string): LookupType {
    if (!LOOKUP_TYPES.includes(value as LookupType)) {
      throw new BadRequestException(
        `Tipo de lookup inválido. Use um de: ${LOOKUP_TYPES.join(', ')}`,
      );
    }
    return value as LookupType;
  }
}
