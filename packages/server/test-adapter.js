const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

async function test() {
  try {
    console.log('Creating adapter...');
    const adapter = new PrismaBetterSqlite3({ url: './prisma/dev.db' });
    
    console.log('Creating PrismaClient with adapter...');
    const prisma = new PrismaClient({ adapter });
    
    console.log('✅ PrismaClient created successfully');
    
    // Test a simple query
    console.log('Testing query...');
    const userCount = await prisma.user.count();
    console.log('✅ User count:', userCount);
    
    await prisma.$disconnect();
    console.log('✅ Test completed successfully');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

test();

test();