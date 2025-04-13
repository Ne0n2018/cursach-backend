import { ApiProperty } from '@nestjs/swagger';
import { Subject } from '@prisma/client';
import {
  IsOptional,
  IsArray,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';

export class UpdateTeacherDto {
  @ApiProperty({
    description: 'Subjects taught by the teacher',
    enum: Subject,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Subject, {
    each: true,
    message:
      'Each subject must be a valid subject (MATH, PHYSICS, ENGLISH, HISTORY)',
  })
  subjects?: Subject[];

  @ApiProperty({
    description: 'Hourly rate of the teacher',
    example: 30.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;

  @ApiProperty({
    description: 'Description of the teacher',
    example: 'Experienced math teacher',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
