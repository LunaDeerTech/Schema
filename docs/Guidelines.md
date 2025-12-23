# Schema 项目开发指南

> 版本：v1.0  
> 更新日期：2025-12-23  
> 文档类型：技术开发规范与项目计划

---

## 一、项目概述

### 1.1 项目简介

Schema 是一款面向个人的结构化知识管理系统，旨在帮助用户建立清晰、可扩展、可回顾的个人知识体系。本项目采用 TypeScript 全栈开发，前后端一体式部署架构。

### 1.2 技术选型概览

| 层级 | 技术栈 | 说明 |
|------|--------|------|
| 前端框架 | Vue 3 + TypeScript | 组合式 API，类型安全 |
| 前端构建 | Vite | 快速开发与构建 |
| 状态管理 | Pinia | Vue 3 官方推荐 |
| UI 组件库 | Element Plus / Naive UI | 按需选择 |
| 富文本编辑 | Tiptap / Milkdown | 基于 ProseMirror 的现代编辑器 |
| 后端框架 | NestJS | 企业级 Node.js 框架 |
| 数据库 | SQLite | 轻量级嵌入式数据库 |
| ORM | Prisma | 类型安全的数据库访问 |
| 认证 | JWT + Passport | 单用户认证方案 |
| 部署 | Docker | 容器化一体式部署 |

---

## 二、系统架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Container                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    NestJS Server                         │   │
│  │  ┌────────────────┐  ┌────────────────────────────────┐  │   │
│  │  │  Static Files  │  │         REST API               │  │   │
│  │  │  (Vue Build)   │  │  /api/v1/*                     │  │   │
│  │  └────────────────┘  └────────────────────────────────┘  │   │
│  │                              │                           │   │
│  │                    ┌─────────┴─────────┐                 │   │
│  │                    │   Service Layer   │                 │   │
│  │                    └─────────┬─────────┘                 │   │
│  │                              │                           │   │
│  │                    ┌─────────┴─────────┐                 │   │
│  │                    │   Prisma ORM      │                 │   │
│  │                    └─────────┬─────────┘                 │   │
│  └──────────────────────────────┼───────────────────────────┘   │
│                                 │                               │
│  ┌──────────────────────────────┴───────────────────────────┐   │
│  │                        SQLite                            │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                 │
                          Port: 3000 (单一入口)
```

### 2.2 目录结构

```
schema/
├── docs/                          # 项目文档
│   ├── ProductDescription.md
│   ├── InterfaceDesign.md
│   └── Guidelines.md
│
├── packages/                      # Monorepo 工作区
│   ├── client/                    # 前端项目
│   │   ├── src/
│   │   │   ├── assets/           # 静态资源
│   │   │   ├── components/       # 通用组件
│   │   │   │   ├── common/       # 基础通用组件
│   │   │   │   ├── editor/       # 编辑器相关组件
│   │   │   │   └── layout/       # 布局组件
│   │   │   ├── composables/      # 组合式函数
│   │   │   ├── layouts/          # 页面布局
│   │   │   ├── pages/            # 页面视图
│   │   │   │   ├── home/         # 首页/工作台
│   │   │   │   ├── library/      # 知识库页面
│   │   │   │   ├── page/         # 页面详情
│   │   │   │   ├── search/       # 搜索结果
│   │   │   │   ├── settings/     # 设置页面
│   │   │   │   └── public/       # 公开访问页面
│   │   │   ├── router/           # 路由配置
│   │   │   ├── stores/           # Pinia 状态管理
│   │   │   ├── services/         # API 服务层
│   │   │   ├── types/            # TypeScript 类型定义
│   │   │   ├── utils/            # 工具函数
│   │   │   ├── App.vue
│   │   │   └── main.ts
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── server/                    # 后端项目
│   │   ├── src/
│   │   │   ├── modules/          # 功能模块
│   │   │   │   ├── auth/         # 认证模块
│   │   │   │   ├── library/      # 知识库模块
│   │   │   │   ├── page/         # 页面模块
│   │   │   │   ├── tag/          # 标签模块
│   │   │   │   ├── search/       # 搜索模块
│   │   │   │   ├── task/         # 任务模块
│   │   │   │   ├── template/     # 模板模块
│   │   │   │   ├── version/      # 版本控制模块
│   │   │   │   ├── backup/       # 备份模块
│   │   │   │   └── public/       # 公开访问模块
│   │   │   ├── common/           # 公共模块
│   │   │   │   ├── decorators/   # 自定义装饰器
│   │   │   │   ├── filters/      # 异常过滤器
│   │   │   │   ├── guards/       # 守卫
│   │   │   │   ├── interceptors/ # 拦截器
│   │   │   │   └── pipes/        # 管道
│   │   │   ├── config/           # 配置管理
│   │   │   ├── prisma/           # Prisma 客户端
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma     # 数据库模型
│   │   │   └── migrations/       # 数据库迁移
│   │   ├── test/                 # 测试文件
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── shared/                    # 共享代码
│       ├── src/
│       │   ├── types/            # 共享类型定义
│       │   ├── constants/        # 共享常量
│       │   └── utils/            # 共享工具函数
│       ├── tsconfig.json
│       └── package.json
│
├── docker/                        # Docker 相关
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── nginx.conf
│
├── scripts/                       # 构建脚本
│   ├── build.sh
│   └── deploy.sh
│
├── .github/                       # GitHub Actions
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
│
├── .env.example                   # 环境变量示例
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── pnpm-workspace.yaml           # pnpm 工作区配置
├── package.json
├── tsconfig.base.json            # 基础 TS 配置
└── README.md
```

### 2.3 前后端一体部署方案

采用 NestJS 静态文件服务方案，将 Vue 构建产物作为静态资源托管：

```typescript
// server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // API 路由前缀
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'], // 健康检查接口排除前缀
  });
  
  // 静态文件服务（Vue 构建产物）
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // SPA 回退处理
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(join(__dirname, '..', 'public', 'index.html'));
    } else {
      next();
    }
  });
  
  await app.listen(3000);
}
bootstrap();
```

---

## 三、数据模型设计

### 3.1 核心实体关系

```
┌─────────────┐     1:N     ┌─────────────┐
│   Library   │────────────▶│    Page     │
└─────────────┘             └─────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
              ┌──────────┐  ┌──────────┐  ┌──────────┐
              │  Version │  │   Task   │  │   Tag    │
              └──────────┘  └──────────┘  └──────────┘
                                              │
                                         N:M  │
              ┌──────────┐               ┌────┴────┐
              │ Template │               │ PageTag │
              └──────────┘               └─────────┘
```

### 3.2 Prisma Schema 定义

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

// 用户（单用户模式）
model User {
  id           String    @id @default(uuid())
  email        String    @unique
  passwordHash String
  displayName  String?
  avatar       String?
  settings     Json?     @default("{}")
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  
  libraries    Library[]
  pages        Page[]
  templates    Template[]
}

// 知识库
model Library {
  id          String    @id @default(uuid())
  title       String
  description String?
  icon        String?
  sortOrder   Int       @default(0)
  isPublic    Boolean   @default(false)
  publicSlug  String?   @unique
  metadata    Json?     @default("{}")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  pages       Page[]
  
  @@index([userId])
}

// 页面
model Page {
  id          String    @id @default(uuid())
  title       String
  content     Json      // 富文本内容（JSON 格式）
  icon        String?
  coverImage  String?
  isPublic    Boolean   @default(false)
  publicSlug  String?   @unique
  sortOrder   Int       @default(0)
  metadata    Json?     @default("{}")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  lastViewedAt DateTime?
  
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  libraryId   String
  library     Library   @relation(fields: [libraryId], references: [id], onDelete: Cascade)
  
  parentId    String?
  parent      Page?     @relation("PageHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children    Page[]    @relation("PageHierarchy")
  
  versions    PageVersion[]
  tasks       Task[]
  tags        PageTag[]
  
  // 页面引用关系
  outgoingRefs PageReference[] @relation("SourcePage")
  incomingRefs PageReference[] @relation("TargetPage")
  
  @@index([userId])
  @@index([libraryId])
  @@index([parentId])
  @@index([isPublic])
  @@fulltext([title, content])
}

// 页面版本
model PageVersion {
  id          String    @id @default(uuid())
  content     Json
  message     String?
  createdAt   DateTime  @default(now())
  
  pageId      String
  page        Page      @relation(fields: [pageId], references: [id], onDelete: Cascade)
  
  @@index([pageId])
}

// 页面引用关系
model PageReference {
  id          String    @id @default(uuid())
  createdAt   DateTime  @default(now())
  
  sourceId    String
  source      Page      @relation("SourcePage", fields: [sourceId], references: [id], onDelete: Cascade)
  
  targetId    String
  target      Page      @relation("TargetPage", fields: [targetId], references: [id], onDelete: Cascade)
  
  @@unique([sourceId, targetId])
  @@index([sourceId])
  @@index([targetId])
}

// 标签
model Tag {
  id          String    @id @default(uuid())
  name        String    @unique
  color       String?
  createdAt   DateTime  @default(now())
  
  pages       PageTag[]
}

// 页面-标签关联
model PageTag {
  pageId      String
  page        Page      @relation(fields: [pageId], references: [id], onDelete: Cascade)
  
  tagId       String
  tag         Tag       @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@id([pageId, tagId])
}

// 任务
model Task {
  id          String    @id @default(uuid())
  content     String
  isCompleted Boolean   @default(false)
  dueDate     DateTime?
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  completedAt DateTime?
  
  pageId      String
  page        Page      @relation(fields: [pageId], references: [id], onDelete: Cascade)
  
  @@index([pageId])
  @@index([isCompleted])
  @@index([dueDate])
}

// 模板
model Template {
  id          String    @id @default(uuid())
  title       String
  description String?
  content     Json
  category    String?
  isBuiltIn   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userId      String?
  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([category])
}

// 系统配置
model SystemConfig {
  key         String    @id
  value       Json
  updatedAt   DateTime  @updatedAt
}
```

---

## 四、API 设计规范

### 4.1 API 路由规划

| 模块 | 路径前缀 | 说明 |
|------|----------|------|
| 认证 | `/api/v1/auth` | 登录、注册、Token 刷新 |
| 用户 | `/api/v1/user` | 用户信息、设置 |
| 知识库 | `/api/v1/libraries` | 知识库 CRUD |
| 页面 | `/api/v1/pages` | 页面 CRUD、版本、引用 |
| 标签 | `/api/v1/tags` | 标签管理 |
| 任务 | `/api/v1/tasks` | 任务管理 |
| 模板 | `/api/v1/templates` | 模板管理 |
| 搜索 | `/api/v1/search` | 全文搜索 |
| 公开 | `/api/v1/public` | 公开访问接口 |
| 备份 | `/api/v1/backup` | 数据备份导出 |

### 4.2 RESTful 接口示例

```typescript
// 知识库模块
GET    /api/v1/libraries              // 获取所有知识库
POST   /api/v1/libraries              // 创建知识库
GET    /api/v1/libraries/:id          // 获取知识库详情
PUT    /api/v1/libraries/:id          // 更新知识库
DELETE /api/v1/libraries/:id          // 删除知识库
GET    /api/v1/libraries/:id/pages    // 获取知识库下的页面树

// 页面模块
GET    /api/v1/pages                  // 获取页面列表（支持过滤）
POST   /api/v1/pages                  // 创建页面
GET    /api/v1/pages/:id              // 获取页面详情
PUT    /api/v1/pages/:id              // 更新页面
DELETE /api/v1/pages/:id              // 删除页面
POST   /api/v1/pages/:id/move         // 移动页面
GET    /api/v1/pages/:id/versions     // 获取版本历史
POST   /api/v1/pages/:id/versions     // 创建新版本
GET    /api/v1/pages/:id/versions/:vid // 获取指定版本
POST   /api/v1/pages/:id/versions/:vid/restore // 恢复版本
GET    /api/v1/pages/:id/references   // 获取页面引用关系

// 搜索模块
GET    /api/v1/search                 // 全文搜索
GET    /api/v1/search/recent          // 最近访问
GET    /api/v1/search/suggestions     // 搜索建议

// 公开访问（无需认证）
GET    /api/v1/public/pages/:slug     // 获取公开页面
GET    /api/v1/public/libraries/:slug // 获取公开知识库
```

### 4.3 响应格式规范

```typescript
// 成功响应
interface SuccessResponse<T> {
  code: 0;
  data: T;
  message?: string;
}

// 分页响应
interface PaginatedResponse<T> {
  code: 0;
  data: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  };
}

// 错误响应
interface ErrorResponse {
  code: number;       // 业务错误码
  message: string;    // 错误信息
  details?: unknown;  // 详细信息（开发环境）
}
```

### 4.4 错误码定义

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数验证失败 |
| 1002 | 资源不存在 |
| 1003 | 资源已存在 |
| 2001 | 未授权 |
| 2002 | Token 过期 |
| 2003 | 权限不足 |
| 5001 | 服务器内部错误 |
| 5002 | 数据库错误 |

---

## 五、前端开发规范

### 5.1 Vue 组件规范

#### 命名约定

```
组件文件：PascalCase.vue
组合式函数：useCamelCase.ts
工具函数：camelCase.ts
类型定义：PascalCase.ts 或 types.ts
常量：UPPER_SNAKE_CASE
```

#### 组件结构

```vue
<script setup lang="ts">
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import type { PageInfo } from '@/types'

// 2. Props 定义
interface Props {
  pageId: string
  readonly?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  readonly: false,
})

// 3. Emits 定义
interface Emits {
  (e: 'update', content: string): void
  (e: 'save'): void
}
const emit = defineEmits<Emits>()

// 4. 状态与计算属性
const loading = ref(false)
const content = ref('')
const isEditable = computed(() => !props.readonly)

// 5. 方法
function handleSave() {
  emit('save')
}

// 6. 生命周期
onMounted(async () => {
  await loadContent()
})
</script>

<template>
  <div class="page-editor">
    <!-- 模板内容 -->
  </div>
</template>

<style scoped lang="scss">
.page-editor {
  // 样式
}
</style>
```

### 5.2 状态管理规范

```typescript
// stores/page.ts
import { defineStore } from 'pinia'
import type { Page, PageTree } from '@/types'
import { pageApi } from '@/services/api'

interface PageState {
  currentPage: Page | null
  pageTree: PageTree[]
  loading: boolean
}

export const usePageStore = defineStore('page', {
  state: (): PageState => ({
    currentPage: null,
    pageTree: [],
    loading: false,
  }),

  getters: {
    pageTitle: (state) => state.currentPage?.title ?? '',
    hasUnsavedChanges: (state) => {
      // 检查是否有未保存的更改
    },
  },

  actions: {
    async fetchPage(id: string) {
      this.loading = true
      try {
        this.currentPage = await pageApi.getPage(id)
      } finally {
        this.loading = false
      }
    },

    async savePage() {
      if (!this.currentPage) return
      await pageApi.updatePage(this.currentPage.id, this.currentPage)
    },
  },
})
```

### 5.3 API 服务层规范

```typescript
// services/api/page.ts
import { httpClient } from '../http'
import type { Page, CreatePageDto, UpdatePageDto, PageVersion } from '@/types'

export const pageApi = {
  // 获取页面列表
  async getPages(params?: { libraryId?: string; parentId?: string }) {
    return httpClient.get<Page[]>('/pages', { params })
  },

  // 获取页面详情
  async getPage(id: string) {
    return httpClient.get<Page>(`/pages/${id}`)
  },

  // 创建页面
  async createPage(data: CreatePageDto) {
    return httpClient.post<Page>('/pages', data)
  },

  // 更新页面
  async updatePage(id: string, data: UpdatePageDto) {
    return httpClient.put<Page>(`/pages/${id}`, data)
  },

  // 删除页面
  async deletePage(id: string) {
    return httpClient.delete(`/pages/${id}`)
  },

  // 获取版本历史
  async getVersions(id: string) {
    return httpClient.get<PageVersion[]>(`/pages/${id}/versions`)
  },
}
```

### 5.4 编辑器集成方案

推荐使用 Tiptap 作为富文本编辑器，基于 ProseMirror 构建：

```typescript
// composables/useEditor.ts
import { useEditor as useTiptapEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { PageReference } from '@/editor/extensions/page-reference'
import { SlashCommand } from '@/editor/extensions/slash-command'

export function useEditor(options: EditorOptions) {
  const editor = useTiptapEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: '输入 / 插入内容块...',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      PageReference,
      SlashCommand,
    ],
    content: options.content,
    onUpdate: ({ editor }) => {
      options.onUpdate?.(editor.getJSON())
    },
  })

  return { editor }
}
```

---

## 六、后端开发规范

### 6.1 模块结构

```typescript
// modules/page/
├── page.module.ts        // 模块定义
├── page.controller.ts    // 控制器
├── page.service.ts       // 服务层
├── page.repository.ts    // 数据访问层（可选）
├── dto/
│   ├── create-page.dto.ts
│   ├── update-page.dto.ts
│   └── page-query.dto.ts
├── entities/
│   └── page.entity.ts    // 响应实体
└── page.controller.spec.ts // 测试
```

### 6.2 控制器规范

```typescript
// modules/page/page.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { PageService } from './page.service'
import { CreatePageDto, UpdatePageDto, PageQueryDto } from './dto'

@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  async findAll(
    @CurrentUser('id') userId: string,
    @Query() query: PageQueryDto,
  ) {
    return this.pageService.findAll(userId, query)
  }

  @Get(':id')
  async findOne(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.pageService.findOne(userId, id)
  }

  @Post()
  async create(
    @CurrentUser('id') userId: string,
    @Body() createPageDto: CreatePageDto,
  ) {
    return this.pageService.create(userId, createPageDto)
  }

  @Put(':id')
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pageService.update(userId, id, updatePageDto)
  }

  @Delete(':id')
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
  ) {
    return this.pageService.remove(userId, id)
  }
}
```

### 6.3 服务层规范

```typescript
// modules/page/page.service.ts
import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import { CreatePageDto, UpdatePageDto, PageQueryDto } from './dto'

@Injectable()
export class PageService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, query: PageQueryDto) {
    const { libraryId, parentId, page = 1, pageSize = 20 } = query

    const where = {
      userId,
      ...(libraryId && { libraryId }),
      ...(parentId !== undefined && { parentId }),
    }

    const [items, total] = await Promise.all([
      this.prisma.page.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sortOrder: 'asc' },
        include: {
          tags: { include: { tag: true } },
        },
      }),
      this.prisma.page.count({ where }),
    ])

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    }
  }

  async findOne(userId: string, id: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, userId },
      include: {
        library: true,
        parent: true,
        children: { orderBy: { sortOrder: 'asc' } },
        tags: { include: { tag: true } },
        outgoingRefs: { include: { target: true } },
        incomingRefs: { include: { source: true } },
      },
    })

    if (!page) {
      throw new NotFoundException('页面不存在')
    }

    // 更新最后访问时间
    await this.prisma.page.update({
      where: { id },
      data: { lastViewedAt: new Date() },
    })

    return page
  }

  async create(userId: string, dto: CreatePageDto) {
    return this.prisma.page.create({
      data: {
        ...dto,
        userId,
        content: dto.content ?? { type: 'doc', content: [] },
      },
    })
  }

  async update(userId: string, id: string, dto: UpdatePageDto) {
    const page = await this.prisma.page.findFirst({
      where: { id, userId },
    })

    if (!page) {
      throw new NotFoundException('页面不存在')
    }

    return this.prisma.page.update({
      where: { id },
      data: dto,
    })
  }

  async remove(userId: string, id: string) {
    const page = await this.prisma.page.findFirst({
      where: { id, userId },
    })

    if (!page) {
      throw new NotFoundException('页面不存在')
    }

    return this.prisma.page.delete({ where: { id } })
  }
}
```

### 6.4 DTO 验证规范

```typescript
// modules/page/dto/create-page.dto.ts
import { IsString, IsOptional, IsUUID, IsBoolean, IsObject } from 'class-validator'

export class CreatePageDto {
  @IsString()
  title: string

  @IsUUID()
  libraryId: string

  @IsOptional()
  @IsUUID()
  parentId?: string

  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
```

---

## 七、开发里程碑计划

### Phase 1：基础架构搭建（2 周）

**目标**：完成项目骨架与基础设施

| 任务 | 预计工时 | 产出物 |
|------|----------|--------|
| 项目初始化（Monorepo 配置） | 0.5 天 | 项目结构、依赖配置 |
| 后端基础架构（NestJS） | 1 天 | 模块结构、中间件、守卫 |
| 数据库设计与 Prisma 配置 | 1 天 | Schema、迁移脚本 |
| 认证模块开发 | 2 天 | JWT 认证、用户管理 |
| 前端基础架构（Vue 3） | 1 天 | 路由、状态管理、布局 |
| 前后端联调配置 | 0.5 天 | API 代理、类型共享 |
| Docker 开发环境 | 0.5 天 | docker-compose.yml |
| CI/CD 基础配置 | 0.5 天 | GitHub Actions |

**里程碑交付**：可运行的全栈骨架，包含用户认证功能

---

### Phase 2：核心功能开发 - 知识库与页面（3 周）

**目标**：实现知识库与页面的核心 CRUD 功能

| 任务 | 预计工时 | 产出物 |
|------|----------|--------|
| 知识库模块后端 | 2 天 | CRUD API |
| 页面模块后端（基础） | 2 天 | CRUD API |
| 页面树形结构支持 | 1 天 | 层级查询、移动 |
| 标签模块 | 1 天 | 标签 CRUD、关联 |
| 前端侧边栏组件 | 2 天 | 知识库切换、页面树 |
| 前端页面列表与导航 | 2 天 | 面包屑、页面切换 |
| 页面详情页框架 | 2 天 | 布局、元信息展示 |
| 单元测试 | 1 天 | 后端接口测试 |

**里程碑交付**：可浏览的知识库与页面结构

---

### Phase 3：富文本编辑器（3 周）

**目标**：实现高质量的所见即所得编辑器

| 任务 | 预计工时 | 产出物 |
|------|----------|--------|
| Tiptap 编辑器集成 | 2 天 | 基础编辑器组件 |
| 基础格式支持 | 2 天 | 标题、列表、引用、代码 |
| 悬浮工具栏 | 1.5 天 | 文字选中工具栏 |
| Slash 命令面板 | 2 天 | / 快捷插入 |
| 任务列表组件 | 1 天 | 任务勾选、汇总 |
| 页面引用组件 | 1.5 天 | @引用、双链 |
| 代码块高亮 | 1 天 | 多语言语法高亮 |
| 图片上传与展示 | 1.5 天 | 图片组件 |
| 内容自动保存 | 1 天 | 防抖保存、冲突处理 |
| 编辑器性能优化 | 1 天 | 大文档优化 |

**里程碑交付**：功能完整的富文本编辑器

---

### Phase 4：高级功能（2 周）

**目标**：实现版本控制、搜索、模板等高级功能

| 任务 | 预计工时 | 产出物 |
|------|----------|--------|
| 版本控制后端 | 1.5 天 | 版本保存、回溯 API |
| 版本控制前端 | 1.5 天 | 版本面板、对比、恢复 |
| 全文搜索后端 | 2 天 | SQLite FTS5 集成 |
| 全文搜索前端 | 1.5 天 | 搜索面板、结果展示 |
| 模板系统 | 2 天 | 模板 CRUD、应用 |
| 任务汇总视图 | 1 天 | 任务列表、过滤 |

**里程碑交付**：版本控制与搜索功能可用

---

### Phase 5：公开访问与导出（1.5 周）

**目标**：实现内容公开分享与数据导出

| 任务 | 预计工时 | 产出物 |
|------|----------|--------|
| 公开访问后端 | 1.5 天 | 公开 API、slug 生成 |
| 公开访问前端 | 1.5 天 | 公开页面渲染 |
| Markdown 导出 | 1 天 | 单页/批量导出 |
| PDF 导出 | 1 天 | PDF 生成 |
| 数据备份 | 1 天 | 全量备份下载 |

**里程碑交付**：公开访问与导出功能可用

---

### Phase 6：体验优化与部署（1.5 周）

**目标**：完善用户体验，实现生产部署

| 任务 | 预计工时 | 产出物 |
|------|----------|--------|
| 响应式适配 | 1 天 | 移动端基础适配 |
| 键盘快捷键 | 1 天 | 全局快捷键支持 |
| 错误处理优化 | 0.5 天 | 友好错误提示 |
| 加载状态优化 | 0.5 天 | 骨架屏、加载动画 |
| 生产环境 Docker 配置 | 1 天 | Dockerfile、compose |
| 部署文档 | 0.5 天 | 部署指南 |
| 端到端测试 | 1 天 | E2E 测试用例 |

**里程碑交付**：可部署的生产版本

---

## 八、开发环境配置

### 8.1 环境要求

| 工具 | 版本要求 |
|------|----------|
| Node.js | >= 20.x LTS |
| pnpm | >= 8.x |
| SQLite | >= 3.x |
| Docker | >= 24.x |
| Git | >= 2.x |

### 8.2 本地开发启动

```bash
# 1. 克隆项目
git clone https://github.com/your-org/schema.git
cd schema

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件配置数据库连接等

# 4. 启动数据库（Docker）
# SQLite 不需要启动额外的数据库容器

# 5. 执行数据库迁移
pnpm --filter server prisma migrate dev

# 6. 启动开发服务器
pnpm dev

# 前端访问: http://localhost:5173
# 后端 API: http://localhost:3000/api/v1
```

### 8.3 环境变量配置

```bash
# .env.example

# 应用配置
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# 数据库
DATABASE_URL="file:./dev.db"

# JWT 配置
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# 文件上传
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# 公开访问
PUBLIC_URL=http://localhost:3000/public
```

---

## 九、部署方案

### 9.1 Docker 生产部署

```dockerfile
# docker/Dockerfile
FROM node:20-alpine AS base
RUN npm install -g pnpm

# 构建前端
FROM base AS client-builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/client/package.json ./packages/client/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile
COPY packages/client ./packages/client
COPY packages/shared ./packages/shared
RUN pnpm --filter client build

# 构建后端
FROM base AS server-builder
WORKDIR /app
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/
RUN pnpm install --frozen-lockfile
COPY packages/server ./packages/server
COPY packages/shared ./packages/shared
RUN pnpm --filter server build
RUN pnpm --filter server prisma generate

# 生产镜像
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=server-builder /app/packages/server/dist ./dist
COPY --from=server-builder /app/packages/server/node_modules ./node_modules
COPY --from=server-builder /app/packages/server/prisma ./prisma
COPY --from=client-builder /app/packages/client/dist ./public

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### 9.2 Docker Compose 生产配置

```yaml
# docker/docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL="file:./prod.db"
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./data:/app/packages/server/prisma
    restart: unless-stopped
```

---

## 十、质量保障

### 10.1 代码规范

- ESLint + Prettier 统一代码风格
- Husky + lint-staged 提交前检查
- Conventional Commits 规范化提交信息

### 10.2 测试策略

| 测试类型 | 工具 | 覆盖范围 |
|----------|------|----------|
| 单元测试 | Jest / Vitest | 服务层、工具函数 |
| 集成测试 | Jest + Supertest | API 接口 |
| 组件测试 | Vitest + Vue Test Utils | 前端组件 |
| E2E 测试 | Playwright | 核心用户流程 |

### 10.3 代码审查

- 所有代码通过 PR 合入
- 至少一人审查通过
- CI 检查全部通过

---

## 十一、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| 编辑器复杂度高 | 开发周期延长 | 优先实现核心功能，迭代增强 |
| 全文搜索性能 | 大数据量下搜索慢 | 采用 SQLite FTS5 全文索引，必要时引入 ElasticSearch |
| 内容协议变更 | 历史数据兼容 | 设计版本化的内容格式，编写迁移脚本 |
| 单人开发瓶颈 | 进度受限 | 明确优先级，MVP 优先上线 |

---

## 十二、附录

### 12.1 推荐 VS Code 扩展

```json
{
  "recommendations": [
    "Vue.volar",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "Prisma.prisma",
    "bradlc.vscode-tailwindcss",
    "ms-azuretools.vscode-docker"
  ]
}
```

### 12.2 参考资源

- [Vue 3 官方文档](https://vuejs.org/)
- [NestJS 官方文档](https://docs.nestjs.com/)
- [Prisma 官方文档](https://www.prisma.io/docs/)
- [Tiptap 编辑器文档](https://tiptap.dev/)
- [SQLite 全文搜索](https://www.sqlite.org/fts5.html)

---

