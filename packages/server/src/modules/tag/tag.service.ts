import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { TagResponseDto } from './dto/tag-response.dto';

@Injectable()
export class TagService {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    const result = this.database.queryOne('SELECT hex(randomblob(16)) as id');
    return result.id;
  }

  /**
   * Create a new unique tag
   */
  async create(createTagDto: CreateTagDto): Promise<TagResponseDto> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    // Check if tag with same name already exists
    const existing = this.database.queryOne(
      'SELECT id FROM Tag WHERE name = ?',
      [createTagDto.name]
    );
    
    if (existing) {
      throw new ConflictException('Tag with this name already exists');
    }

    this.database.run(`
      INSERT INTO Tag (id, name, color, createdAt) VALUES (?, ?, ?, ?)
    `, [
      id,
      createTagDto.name,
      createTagDto.color || null,
      now
    ]);

    return this.findOne(id);
  }

  /**
   * Find all tags
   */
  async findAll(): Promise<TagResponseDto[]> {
    const tags = this.database.queryAll('SELECT * FROM Tag ORDER BY createdAt DESC');
    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt
    }));
  }

  /**
   * Find one tag by ID
   */
  async findOne(id: string): Promise<TagResponseDto> {
    const tag = this.database.queryOne('SELECT * FROM Tag WHERE id = ?', [id]);
    
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt
    };
  }

  /**
   * Attach a tag to a page
   */
  async attachToPage(pageId: string, tagId: string): Promise<{ success: boolean; message: string }> {
    // Verify both exist
    const page = this.database.queryOne('SELECT id FROM Page WHERE id = ?', [pageId]);
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const tag = this.database.queryOne('SELECT id FROM Tag WHERE id = ?', [tagId]);
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Check if already attached
    const existing = this.database.queryOne(
      'SELECT pageId FROM PageTag WHERE pageId = ? AND tagId = ?',
      [pageId, tagId]
    );
    
    if (existing) {
      throw new ConflictException('Tag is already attached to this page');
    }

    this.database.run(
      'INSERT INTO PageTag (pageId, tagId) VALUES (?, ?)',
      [pageId, tagId]
    );

    return { success: true, message: 'Tag attached successfully' };
  }

  /**
   * Detach a tag from a page
   */
  async detachFromPage(pageId: string, tagId: string): Promise<{ success: boolean; message: string }> {
    // Verify the association exists
    const existing = this.database.queryOne(
      'SELECT pageId FROM PageTag WHERE pageId = ? AND tagId = ?',
      [pageId, tagId]
    );
    
    if (!existing) {
      throw new NotFoundException('Tag is not attached to this page');
    }

    this.database.run(
      'DELETE FROM PageTag WHERE pageId = ? AND tagId = ?',
      [pageId, tagId]
    );

    return { success: true, message: 'Tag detached successfully' };
  }

  /**
   * Get all tags for a specific page
   */
  async getTagsForPage(pageId: string): Promise<TagResponseDto[]> {
    const tags = this.database.queryAll(`
      SELECT t.* FROM Tag t
      INNER JOIN PageTag pt ON t.id = pt.tagId
      WHERE pt.pageId = ?
      ORDER BY t.createdAt DESC
    `, [pageId]);

    return tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      createdAt: tag.createdAt
    }));
  }

  /**
   * Delete a tag (also removes associations)
   */
  async delete(id: string): Promise<{ success: boolean; message: string }> {
    const tag = this.database.queryOne('SELECT id FROM Tag WHERE id = ?', [id]);
    
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    // Delete will cascade due to foreign key constraint
    this.database.run('DELETE FROM Tag WHERE id = ?', [id]);

    return { success: true, message: 'Tag deleted successfully' };
  }
}