/**
 * 数据库工具函数
 * 提供常用的数据库操作辅助方法
 */

/**
 * 生成 UUID
 */
export function generateUUID(): string {
  // 使用 crypto 模块生成 UUID
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // 备用实现
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 安全的 JSON 解析
 */
export function safeJSONParse<T>(value: any, defaultValue: T | null = null): T | null {
  if (!value) return defaultValue;
  if (typeof value === 'object') return value;
  
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

/**
 * 安全的 JSON 字符串化
 */
export function safeJSONStringify(value: any): string {
  if (!value) return '{}';
  if (typeof value === 'string') return value;
  
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
}

/**
 * 构建分页查询
 */
export function buildPaginationQuery(
  tableName: string,
  where: Record<string, any> = {},
  orderBy: string = 'createdAt DESC',
  page: number = 1,
  pageSize: number = 20
) {
  const offset = (page - 1) * pageSize;
  
  // 构建 WHERE 子句
  const whereClauses: string[] = [];
  const params: any[] = [];
  
  Object.entries(where).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (key === 'search') {
        // 搜索功能
        whereClauses.push(`(title LIKE ? OR content LIKE ?)`);
        params.push(`%${value}%`, `%${value}%`);
      } else if (Array.isArray(value)) {
        // IN 查询
        const placeholders = value.map(() => '?').join(',');
        whereClauses.push(`${key} IN (${placeholders})`);
        params.push(...value);
      } else {
        whereClauses.push(`${key} = ?`);
        params.push(value);
      }
    }
  });
  
  const whereClause = whereClauses.length > 0 
    ? 'WHERE ' + whereClauses.join(' AND ') 
    : '';
  
  return {
    countQuery: `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`,
    selectQuery: `SELECT * FROM ${tableName} ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    params: [...params, pageSize, offset]
  };
}

/**
 * 执行分页查询
 */
export function executePaginationQuery(
  db: any,
  tableName: string,
  where: Record<string, any> = {},
  orderBy: string = 'createdAt DESC',
  page: number = 1,
  pageSize: number = 20
) {
  const { countQuery, selectQuery, params } = buildPaginationQuery(
    tableName,
    where,
    orderBy,
    page,
    pageSize
  );
  
  const totalResult = db.prepare(countQuery).get(...params.slice(0, -2));
  const total = totalResult ? totalResult.total : 0;
  
  const items = db.prepare(selectQuery).all(...params);
  
  return {
    items,
    total,
    page,
    pageSize,
    hasMore: page * pageSize < total
  };
}

/**
 * 检查记录是否存在
 */
export function exists(db: any, tableName: string, where: Record<string, any>): boolean {
  const whereClauses: string[] = [];
  const params: any[] = [];
  
  Object.entries(where).forEach(([key, value]) => {
    whereClauses.push(`${key} = ?`);
    params.push(value);
  });
  
  const query = `SELECT 1 FROM ${tableName} WHERE ${whereClauses.join(' AND ')}`;
  const result = db.prepare(query).get(...params);
  
  return !!result;
}

/**
 * 格式化日期为 ISO 字符串
 */
export function formatDate(date: Date | string | number): string {
  if (!date) return new Date().toISOString();
  
  const d = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
    
  return d.toISOString();
}

/**
 * 验证邮箱格式
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 验证 UUID 格式
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * 生成公共 Slug
 */
export function generatePublicSlug(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 深度克隆对象（用于数据库记录处理）
 */
export function deepClone<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  const cloned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

/**
 * 处理数据库空值
 */
export function handleDBNull<T>(value: T | null | undefined, defaultValue: T): T {
  return value === null || value === undefined ? defaultValue : value;
}

/**
 * 转换布尔值到数据库格式 (0/1)
 */
export function toDBBoolean(value: boolean): number {
  return value ? 1 : 0;
}

/**
 * 转换数据库布尔值到 JavaScript 布尔值
 */
export function fromDBBoolean(value: number | boolean | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  return value === 1;
}

/**
 * 批量插入优化
 */
export function buildBatchInsert(
  tableName: string,
  items: Record<string, any>[],
  conflictResolution: string = ''
): { query: string; params: any[] } {
  if (items.length === 0) {
    return { query: '', params: [] };
  }
  
  const columns = Object.keys(items[0]);
  const placeholders = columns.map(() => '?').join(', ');
  const values = items.flatMap(item => columns.map(col => item[col]));
  
  let query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
  
  if (conflictResolution) {
    query += ` ${conflictResolution}`;
  }
  
  return { query, params: values };
}