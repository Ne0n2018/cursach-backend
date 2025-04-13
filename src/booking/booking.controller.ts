/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BookingService } from './booking.service';
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
import {
  CreateBookingDto,
  UpdateBookingDto,
} from 'src/DTO/booking/booking.dto';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER)
@ApiBearerAuth()
export class BookingController {
  constructor(private bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid time slot or conflict' })
  @ApiBody({ type: CreateBookingDto })
  async create(@Request() req, @Body() data: CreateBookingDto) {
    return this.bookingService.create(req.user.sub, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings for the user' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  async findAll(@Request() req) {
    return this.bookingService.findAll(req.user.sub);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a booking (e.g., cancel)' })
  @ApiResponse({ status: 200, description: 'Booking updated successfully' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  @ApiBody({ type: UpdateBookingDto })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() data: UpdateBookingDto,
  ) {
    return this.bookingService.update(id, req.user.sub, data);
  }
}
