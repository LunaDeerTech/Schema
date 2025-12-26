import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../modules/auth/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SearchService } from './search.service';

@Controller('search')
@UseGuards(JwtAuthGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('suggestions')
  async getSuggestions(
    @CurrentUser('id') userId: string,
    @Query('q') query: string,
  ) {
    return this.searchService.searchSuggestions(userId, query);
  }
}
