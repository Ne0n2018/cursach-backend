import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Subject, LessonStatus } from '@prisma/client';

@Injectable()
export class TeacherService {
  constructor(private prisma: PrismaService) {}

  // Поиск всех репетиторов
  async findAll(subject?: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    return this.prisma.teacher.findMany({
      skip,
      take: limit,
      where: {
        subjects: subject ? { has: subject as Subject } : undefined,
      },
      include: {
        user: true,
        reviews: true,
      },
    });
  }

  // Поиск репетитора по ID пользователя
  async findOne(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: true,
        reviews: true,
        schedules: true,
      },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }
    return teacher;
  }

  // Получить расписание репетитора
  async getSchedule(userId: string, date?: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    const startOfDay = date ? new Date(date) : new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.schedule.findMany({
      where: {
        teacherId: teacher.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  // Получить отзывы о репетиторе
  async getReviews(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });
    if (!teacher) {
      throw new NotFoundException('Teacher not found');
    }

    return this.prisma.review.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        user: true,
      },
    });
  }

  // Получить профиль репетитора
  async getProfile(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return teacher;
  }

  // Обновить профиль репетитора
  async updateProfile(
    userId: string,
    data: { subjects?: Subject[]; hourlyRate?: number; description?: string },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return this.prisma.teacher.update({
      where: { userId },
      data: {
        subjects: data.subjects ? { set: data.subjects } : undefined,
        hourlyRate: data.hourlyRate,
        description: data.description,
      },
    });
  }

  // Добавить доступное время
  async addSchedule(
    userId: string,
    data: { startTime: string; endTime: string },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }

    if (startTime < new Date()) {
      throw new BadRequestException('Cannot schedule in the past');
    }

    // Проверяем, нет ли пересечений в расписании
    const conflictingSchedule = await this.prisma.schedule.findFirst({
      where: {
        teacherId: teacher.id,
        OR: [
          {
            startTime: { lte: endTime },
            endTime: { gte: startTime },
          },
        ],
      },
    });

    if (conflictingSchedule) {
      throw new BadRequestException(
        'This time slot overlaps with an existing schedule',
      );
    }

    return this.prisma.schedule.create({
      data: {
        teacherId: teacher.id,
        startTime,
        endTime,
        isBooked: false,
      },
    });
  }

  // Получить расписание репетитора
  async getTeacherSchedule(userId: string, date?: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const startOfDay = date ? new Date(date) : new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.schedule.findMany({
      where: {
        teacherId: teacher.id,
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
  }

  // Удалить доступное время
  async deleteSchedule(userId: string, scheduleId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }

    if (schedule.teacherId !== teacher.id) {
      throw new BadRequestException('You can only delete your own schedule');
    }

    if (schedule.isBooked) {
      throw new BadRequestException('Cannot delete a booked schedule');
    }

    return this.prisma.schedule.delete({
      where: { id: scheduleId },
    });
  }

  // Получить бронирования уроков
  async getBookings(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return this.prisma.booking.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        user: true,
      },
    });
  }

  // Подтвердить или отменить бронирование
  async updateBooking(
    userId: string,
    bookingId: string,
    data: { status: LessonStatus },
  ) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.teacherId !== teacher.id) {
      throw new BadRequestException('You can only update your own bookings');
    }

    if (
      data.status === LessonStatus.CANCELLED ||
      data.status === LessonStatus.COMPLETED
    ) {
      // Если бронирование отменяется или завершается, освобождаем расписание
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
      where: { id: bookingId },
      data: { status: data.status },
    });
  }

  // Получить отзывы о репетиторе
  async getTeacherReviews(userId: string) {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      throw new NotFoundException('Teacher profile not found');
    }

    return this.prisma.review.findMany({
      where: {
        teacherId: teacher.id,
      },
      include: {
        user: true,
      },
    });
  }
}
