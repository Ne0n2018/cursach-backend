import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ReviewService } from './review.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreateReviewDto } from 'src/DTO/review/review.dto';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@ApiBearerAuth()
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review for a teacher' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Invalid request or already reviewed',
  })
  @ApiBody({ type: CreateReviewDto })
  async create(@Request() req, @Body() data: CreateReviewDto) {
    return this.reviewService.create(req.user.sub, data);
  }
}
