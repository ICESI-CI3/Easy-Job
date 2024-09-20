import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: '*', // Add your production frontend URL when ready
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  });
  
  await app.listen(3000);
}
bootstrap();
