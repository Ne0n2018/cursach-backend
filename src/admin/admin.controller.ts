import {
  Controller,
  Get,
  Delete,
  Patch,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { UpdateTeacherDto } from 'src/DTO/admin/admin.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'List of all users' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'role', required: false, enum: Role })
  getAllUsers(
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
    @Query('role') role?: Role,
  ) {
    return this.adminService.getAllUsers(page, limit, role);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id', ParseIntPipe) id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('teachers')
  @ApiOperation({ summary: 'Get all teachers' })
  @ApiResponse({ status: 200, description: 'List of all teachers' })
  async getAllTeachers() {
    return this.adminService.getAllTeachers();
  }

  @Patch('teachers/:id')
  @ApiOperation({ summary: 'Update a teacher profile' })
  @ApiResponse({ status: 200, description: 'Teacher updated successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  @ApiBody({ type: UpdateTeacherDto })
  async updateTeacher(
    @Param('id', ParseIntPipe) id: string,
    @Body() data: UpdateTeacherDto,
  ) {
    return this.adminService.updateTeacher(id, data);
  }

  @Delete('teachers/:id')
  @ApiOperation({ summary: 'Delete a teacher' })
  @ApiResponse({ status: 200, description: 'Teacher deleted successfully' })
  @ApiResponse({ status: 404, description: 'Teacher not found' })
  async deleteTeacher(@Param('id', ParseIntPipe) id: string) {
    return this.adminService.deleteTeacher(id);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all bookings' })
  @ApiResponse({ status: 200, description: 'List of all bookings' })
  async getAllBookings() {
    return this.adminService.getAllBookings();
  }

  @Delete('bookings/:id')
  @ApiOperation({ summary: 'Delete a booking' })
  @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async deleteBooking(@Param('id', ParseIntPipe) id: string) {
    return this.adminService.deleteBooking(id);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Get all reviews' })
  @ApiResponse({ status: 200, description: 'List of all reviews' })
  async getAllReviews() {
    return this.adminService.getAllReviews();
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Delete a review' })
  @ApiResponse({ status: 200, description: 'Review deleted successfully' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async deleteReview(@Param('id', ParseIntPipe) id: string) {
    return this.adminService.deleteReview(id);
  }
}
