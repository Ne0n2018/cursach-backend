import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLoggerService } from './logger.service';
import * as morgan from 'morgan';

async function bootstrap() {
  const logger = new WinstonLoggerService();

  try {
    const app = await NestFactory.create(AppModule, {
      logger,
    });

    app.use(
      morgan('combined', {
        stream: { write: (message: string) => logger.log(message.trim()) },
      }),
    );

    const port = parseInt(process.env.PORT || '3000', 10);
    if (isNaN(port)) {
      throw new Error('Invalid port number');
    }

    await app.listen(port);
    logger.log(`Application is running on port ${port}`);
  } catch (error) {
    const logger = new WinstonLoggerService();
    logger.error(
      'Failed to start the application',
      error instanceof Error ? error.stack : String(error),
    );
    process.exit(1);
  }
}

bootstrap();
