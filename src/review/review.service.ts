import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: { teacherId: string; rating: number; comment?: string },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: data.teacherId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    // Проверяем, что пользователь уже имел урок с этим репетитором
    const booking = await this.prisma.booking.findFirst({
      where: {
        userId,
        teacherId: data.teacherId,
        status: 'COMPLETED',
      },
    });

    if (!booking) {
      throw new BadRequestException(
        'You can only review teachers after a completed lesson',
      );
    }

    // Проверяем, не оставлял ли пользователь уже отзыв
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        teacherId: data.teacherId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this teacher');
    }

    return this.prisma.review.create({
      data: {
        userId,
        teacherId: data.teacherId,
        rating: data.rating,
        comment: data.comment,
      },
    });
  }
}
