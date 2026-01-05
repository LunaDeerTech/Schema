import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get('search')
  async search(@Query('q') q: string) {
    return this.publicService.searchPublic(q);
  }

  @Get('pages/:slug')
  async getPage(@Param('slug') slug: string) {
    return this.publicService.findPageBySlug(slug);
  }

  @Get('libraries/:slug')
  async getLibrary(@Param('slug') slug: string) {
    return this.publicService.findLibraryBySlug(slug);
  }

  @Get('libraries/:id/tree')
  async getLibraryTree(@Param('id') id: string) {
    return this.publicService.getPublicTree(id);
  }
}
