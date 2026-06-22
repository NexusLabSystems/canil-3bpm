import { PartialType } from '@nestjs/mapped-types';
import { CreateCaoDto } from './create-cao.dto';

export class UpdateCaoDto extends PartialType(CreateCaoDto) {}
