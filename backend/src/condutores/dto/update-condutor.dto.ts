import { PartialType } from '@nestjs/mapped-types';
import { CreateCondutorDto } from './create-condutor.dto';

export class UpdateCondutorDto extends PartialType(CreateCondutorDto) {}
