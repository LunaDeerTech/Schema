import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/database/database.module';
import { PageController } from './page.controller';
import { PageService } from './page.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PageController],
  providers: [PageService],
  exports: [PageService],
})
export class PageModule {}