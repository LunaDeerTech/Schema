import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 使配置在所有模块中可用
      envFilePath: '../../.env', // .env 文件路径（相对于 src 目录）
    }),
    HealthModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
