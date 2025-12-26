import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PageService } from './page.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import { PageTagOperationDto, PageTagsUpdateDto } from './dto/page-tag-operation.dto';
import { MovePageDto } from './dto/move-page.dto';

@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() createPageDto: CreatePageDto,
  ) {
    return this.pageService.create(userId, createPageDto);
  }

  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: PageQueryDto,
  ) {
    return this.pageService.findAll(userId, query);
  }

  @Get('tree/:libraryId')
  async getTree(
    @CurrentUser('id') userId: string,
    @Param('libraryId') libraryId: string,
  ) {
    return this.pageService.getTree(userId, libraryId);
  }

  @Get(':id')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.pageService.findOne(userId, id);
  }

  @Put(':id')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pageService.update(userId, id, updatePageDto);
  }

  @Delete(':id')
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.pageService.remove(userId, id);
  }

  @Get(':id/tags')
  async getTags(
    @CurrentUser('id') userId: string,
    @Param('id') pageId: string,
  ) {
    return this.pageService.getTags(userId, pageId);
  }

  @Post(':id/tags/attach')
  async attachTag(
    @CurrentUser('id') userId: string,
    @Param('id') pageId: string,
    @Body() pageTagDto: PageTagOperationDto,
  ) {
    return this.pageService.attachTag(userId, pageId, pageTagDto.tagId);
  }

  @Post(':id/tags/detach')
  async detachTag(
    @CurrentUser('id') userId: string,
    @Param('id') pageId: string,
    @Body() pageTagDto: PageTagOperationDto,
  ) {
    return this.pageService.detachTag(userId, pageId, pageTagDto.tagId);
  }

  @Post(':id/move')
  async move(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() movePageDto: MovePageDto,
  ) {
    return this.pageService.move(userId, id, movePageDto);
  }

  @Put(':id/tags')
  async updateTags(
    @CurrentUser('id') userId: string,
    @Param('id') pageId: string,
    @Body() updateTagsDto: PageTagsUpdateDto,
  ) {
    return this.pageService.updateTags(userId, pageId, updateTagsDto.tagIds);
  }
}