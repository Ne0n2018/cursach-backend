/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TeacherService } from './teacher.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiProperty,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, Subject, LessonStatus } from '@prisma/client';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
} from 'class-validator';

class UpdateProfileDto {
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

class CreateScheduleDto {
  @ApiProperty({
    description: 'Start time of the schedule',
    example: '2025-04-15T14:00:00Z',
  })
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'End time of the schedule',
    example: '2025-04-15T15:00:00Z',
  })
  @IsDateString()
  endTime: string;
}

class UpdateBookingDto {
  @ApiProperty({ description: 'Status of the booking', enum: LessonStatus })
  @IsEnum(LessonStatus)
  status: LessonStatus;
}

@ApiTags('teachers')
@Controller('teachers')
export class TeacherController {
  constructor(private teacherService: TeacherService) {}

  // Эндпоинт для поиска всех репетиторов (доступен всем)
  @Get()
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, description: 'List of teachers' })
  @ApiQuery({
    name: 'subject',
    required: false,
    description: 'Filter by subject',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @Query('subject') subject?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.teacherService.findAll(subject, page, limit);
  }

  // Поиск репетитора по userId
  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get a teacher by user ID' })
  @ApiResponse({ status: 200, description: 'Teacher details' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiParam({
    name: 'userId',
    description: 'User ID of the teacher',
    type: String,
  })
  async findOne(@Param('userId') userId: string) {
    return this.teacherService.findOne(userId);
  }

  // Получение расписания репетитора по userId
  @Get('user/:userId/schedule')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get a teacher's schedule by user ID" })
  @ApiResponse({ status: 200, description: "Teacher's schedule" })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID of the teacher',
    type: String,
  })
  async getSchedule(
    @Param('userId') userId: string,
    @Query('date') date?: string,
  ) {
    return this.teacherService.getSchedule(userId, date);
  }

  // Получение отзывов о репетиторе по userId
  @Get('user/:userId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get reviews for a teacher by user ID' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiParam({
    name: 'userId',
    description: 'User ID of the teacher',
    type: String,
  })
  async getReviews(@Param('userId') userId: string) {
    return this.teacherService.getReviews(userId);
  }

  // Получение профиля репетитора
  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher profile' })
  @ApiResponse({ status: 200, description: 'Teacher profile' })
  @ApiResponse({ status: 404, description: 'Teacher profile not found' })
  async getProfile(@Request() req) {
    return this.teacherService.getProfile(req.user.sub);
  }

  // Обновление профиля репетитора по userId
  @Patch('user/:userId/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update teacher profile by user ID' })
  @ApiResponse({
    status: 200,
    description: 'Teacher profile updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Teacher profile not found' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: You can only update your own profile',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID of the teacher',
    type: String,
  })
  @ApiBody({ type: UpdateProfileDto })
  async updateProfile(
    @Param('userId') userId: string,
    @Body() data: UpdateProfileDto,
  ) {
    return this.teacherService.updateProfile(userId, data);
  }

  // Добавление доступного времени
  @Post('schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add available time slot to schedule' })
  @ApiResponse({ status: 201, description: 'Schedule added successfully' })
  @ApiResponse({ status: 400, description: 'Invalid time slot or conflict' })
  @ApiBody({ type: CreateScheduleDto })
  async addSchedule(@Request() req, @Body() data: CreateScheduleDto) {
    return this.teacherService.addSchedule(req.user.sub, data);
  }

  // Получение расписания репетитора
  @Get('schedule')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher schedule' })
  @ApiResponse({ status: 200, description: 'Teacher schedule' })
  @ApiResponse({ status: 404, description: 'Teacher profile not found' })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date in YYYY-MM-DD format',
  })
  async getTeacherSchedule(@Request() req, @Query('date') date?: string) {
    return this.teacherService.getTeacherSchedule(req.user.sub, date);
  }

  // Удаление временного слота
  @Delete('schedule/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a time slot from schedule' })
  @ApiResponse({ status: 200, description: 'Schedule deleted successfully' })
  @ApiResponse({ status: 404, description: 'Schedule not found' })
  @ApiResponse({ status: 400, description: 'Cannot delete booked schedule' })
  async deleteSchedule(@Request() req, @Param('id') id: string) {
    return this.teacherService.deleteSchedule(req.user.sub, id);
  }

  // Получение бронирований
  @Get('bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher bookings' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  @ApiResponse({ status: 404, description: 'Teacher profile not found' })
  async getBookings(@Request() req) {
    return this.teacherService.getBookings(req.user.sub);
  }

  // Обновление бронирования
  @Patch('bookings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a booking (e.g., confirm or cancel)' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBody({ type: UpdateBookingDto })
  async updateBooking(
    @Request() req,
    @Param('id') id: string,
    @Body() data: UpdateBookingDto,
  ) {
    return this.teacherService.updateBooking(req.user.sub, id, data);
  }

  // Получение отзывов репетитора
  @Get('reviews')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TEACHER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get teacher reviews' })
  @ApiResponse({ status: 200, description: 'List of reviews' })
  @ApiResponse({ status: 404, description: 'Teacher profile not found' })
  async getTeacherReviews(@Request() req) {
    return this.teacherService.getTeacherReviews(req.user.sub);
  }
}
