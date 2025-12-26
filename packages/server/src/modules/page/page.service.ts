import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PageQueryDto } from './dto/page-query.dto';
import { PageResponseDto } from './dto/page-response.dto';

@Injectable()
export class PageService {
  constructor(private readonly database: DatabaseService) {}

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    const result = this.database.queryOne('SELECT hex(randomblob(16)) as id');
    return result.id;
  }

  /**
   * Create a new page
   */
  async create(userId: string, createPageDto: CreatePageDto): Promise<PageResponseDto> {
    const id = this.generateId();
    const now = new Date().toISOString();
    
    // Validate library exists and user has access
    const library = this.database.queryOne(
      'SELECT id FROM Library WHERE id = ? AND userId = ?',
      [createPageDto.libraryId, userId]
    );
    
    if (!library) {
      throw new NotFoundException('Library not found');
    }

    // Validate parent page exists if provided
    if (createPageDto.parentId) {
      const parent = this.database.queryOne(
        'SELECT id, libraryId FROM Page WHERE id = ? AND userId = ?',
        [createPageDto.parentId, userId]
      );
      
      if (!parent) {
        throw new NotFoundException('Parent page not found');
      }
      
      // Ensure parent belongs to same library
      if (parent.libraryId !== createPageDto.libraryId) {
        throw new ConflictException('Parent page must belong to the same library');
      }
    }

    // Default content to empty doc
    const content = createPageDto.content ?? { type: 'doc', content: [] };
    const contentStr = JSON.stringify(content);

    // Get max sortOrder for pages with same parent
    const maxSortResult = this.database.queryOne(
      `SELECT COALESCE(MAX(sortOrder), 0) as maxSort 
       FROM Page 
       WHERE libraryId = ? AND parentId ${createPageDto.parentId ? '= ?' : 'IS NULL'}`,
      createPageDto.parentId ? [createPageDto.libraryId, createPageDto.parentId] : [createPageDto.libraryId]
    );
    const sortOrder = (maxSortResult.maxSort || 0) + 1;

    this.database.run(`
      INSERT INTO Page (
        id, title, content, icon, isPublic, sortOrder, metadata, 
        createdAt, updatedAt, userId, libraryId, parentId, coverImage
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      createPageDto.title,
      contentStr,
      createPageDto.icon || null,
      createPageDto.isPublic ? 1 : 0,
      sortOrder,
      null,
      now,
      now,
      userId,
      createPageDto.libraryId,
      createPageDto.parentId || null,
      null
    ]);

    return this.findOne(userId, id);
  }

  /**
   * Find all pages with optional filtering and pagination
   */
  async findAll(userId: string, query: PageQueryDto): Promise<{ items: PageResponseDto[]; total: number; page: number; pageSize: number; hasMore: boolean }> {
    const { libraryId, parentId, page = 1, pageSize = 20 } = query;
    const offset = (page - 1) * pageSize;

    // Build conditions
    const conditions = ['p.userId = ?'];
    const params: any[] = [userId];

    if (libraryId) {
      conditions.push('p.libraryId = ?');
      params.push(libraryId);
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        conditions.push('p.parentId IS NULL');
      } else {
        conditions.push('p.parentId = ?');
        params.push(parentId);
      }
    }

    const whereClause = conditions.join(' AND ');

    // Get total count
    const totalResult = this.database.queryOne(
      `SELECT COUNT(*) as count 
       FROM Page p 
       WHERE ${whereClause}`,
      params
    );
    const total = totalResult.count;

    // Get paginated items
    const items = this.database.query(`
      SELECT p.*, 
             l.title as libraryTitle,
             parent.title as parentTitle
      FROM Page p
      LEFT JOIN Library l ON p.libraryId = l.id
      LEFT JOIN Page parent ON p.parentId = parent.id
      WHERE ${whereClause}
      ORDER BY p.sortOrder ASC
      LIMIT ? OFFSET ?
    `, [...params, pageSize, offset]);

    const pageResponseItems = items.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      icon: item.icon,
      coverImage: item.coverImage,
      isPublic: !!item.isPublic,
      publicSlug: item.publicSlug,
      sortOrder: item.sortOrder,
      metadata: item.metadata,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      lastViewedAt: item.lastViewedAt,
      userId: item.userId,
      libraryId: item.libraryId,
      parentId: item.parentId,
      parent: item.parentId ? { 
        id: item.parentId, 
        title: item.parentTitle,
        content: null,
        isPublic: false,
        sortOrder: 0,
        createdAt: null,
        updatedAt: null,
        userId: item.userId,
        libraryId: item.libraryId,
        children: []
      } : null,
      children: [] // Empty for list view
    }));

    return {
      items: pageResponseItems,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total
    };
  }

  /**
   * Find a single page with parent and children
   */
  async findOne(userId: string, id: string): Promise<PageResponseDto> {
    const page = this.database.queryOne(`
      SELECT p.*, 
             l.title as libraryTitle,
             parent.title as parentTitle,
             parent.content as parentContent,
             parent.parentId as grandparentId
      FROM Page p
      LEFT JOIN Library l ON p.libraryId = l.id
      LEFT JOIN Page parent ON p.parentId = parent.id
      WHERE p.id = ? AND p.userId = ?
    `, [id, userId]);

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Get immediate children
    const children = this.database.query(`
      SELECT * FROM Page 
      WHERE parentId = ? AND userId = ? 
      ORDER BY sortOrder ASC
    `, [id, userId]);

    // Get tags
    const tags = this.database.query(`
      SELECT t.id, t.name, t.color, t.createdAt
      FROM Tag t
      INNER JOIN PageTag pt ON t.id = pt.tagId
      WHERE pt.pageId = ?
      ORDER BY t.createdAt DESC
    `, [id]);

    return {
      id: page.id,
      title: page.title,
      content: page.content,
      icon: page.icon,
      coverImage: page.coverImage,
      isPublic: !!page.isPublic,
      publicSlug: page.publicSlug,
      sortOrder: page.sortOrder,
      metadata: page.metadata,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      lastViewedAt: page.lastViewedAt,
      userId: page.userId,
      libraryId: page.libraryId,
      parentId: page.parentId,
      parent: page.parentId ? {
        id: page.parentId,
        title: page.parentTitle,
        content: page.parentContent,
        parentId: page.grandparentId,
        isPublic: false,
        sortOrder: 0,
        createdAt: '',
        updatedAt: '',
        userId: page.userId,
        libraryId: page.libraryId,
        children: []
      } : null,
      children: children.map(child => ({
        id: child.id,
        title: child.title,
        content: child.content,
        icon: child.icon,
        coverImage: child.coverImage,
        isPublic: !!child.isPublic,
        publicSlug: child.publicSlug,
        sortOrder: child.sortOrder,
        metadata: child.metadata,
        createdAt: child.createdAt,
        updatedAt: child.updatedAt,
        lastViewedAt: child.lastViewedAt,
        userId: child.userId,
        libraryId: child.libraryId,
        parentId: child.parentId,
        children: [] // Only immediate children
      })),
      tags: tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        createdAt: tag.createdAt
      }))
    };
  }

  /**
   * Get tree structure for a library
   */
  async getTree(userId: string, libraryId: string): Promise<PageResponseDto[]> {
    // Validate library access
    const library = this.database.queryOne(
      'SELECT id FROM Library WHERE id = ? AND userId = ?',
      [libraryId, userId]
    );
    
    if (!library) {
      throw new NotFoundException('Library not found');
    }

    // Get all pages for the library
    const pages = this.database.query(`
      SELECT * FROM Page 
      WHERE libraryId = ? AND userId = ? 
      ORDER BY sortOrder ASC
    `, [libraryId, userId]);

    // Build tree recursively
    const buildTree = (parentId: string | null): PageResponseDto[] => {
      return pages
        .filter(p => p.parentId === parentId)
        .map(page => ({
          id: page.id,
          title: page.title,
          content: page.content,
          icon: page.icon,
          coverImage: page.coverImage,
          isPublic: !!page.isPublic,
          publicSlug: page.publicSlug,
          sortOrder: page.sortOrder,
          metadata: page.metadata,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
          lastViewedAt: page.lastViewedAt,
          userId: page.userId,
          libraryId: page.libraryId,
          parentId: page.parentId,
          children: buildTree(page.id)
        }));
    };

    return buildTree(null);
  }

  /**
   * Update a page
   */
  async update(userId: string, id: string, updatePageDto: UpdatePageDto): Promise<PageResponseDto> {
    const page = this.database.queryOne(
      'SELECT * FROM Page WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Validate library exists if changing
    if (updatePageDto.libraryId && updatePageDto.libraryId !== page.libraryId) {
      const library = this.database.queryOne(
        'SELECT id FROM Library WHERE id = ? AND userId = ?',
        [updatePageDto.libraryId, userId]
      );
      
      if (!library) {
        throw new NotFoundException('Library not found');
      }
    }

    // Validate parent page if provided
    if (updatePageDto.parentId !== undefined) {
      if (updatePageDto.parentId && updatePageDto.parentId !== page.parentId) {
        const parent = this.database.queryOne(
          'SELECT id, libraryId FROM Page WHERE id = ? AND userId = ?',
          [updatePageDto.parentId, userId]
        );
        
        if (!parent) {
          throw new NotFoundException('Parent page not found');
        }

        // Check for circular reference
        if (this.hasCircularReference(id, updatePageDto.parentId)) {
          throw new ConflictException('Circular reference detected');
        }

        // Ensure parent belongs to same library
        const targetLibraryId = updatePageDto.libraryId || page.libraryId;
        if (parent.libraryId !== targetLibraryId) {
          throw new ConflictException('Parent page must belong to the same library');
        }
      }

      // If setting to null, it becomes a root page
      if (updatePageDto.parentId === null) {
        updatePageDto.parentId = undefined; // Will be handled in query
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (updatePageDto.title !== undefined) {
      updates.push('title = ?');
      params.push(updatePageDto.title);
    }

    if (updatePageDto.content !== undefined) {
      updates.push('content = ?');
      params.push(JSON.stringify(updatePageDto.content));
    }

    if (updatePageDto.libraryId !== undefined) {
      updates.push('libraryId = ?');
      params.push(updatePageDto.libraryId);
    }

    if (updatePageDto.parentId !== undefined) {
      updates.push('parentId = ?');
      params.push(updatePageDto.parentId || null);
    }

    if (updatePageDto.icon !== undefined) {
      updates.push('icon = ?');
      params.push(updatePageDto.icon || null);
    }

    if (updatePageDto.isPublic !== undefined) {
      updates.push('isPublic = ?');
      params.push(updatePageDto.isPublic ? 1 : 0);
    }

    if (updates.length === 0) {
      return this.findOne(userId, id);
    }

    updates.push('updatedAt = ?');
    params.push(new Date().toISOString());

    params.push(id, userId);

    this.database.run(
      `UPDATE Page SET ${updates.join(', ')} WHERE id = ? AND userId = ?`,
      params
    );

    return this.findOne(userId, id);
  }

  /**
   * Delete a page and its children
   */
  async remove(userId: string, id: string): Promise<{ success: boolean; message: string }> {
    const page = this.database.queryOne(
      'SELECT * FROM Page WHERE id = ? AND userId = ?',
      [id, userId]
    );

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Recursive delete function
    const deleteRecursive = (pageId: string) => {
      // Find children
      const children = this.database.query(
        'SELECT id FROM Page WHERE parentId = ? AND userId = ?',
        [pageId, userId]
      );

      // Delete children recursively
      for (const child of children) {
        deleteRecursive(child.id);
      }

      // Delete the page itself
      this.database.run('DELETE FROM Page WHERE id = ?', [pageId]);
    };

    deleteRecursive(id);

    return { success: true, message: 'Page deleted successfully' };
  }

  /**
   * Check for circular references
   */
  private hasCircularReference(pageId: string, newParentId: string): boolean {
    if (pageId === newParentId) {
      return true;
    }

    let current = newParentId;
    const visited = new Set<string>();

    while (current) {
      if (visited.has(current)) {
        return true;
      }
      visited.add(current);

      const parent = this.database.queryOne('SELECT parentId FROM Page WHERE id = ?', [current]);
      if (!parent || !parent.parentId) {
        break;
      }
      current = parent.parentId;

      if (current === pageId) {
        return true;
      }
    }

    return false;
  }

  /**
   * Attach a tag to a page
   */
  async attachTag(userId: string, pageId: string, tagId: string): Promise<{ success: boolean; message: string }> {
    // Verify page exists and user has access
    const page = this.database.queryOne(
      'SELECT id FROM Page WHERE id = ? AND userId = ?',
      [pageId, userId]
    );
    
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Verify tag exists
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
  async detachTag(userId: string, pageId: string, tagId: string): Promise<{ success: boolean; message: string }> {
    // Verify page exists and user has access
    const page = this.database.queryOne(
      'SELECT id FROM Page WHERE id = ? AND userId = ?',
      [pageId, userId]
    );
    
    if (!page) {
      throw new NotFoundException('Page not found');
    }

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
   * Update page tags (replace all tags)
   */
  async updateTags(userId: string, pageId: string, tagIds: string[]): Promise<{ success: boolean; message: string }> {
    // Verify page exists and user has access
    const page = this.database.queryOne(
      'SELECT id FROM Page WHERE id = ? AND userId = ?',
      [pageId, userId]
    );
    
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    // Verify all tags exist
    for (const tagId of tagIds) {
      const tag = this.database.queryOne('SELECT id FROM Tag WHERE id = ?', [tagId]);
      if (!tag) {
        throw new NotFoundException(`Tag not found: ${tagId}`);
      }
    }

    // Remove existing tags
    this.database.run('DELETE FROM PageTag WHERE pageId = ?', [pageId]);

    // Add new tags
    for (const tagId of tagIds) {
      this.database.run(
        'INSERT INTO PageTag (pageId, tagId) VALUES (?, ?)',
        [pageId, tagId]
      );
    }

    return { success: true, message: 'Tags updated successfully' };
  }

  /**
   * Get tags for a page
   */
  async getTags(userId: string, pageId: string): Promise<Array<{ id: string; name: string; color?: string; createdAt: string }>> {
    // Verify page exists and user has access
    const page = this.database.queryOne(
      'SELECT id FROM Page WHERE id = ? AND userId = ?',
      [pageId, userId]
    );
    
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const tags = this.database.query(`
      SELECT t.id, t.name, t.color, t.createdAt
      FROM Tag t
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
}