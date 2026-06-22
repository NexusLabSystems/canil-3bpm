import { PartialType } from '@nestjs/mapped-types';
import { CreateApreensaoDto } from './create-apreensao.dto';

export class UpdateApreensaoDto extends PartialType(CreateApreensaoDto) {}
