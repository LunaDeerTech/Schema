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
    return this.tagService.create(createTagDto);
  }

  @Get()
  async findAll() {
    return this.tagService.findAll();
  }

  @Get('page/:pageId')
  async getTagsForPage(@Param('pageId') pageId: string) {
    return this.tagService.getTagsForPage(pageId);
  }

  @Post('attach')
  async attachToPage(@Body() pageTagDto: PageTagDto) {
    return this.tagService.attachToPage(pageTagDto.pageId, pageTagDto.tagId);
  }

  @Post('detach')
  async detachFromPage(@Body() pageTagDto: PageTagDto) {
    return this.tagService.detachFromPage(pageTagDto.pageId, pageTagDto.tagId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.tagService.delete(id);
  }
}