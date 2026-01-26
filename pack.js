#!/usr/bin/env node

/**
 * Schema 项目打包脚本
 * 功能：
 * 1. 构建后端 (NestJS)
 * 2. 构建前端 (Vue 3 + Vite)
 * 3. 将前端构建文件移动到 dist/frontend 目录
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  frontendDir: path.join(__dirname, 'client'),
  backendDir: __dirname,
  distDir: path.join(__dirname, 'dist'),
  frontendDistDir: path.join(__dirname, 'dist', 'frontend'),
  frontendBuildOutputDir: path.join(__dirname, 'client', 'dist'),
};

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 执行命令
function runCommand(command, cwd, errorMessage) {
  try {
    log(`执行命令: ${command}`, 'blue');
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: 'cmd.exe' // Windows 使用 cmd.exe
    });
    return true;
  } catch (err) {
    error(errorMessage || `命令执行失败: ${command}`);
    return false;
  }
}

// 清理 dist 目录
function cleanDist() {
  info('清理 dist 目录...');
  if (fs.existsSync(CONFIG.distDir)) {
    fs.rmSync(CONFIG.distDir, { recursive: true, force: true });
    success('dist 目录已清理');
  } else {
    info('dist 目录不存在，无需清理');
  }
}

// 构建后端
function buildBackend() {
  info('开始构建后端...');
  const result = runCommand(
    'pnpm build',
    CONFIG.backendDir,
    '后端构建失败'
  );
  if (result) {
    success('后端构建完成');
  }
  return result;
}

// 构建前端
function buildFrontend() {
  info('开始构建前端...');
  const result = runCommand(
    'pnpm build',
    CONFIG.frontendDir,
    '前端构建失败'
  );
  if (result) {
    success('前端构建完成');
  }
  return result;
}

// 移动前端构建文件
function moveFrontendBuild() {
  info('移动前端构建文件到 dist/frontend...');
  
  // 检查前端构建输出目录是否存在
  if (!fs.existsSync(CONFIG.frontendBuildOutputDir)) {
    error(`前端构建输出目录不存在: ${CONFIG.frontendBuildOutputDir}`);
    return false;
  }

  // 创建 dist/frontend 目录
  if (!fs.existsSync(CONFIG.distDir)) {
    fs.mkdirSync(CONFIG.distDir, { recursive: true });
  }
  
  if (fs.existsSync(CONFIG.frontendDistDir)) {
    fs.rmSync(CONFIG.frontendDistDir, { recursive: true, force: true });
  }

  // 移动文件
  fs.renameSync(CONFIG.frontendBuildOutputDir, CONFIG.frontendDistDir);
  success('前端构建文件已移动到 dist/frontend');
  
  return true;
}

// 主函数
function main() {
  log('========================================', 'cyan');
  log('Schema 项目打包脚本', 'cyan');
  log('========================================', 'cyan');
  
  // 检查工作目录
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    error('请在项目根目录运行此脚本');
  }

  // 1. 清理 dist 目录
  cleanDist();
  
  // 2. 构建后端
  if (!buildBackend()) {
    error('后端构建失败，终止打包');
  }
  
  // 3. 构建前端
  if (!buildFrontend()) {
    error('前端构建失败，终止打包');
  }
  
  // 4. 移动前端构建文件
  if (!moveFrontendBuild()) {
    error('移动前端构建文件失败');
  }
  
  log('========================================', 'cyan');
  success('打包完成！');
  log('========================================', 'cyan');
  log('输出目录:', 'yellow');
  log(`  - 后端: ${path.join(CONFIG.distDir, 'main.js')}`, 'yellow');
  log(`  - 前端: ${CONFIG.frontendDistDir}`, 'yellow');
  log('========================================', 'cyan');
}

// 运行主函数
main();
