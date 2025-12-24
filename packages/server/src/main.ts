import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors();

  // Global prefix for API
  app.setGlobalPrefix('api/v1');

  // Serve static files from frontend build
  const clientDistPath = join(__dirname, '..', '..', '..', 'client', 'dist');
  app.useStaticAssets(clientDistPath, {
    prefix: '/',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // SPA fallback - serve index.html for non-API routes that don't match static files
  app.use((req, res, next) => {
    // Skip for API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Skip for actual files (has extension)
    if (req.path.includes('.')) {
      return next();
    }

    // Serve index.html for SPA routing
    res.sendFile(join(clientDistPath, 'index.html'));
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/v1/health`);
  console.log(`🌐 Frontend: http://localhost:${port}`);
  console.log(`📁 Client dist path: ${clientDistPath}`);
}
bootstrap();
