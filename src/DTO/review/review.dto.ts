import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID of the teacher',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  teacherId: string;

  @ApiProperty({ description: 'Rating (1-5)', example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Comment',
    example: 'Great teacher!',
    required: false,
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
