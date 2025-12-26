import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { LibraryModule } from './modules/library/library.module';
import { PageModule } from './modules/page/page.module';
import { TagModule } from './modules/tag/tag.module';
import { SearchModule } from './modules/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 使配置在所有模块中可用
      envFilePath: '../../.env', // .env 文件路径（相对于 src 目录）
    }),
    DatabaseModule,
    HealthModule,
    UserModule,
    AuthModule,
    LibraryModule,
    PageModule,
    TagModule,
    SearchModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
