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

@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() createPageDto: CreatePageDto,
  ) {
    const page = await this.pageService.create(userId, createPageDto);
    return { code: 0, data: page };
  }

  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: PageQueryDto,
  ) {
    const result = await this.pageService.findAll(userId, query);
    return { code: 0, data: result };
  }

  @Get('tree/:libraryId')
  async getTree(
    @CurrentUser('id') userId: string,
    @Param('libraryId') libraryId: string,
  ) {
    const tree = await this.pageService.getTree(userId, libraryId);
    return { code: 0, data: tree };
  }

  @Get(':id')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const page = await this.pageService.findOne(userId, id);
    return { code: 0, data: page };
  }

  @Put(':id')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    const page = await this.pageService.update(userId, id, updatePageDto);
    return { code: 0, data: page };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    const result = await this.pageService.remove(userId, id);
    return { code: 0, data: result };
  }

  @Get(':id/tags')
  async getTags(
    @CurrentUser('id') userId: string,
    @Param('id') pageId: string,
  ) {
    const tags = await this.pageService.getTags(userId, pageId);
    return { code: 0, data: tags };
  }

  @Post(':id/tags/attach')
  @HttpCode(HttpStatus.OK)
  async attachTag(
    @CurrentUser('id') userId: string,
    @Param('id') pageId: string,
    @Body() pageTagDto: PageTagOperationDto,
  ) {
    await this.pageService.attachTag(userId, pageId, pageTagDto.tagId);
    return { code: 0, message: 'Tag attached successfully' };
  }

  @Post(':id/tags/detach')
  @HttpCode(HttpStatus.OK)
  async detachTag(
    @CurrentUser('id') userId: string,
    @Param('id') pageId: string,
    @Body() pageTagDto: PageTagOperationDto,
  ) {
    await this.pageService.detachTag(userId, pageId, pageTagDto.tagId);
    return { code: 0, message: 'Tag detached successfully' };
  }

  @Put(':id/tags')
  @HttpCode(HttpStatus.OK)
  async updateTags(
    @CurrentUser('id') userId: string,
    @Param('id') pageId: string,
    @Body() updateTagsDto: PageTagsUpdateDto,
  ) {
    await this.pageService.updateTags(userId, pageId, updateTagsDto.tagIds);
    return { code: 0, message: 'Tags updated successfully' };
  }
}