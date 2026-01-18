import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@/database/database.service';
import { User } from '@/types/database.types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly database: DatabaseService) {}

  async findByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT id, email, passwordHash, displayName, avatar, settings, createdAt, updatedAt 
      FROM User 
      WHERE email = ?
    `;
    return this.database.queryOne(sql, [email]) as User | null;
  }

  async findById(id: string): Promise<User | null> {
    const sql = `
      SELECT id, email, passwordHash, displayName, avatar, settings, createdAt, updatedAt 
      FROM User 
      WHERE id = ?
    `;
    return this.database.queryOne(sql, [id]) as User | null;
  }

  async create(data: {
    email: string;
    password: string;
    displayName?: string;
  }): Promise<User> {
    // 检查邮箱是否已存在
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(data.password, saltRounds);
    const id = this.generateId();
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO User (id, email, passwordHash, displayName, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    this.database.run(sql, [id, data.email, passwordHash, data.displayName || null, now, now]);

    return {
      id,
      email: data.email,
      passwordHash,
      displayName: data.displayName,
      createdAt: now,
      updatedAt: now,
    };
  }

  async validatePassword(userId: string, password: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user) return false;

    return bcrypt.compare(password, user.passwordHash);
  }

  async update(id: string, data: { displayName?: string; avatar?: string }): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.displayName !== undefined) {
      updates.push('displayName = ?');
      params.push(data.displayName);
    }

    if (data.avatar !== undefined) {
      updates.push('avatar = ?');
      params.push(data.avatar);
    }

    if (updates.length === 0) {
      return user;
    }

    const now = new Date().toISOString();
    updates.push('updatedAt = ?');
    params.push(now);
    params.push(id);

    const sql = `UPDATE User SET ${updates.join(', ')} WHERE id = ?`;
    this.database.run(sql, params);

    return (await this.findById(id)) as User;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}