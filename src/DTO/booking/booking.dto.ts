import { ApiProperty } from '@nestjs/swagger';
import { LessonStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsString } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID of the teacher',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  teacherId: string;

  @ApiProperty({
    description: 'Start time of the lesson',
    example: '2025-04-15T14:00:00Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'End time of the lesson',
    example: '2025-04-15T15:00:00Z',
  })
  @IsDateString()
  endTime: string;
}

export class UpdateBookingDto {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  @ApiProperty({ description: 'Status of the booking', enum: LessonStatus })
  @IsEnum(LessonStatus)
  status: LessonStatus;
}
