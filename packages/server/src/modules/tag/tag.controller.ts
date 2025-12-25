import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { TagService } from './tag.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { PageTagDto } from './dto/page-tag.dto';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagController {
  constructor(private readonly tagService: TagService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTagDto: CreateTagDto) {
    const tag = await this.tagService.create(createTagDto);
    return { code: 0, data: tag };
  }

  @Get()
  async findAll() {
    const tags = await this.tagService.findAll();
    return { code: 0, data: tags };
  }

  @Get('page/:pageId')
  async getTagsForPage(@Param('pageId') pageId: string) {
    const tags = await this.tagService.getTagsForPage(pageId);
    return { code: 0, data: tags };
  }

  @Post('attach')
  @HttpCode(HttpStatus.OK)
  async attachToPage(@Body() pageTagDto: PageTagDto) {
    await this.tagService.attachToPage(pageTagDto.pageId, pageTagDto.tagId);
    return { code: 0, message: 'Tag attached successfully' };
  }

  @Post('detach')
  @HttpCode(HttpStatus.OK)
  async detachFromPage(@Body() pageTagDto: PageTagDto) {
    await this.tagService.detachFromPage(pageTagDto.pageId, pageTagDto.tagId);
    return { code: 0, message: 'Tag detached successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    await this.tagService.delete(id);
    return { code: 0, message: 'Tag deleted successfully' };
  }
}