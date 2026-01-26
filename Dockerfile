# ============================================
# 阶段 1: 构建前端 (Vue 3)
# ============================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制前端依赖文件
COPY client/package.json client/pnpm-lock.yaml* ./

# 安装前端依赖
RUN pnpm install --frozen-lockfile

# 复制前端源代码
COPY client/ ./

# 构建前端
RUN pnpm build

# ============================================
# 阶段 2: 构建后端 (NestJS)
# ============================================
FROM node:20-alpine AS backend-builder

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制后端依赖文件
COPY package.json pnpm-lock.yaml* ./

# 安装后端依赖（包括 devDependencies 用于构建）
RUN pnpm install --frozen-lockfile

# 复制后端源代码
COPY src/ ./src/
COPY nest-cli.json tsconfig.json ./

# 构建后端
RUN pnpm build

# ============================================
# 阶段 3: 运行应用
# ============================================
FROM node:20-alpine AS runtime

WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./

# 安装生产依赖（不包含 devDependencies）
RUN pnpm install --frozen-lockfile --prod

# 复制构建产物
COPY --from=backend-builder /app/dist ./dist
COPY --from=frontend-builder /app/dist ./client/dist

# 修改权限
RUN chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 启动应用
CMD ["node", "dist/main.js"]
