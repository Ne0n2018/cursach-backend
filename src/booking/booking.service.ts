/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { LessonStatus } from '@prisma/client';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    data: { teacherId: string; startTime: string; endTime: string },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id: data.teacherId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    // Проверка, что время урока соответствует доступному расписанию
    const schedule = await this.prisma.schedule.findFirst({
      where: {
        teacherId: data.teacherId,
        startTime: { lte: startTime },
        endTime: { gte: endTime },
        isBooked: false,
      },
    });

    if (!schedule) {
      throw new BadRequestException('The selected time slot is not available');
    }

    // Проверка, что у пользователя нет пересекающихся бронирований
    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        userId,
        OR: [
          {
            startTime: { lte: endTime },
            endTime: { gte: startTime },
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException('You already have a booking at this time');
    }

    // Создаём бронирование
    const booking = await this.prisma.booking.create({
      data: {
        userId,
        teacherId: data.teacherId,
        startTime,
        endTime,
        status: LessonStatus.PENDING,
      },
    });

    // Обновляем расписание репетитора
    await this.prisma.schedule.update({
      where: { id: schedule.id },
      data: { isBooked: true },
    });

    return booking;
  }

  findAll(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        teacher: { include: { user: true } },
      },
    });
  }

  async update(id: string, userId: string, data: { status: LessonStatus }) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.userId !== userId) {
      throw new BadRequestException('You can only update your own bookings');
    }

    if (data.status === LessonStatus.CANCELLED) {
      // Если бронирование отменяется, освобождаем расписание
      const schedule = await this.prisma.schedule.findFirst({
        where: {
          teacherId: booking.teacherId,
          startTime: { lte: booking.startTime },
          endTime: { gte: booking.endTime },
        },
      });

      if (schedule) {
        await this.prisma.schedule.update({
          where: { id: schedule.id },
          data: { isBooked: false },
        });
      }
    }

    return this.prisma.booking.update({
      where: { id },
      data: { status: data.status },
    });
  }
}
