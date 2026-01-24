import { User } from '@/types/database.types';

export class UserResponseDto {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;

  static fromUser(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.displayName = user.displayName;
    dto.avatar = user.avatar;
    dto.isAdmin = user.isAdmin;
    dto.isBanned = user.isBanned;
    dto.createdAt = new Date(user.createdAt);
    dto.updatedAt = new Date(user.updatedAt);
    return dto;
  }
}