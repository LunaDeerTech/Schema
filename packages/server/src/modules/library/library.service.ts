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
        'SELECT id FROM Library WHERE publicSlug = ?',
        [createLibraryDto.publicSlug]
      );
      
      if (existing) {
        throw new ConflictException('Public slug already exists');
      }
    }

    this.database.run(`
      INSERT INTO Library (
        id, title, description, icon, sortOrder, isPublic, publicSlug, 
        metadata, createdAt, updatedAt, userId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      createLibraryDto.title,
      createLibraryDto.description || null,
      createLibraryDto.icon || null,
      createLibraryDto.sortOrder || 0,
      createLibraryDto.isPublic ? 1 : 0,
      createLibraryDto.publicSlug || null,
      '{}',
      now,
      now,
      userId
    ]);

    return this.findOne(userId, id);
  }

  /**
   * List all libraries for the current user
   */
  async findAll(userId: string): Promise<LibraryResponseDto[]> {
    const libraries = this.database.query(`
      SELECT * FROM Library 
      WHERE userId = ? 
      ORDER BY sortOrder ASC, createdAt ASC
    `, [userId]);

    return libraries.map(lib => ({
      ...lib,
      isPublic: Boolean(lib.isPublic)
    })) as LibraryResponseDto[];
  }

  /**
   * Get a specific library for the current user
   */
  async findOne(userId: string, id: string): Promise<LibraryResponseDto> {
    const library = this.database.queryOne(
      'SELECT * FROM Library WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (!library) {
      throw new NotFoundException('Library not found');
    }

    return {
      ...library,
      isPublic: Boolean(library.isPublic)
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
        'SELECT id FROM Library WHERE publicSlug = ? AND id != ?',
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
      `UPDATE Library SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
      params
    );

    return this.findOne(userId, id);
  }

  /**
   * Delete a library
   */
  async remove(userId: string, id: string): Promise<void> {
    const library = this.database.queryOne(
      'SELECT id FROM Library WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (!library) {
      throw new NotFoundException('Library not found');
    }

    this.database.run(
      'DELETE FROM Library WHERE id = ? AND userId = ?',
      [id, userId]
    );
  }
}