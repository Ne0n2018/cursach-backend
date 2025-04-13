import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLoggerService } from './logger.service';
import * as morgan from 'morgan';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';

async function bootstrap() {
  const logger = new WinstonLoggerService();

  try {
    const app = await NestFactory.create(AppModule, {
      logger,
    });

    // Включаем валидацию
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.use(
      morgan('combined', {
        stream: { write: (message: string) => logger.log(message.trim()) },
      }),
    );

    const config = new DocumentBuilder()
      .setTitle('My NestJS API')
      .setDescription('API documentation for the NestJS application')
      .setVersion('1.0')
      .addTag('auth', 'Operations related to authentication')
      .addTag('admin', 'operations releted to admin')
      .addTag('teachers', 'Operations related to teachers')
      .addTag('bookings', 'Operations related to booking')
      .addTag('reviews', 'Operations related to reviews')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    fs.writeFileSync('./swagger.json', JSON.stringify(document, null, 2));
    SwaggerModule.setup('api', app, document);

    const port = parseInt(process.env.PORT || '3000', 10);
    if (isNaN(port)) {
      throw new Error('Invalid port number');
    }

    await app.listen(port);
    logger.log(`Application is running on port ${port}`);
    logger.log(`Swagger is available at http://localhost:${port}/api`);
  } catch (error) {
    logger.error(
      'Failed to start the application',
      error instanceof Error ? error.stack : String(error),
    );
    process.exit(1);
  }
}

bootstrap();
