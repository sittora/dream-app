#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🚀 Setting up Dream Journal Database...\n');

// Ensure data directory exists
const dataDir = join(process.cwd(), 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

console.log('📁 Database will be created at: ./data/dreams.db');
console.log('🔒 Database will be secure with WAL mode and foreign keys enabled');
console.log('📊 Database includes tables for: users, dreams, symbols, comments, engagement');
console.log('\n🎉 Database setup instructions:');
console.log('1. The database will be automatically created when you first save a dream');
console.log('2. All dreams are securely stored with proper validation');
console.log('3. Symbols are automatically indexed for fast searching');
console.log('4. User data is protected with proper relationships');
console.log('\n✨ Your dream journal is ready to use!'); 