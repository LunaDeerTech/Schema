import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class SearchService {
  constructor(private readonly db: DatabaseService) {}

  async searchSuggestions(userId: string, query: string) {
    if (!query) return [];
    
    const sql = `
      SELECT id, title, icon 
      FROM Page 
      WHERE userId = ? AND title LIKE ? 
      ORDER BY lastViewedAt DESC 
      LIMIT 10
    `;
    
    return this.db.prepare(sql).all(userId, `%${query}%`);
  }
}
