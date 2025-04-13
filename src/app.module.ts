import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { TeacherModule } from './teacher/teacher.module';
import { BookingModule } from './booking/booking.module';
import { ReviewModule } from './review/review.module';

@Module({
  imports: [UserModule, AuthModule, AdminModule, TeacherModule, BookingModule, ReviewModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
