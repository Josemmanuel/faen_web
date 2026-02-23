import { PartialType } from '@nestjs/mapped-types';
import { CreateAutoridadDto } from './create-autoridad.dto';

export class UpdateAutoridadDto extends PartialType(CreateAutoridadDto) {}
