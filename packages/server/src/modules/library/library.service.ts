import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CreateLibraryDto } from './dto/create-library.dto';
import { UpdateLibraryDto } from './dto/update-library.dto';
import { LibraryResponseDto } from './dto/library-response.dto';

@Injectable()
export class LibraryService {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    const result = this.database.queryOne('SELECT hex(randomblob(16)) as id');
    return result.id;
  }

  /**
   * Create a new library for the current user
   */
  async create(userId: string, createLibraryDto: CreateLibraryDto): Promise<LibraryResponseDto> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    // Check if publicSlug already exists
    if (createLibraryDto.publicSlug) {
      const existing = this.database.queryOne(
        'SELECT id FROM Page WHERE publicSlug = ?',
        [createLibraryDto.publicSlug]
      );
      
      if (existing) {
        throw new ConflictException('Public slug already exists');
      }
    }

    // Ensure content is provided, default to empty doc if not
    const content = createLibraryDto.content ?? { type: 'doc', content: [] };
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);

    this.database.run(`
      INSERT INTO Page (
        id, type, title, content, description, icon, sortOrder, isPublic, publicSlug, 
        metadata, createdAt, updatedAt, userId, libraryId, parentId
      ) VALUES (?, 'library', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)
    `, [
      id,
      createLibraryDto.title,
      contentStr,
      createLibraryDto.description || null,
      createLibraryDto.icon || null,
      createLibraryDto.sortOrder || 0,
      createLibraryDto.isPublic ? 1 : 0,
      createLibraryDto.publicSlug || null,
      '{}',
      now,
      now,
      userId,
      id // libraryId points to self
    ]);

    return this.findOne(userId, id);
  }

  /**
   * List all libraries for the current user
   */
  async findAll(userId: string): Promise<LibraryResponseDto[]> {
    const libraries = this.database.query(`
      SELECT 
        l.*,
        (SELECT COUNT(*) FROM Page p WHERE p.libraryId = l.id AND p.type = 'page') as pageCount
      FROM Page l
      WHERE l.userId = ? AND l.type = 'library'
      ORDER BY l.sortOrder ASC, l.createdAt ASC
    `, [userId]);

    return libraries.map(lib => {
      // Get tags for this library
      const tags = this.database.query(`
        SELECT t.* FROM Tag t
        INNER JOIN PageTag pt ON pt.tagId = t.id
        WHERE pt.pageId = ?
      `, [lib.id]);

      return {
        ...lib,
        isPublic: Boolean(lib.isPublic),
        content: lib.content ? JSON.parse(lib.content) : { type: 'doc', content: [] },
        pageCount: lib.pageCount,
        tags: tags
      };
    }) as LibraryResponseDto[];
  }

  /**
   * Get a specific library for the current user
   */
  async findOne(userId: string, id: string): Promise<LibraryResponseDto> {
    const library = this.database.queryOne(`
      SELECT 
        l.*,
        (SELECT COUNT(*) FROM Page p WHERE p.libraryId = l.id AND p.type = 'page') as pageCount
      FROM Page l
      WHERE l.id = ? AND l.userId = ? AND l.type = 'library'
    `, [id, userId]);

    if (!library) {
      throw new NotFoundException('Library not found');
    }

    const tags = this.database.query(`
      SELECT t.* FROM Tag t
      INNER JOIN PageTag pt ON pt.tagId = t.id
      WHERE pt.pageId = ?
    `, [id]);

    return {
      ...library,
      isPublic: Boolean(library.isPublic),
      content: library.content ? JSON.parse(library.content) : { type: 'doc', content: [] },
      pageCount: library.pageCount,
      tags: tags
    } as LibraryResponseDto;
  }

  /**
   * Update a library
   */
  async update(userId: string, id: string, updateLibraryDto: UpdateLibraryDto): Promise<LibraryResponseDto> {
    // Verify library exists and belongs to user
    await this.findOne(userId, id);

    // Check publicSlug uniqueness if being updated
    if (updateLibraryDto.publicSlug) {
      const existing = this.database.queryOne(
        'SELECT id FROM Page WHERE publicSlug = ? AND id != ?',
        [updateLibraryDto.publicSlug, id]
      );
      
      if (existing) {
        throw new ConflictException('Public slug already exists');
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (updateLibraryDto.title !== undefined) {
      updates.push('title = ?');
      params.push(updateLibraryDto.title);
    }

    if (updateLibraryDto.content !== undefined) {
      updates.push('content = ?');
      const content = updateLibraryDto.content;
      const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
      params.push(contentStr);
    }

    if (updateLibraryDto.description !== undefined) {
      updates.push('description = ?');
      params.push(updateLibraryDto.description || null);
    }

    if (updateLibraryDto.icon !== undefined) {
      updates.push('icon = ?');
      params.push(updateLibraryDto.icon || null);
    }

    if (updateLibraryDto.isPublic !== undefined) {
      updates.push('isPublic = ?');
      params.push(updateLibraryDto.isPublic ? 1 : 0);
    }

    if (updateLibraryDto.publicSlug !== undefined) {
      updates.push('publicSlug = ?');
      params.push(updateLibraryDto.publicSlug || null);
    }

    if (updateLibraryDto.sortOrder !== undefined) {
      updates.push('sortOrder = ?');
      params.push(updateLibraryDto.sortOrder);
    }

    if (updates.length === 0) {
      return this.findOne(userId, id);
    }

    updates.push('updatedAt = ?');
    params.push(new Date().toISOString());
    params.push(id);
    params.push(userId);

    this.database.run(
      `UPDATE Page SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
      params
    );

    return this.findOne(userId, id);
  }

  /**
   * Delete a library
   */
  async remove(userId: string, id: string): Promise<{ success: boolean; message: string }> {
    const library = this.database.queryOne(
      "SELECT id FROM Page WHERE id = ? AND userId = ? AND type = 'library'",
      [id, userId]
    );

    if (!library) {
      throw new NotFoundException('Library not found');
    }

    this.database.run(
      'DELETE FROM Page WHERE id = ? AND userId = ?',
      [id, userId]
    );

    return { success: true, message: 'Library deleted successfully' };
  }
}