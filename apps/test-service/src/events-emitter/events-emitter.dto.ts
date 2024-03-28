import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
} from 'class-validator';
import { BaseDto } from '../util/common.util';

export class NewEventDto implements BaseDto {
  @ApiProperty({ name: 'title', type: 'string', example: 'envent title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ name: 'content', type: 'object', example: { test: true } })
  @IsObject()
  @IsNotEmptyObject()
  content: Record<string, any>;
}
