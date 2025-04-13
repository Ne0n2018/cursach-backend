import { Injectable, NotFoundException } from '@nestjs/common';
import { Role, Subject } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers(page: number = 1, limit: number = 10, role?: Role) {
    const skip = (page - 1) * limit;
    return this.prisma.user.findMany({
      skip,
      take: limit,
      where: {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        role: role ? role : undefined,
      },
      include: {
        teacher: true,
      },
    });
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.delete({
      where: {
        id: id,
      },
    });
  }

  async getAllTeachers() {
    return this.prisma.teacher.findMany({
      include: {
        user: true,
        reviews: true,
        schedules: true,
      },
    });
  }

  async updateTeacher(
    id: string,
    data: { subjects?: Subject[]; hourlyRate?: number; description?: string },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return this.prisma.teacher.update({
      where: { id },
      data: {
        subjects: data.subjects,
        hourlyRate: data.hourlyRate,
        description: data.description,
      },
    });
  }

  async deleteTeacher(id: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    await this.prisma.teacher.delete({
      where: { id },
    });

    return this.prisma.user.delete({
      where: { id: teacher.userId },
    });
  }
  async getAllBookings() {
    return this.prisma.booking.findMany({
      include: {
        user: true,
        teacher: { include: { user: true } },
      },
    });
  }

  async deleteBooking(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.prisma.booking.delete({
      where: { id },
    });
  }

  async getAllReviews() {
    return this.prisma.review.findMany({
      include: {
        user: true,
        teacher: { include: { user: true } },
      },
    });
  }

  async deleteReview(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }
}
