const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean database
  await prisma.photo.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.studio.deleteMany({});

  const passwordHash = await bcrypt.hash('test1234', 10);

  const studio = await prisma.studio.create({
    data: {
      name: 'Signature Weddings',
      email: 'test@studio.com',
      passwordHash: passwordHash,
    },
  });

  const client = await prisma.client.create({
    data: {
      studioId: studio.id,
      name: 'Ramesh & Priya',
      eventDate: new Date('2026-11-20T00:00:00Z'),
      phone: '+15550199',
      uniqueLink: 'ramesh-priya-wedding',
      pin: '1234',
      status: 'PENDING',
    },
  });

  console.log('\n' + '═'.repeat(50));
  console.log('  ✓ Database seeded successfully!');
  console.log('═'.repeat(50));
  console.log(`  Studio Email : ${studio.email}`);
  console.log(`  Password     : test1234`);
  console.log(`  Client       : ${client.name}`);
  console.log(`  Gallery URL  : /gallery/${client.uniqueLink}`);
  console.log(`  Gallery PIN  : ${client.pin}   ← share this with client`);
  console.log('═'.repeat(50) + '\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
