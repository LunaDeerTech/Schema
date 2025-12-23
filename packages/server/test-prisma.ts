import { PrismaService } from './src/prisma/prisma.service';

async function test() {
  const prisma = new PrismaService();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log(`User count: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

test();