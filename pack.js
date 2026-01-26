#!/usr/bin/env node

/**
 * Schema Project Packaging Script
 * Features:
 * 1. Build backend (NestJS)
 * 2. Build frontend (Vue 3 + Vite)
 * 3. Move frontend build files to dist/frontend directory
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  frontendDir: path.join(__dirname, 'client'),
  backendDir: __dirname,
  distDir: path.join(__dirname, 'dist'),
  frontendDistDir: path.join(__dirname, 'dist', 'frontend'),
  frontendBuildOutputDir: path.join(__dirname, 'client', 'dist'),
};

// Color output
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

// Execute command
function runCommand(command, cwd, errorMessage) {
  try {
    log(`Executing command: ${command}`, 'blue');
    execSync(command, { 
      cwd, 
      stdio: 'inherit',
      shell: 'cmd.exe' // Windows uses cmd.exe
    });
    return true;
  } catch (err) {
    error(errorMessage || `Command failed: ${command}`);
    return false;
  }
}

// Clean dist directory
function cleanDist() {
  info('Cleaning dist directory...');
  if (fs.existsSync(CONFIG.distDir)) {
    fs.rmSync(CONFIG.distDir, { recursive: true, force: true });
    success('dist directory cleaned');
  } else {
    info('dist directory does not exist, no cleanup needed');
  }
}

// Build backend
function buildBackend() {
  info('Starting backend build...');
  const result = runCommand(
    'pnpm build',
    CONFIG.backendDir,
    'Backend build failed'
  );
  if (result) {
    success('Backend build completed');
  }
  return result;
}

// Build frontend
function buildFrontend() {
  info('Starting frontend build...');
  const result = runCommand(
    'pnpm build',
    CONFIG.frontendDir,
    'Frontend build failed'
  );
  if (result) {
    success('Frontend build completed');
  }
  return result;
}

// Move frontend build files
function moveFrontendBuild() {
  info('Moving frontend build files to dist/frontend...');
  
  // Check if frontend build output directory exists
  if (!fs.existsSync(CONFIG.frontendBuildOutputDir)) {
    error(`Frontend build output directory does not exist: ${CONFIG.frontendBuildOutputDir}`);
    return false;
  }

  // Create dist/frontend directory
  if (!fs.existsSync(CONFIG.distDir)) {
    fs.mkdirSync(CONFIG.distDir, { recursive: true });
  }
  
  if (fs.existsSync(CONFIG.frontendDistDir)) {
    fs.rmSync(CONFIG.frontendDistDir, { recursive: true, force: true });
  }

  // Move files
  fs.renameSync(CONFIG.frontendBuildOutputDir, CONFIG.frontendDistDir);
  success('Frontend build files moved to dist/frontend');
  
  return true;
}

// Main function
function main() {
  log('========================================', 'cyan');
  log('Schema Project Packaging Script', 'cyan');
  log('========================================', 'cyan');
  
  // Check working directory
  if (!fs.existsSync(path.join(__dirname, 'package.json'))) {
    error('Please run this script from the project root directory');
  }

  // 1. Clean dist directory
  cleanDist();
  
  // 2. Build backend
  if (!buildBackend()) {
    error('Backend build failed, terminating packaging');
  }
  
  // 3. Build frontend
  if (!buildFrontend()) {
    error('Frontend build failed, terminating packaging');
  }
  
  // 4. Move frontend build files
  if (!moveFrontendBuild()) {
    error('Failed to move frontend build files');
  }
  
  log('========================================', 'cyan');
  success('Packaging complete!');
  log('========================================', 'cyan');
  log('Output directories:', 'yellow');
  log(`  - Backend: ${path.join(CONFIG.distDir, 'main.js')}`, 'yellow');
  log(`  - Frontend: ${CONFIG.frontendDistDir}`, 'yellow');
  log('========================================', 'cyan');
}

// Run main function
main();
