/**
 * list-client-pins.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Run this script to see all clients and their gallery PINs stored in the DB.
 * This is for studio owner reference / safety only.
 *
 * Usage:
 *   node list-client-pins.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const studios = await prisma.studio.findMany({
    include: {
      clients: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          pin: true,
          uniqueLink: true,
          status: true,
          eventDate: true,
        }
      }
    }
  });

  if (studios.length === 0) {
    console.log('\n  ⚠  No studios found. Run: npx prisma db seed\n');
    return;
  }

  for (const studio of studios) {
    console.log('\n' + '═'.repeat(60));
    console.log(`  Studio : ${studio.name}`);
    console.log(`  Email  : ${studio.email}`);
    console.log('═'.repeat(60));

    if (studio.clients.length === 0) {
      console.log('  (No clients yet)');
      continue;
    }

    for (const client of studio.clients) {
      console.log(`\n  Client  : ${client.name}`);
      console.log(`  Phone   : ${client.phone}`);
      console.log(`  Event   : ${new Date(client.eventDate).toLocaleDateString('en-IN')}`);
      console.log(`  Status  : ${client.status}`);
      console.log(`  Gallery : /gallery/${client.uniqueLink}`);
      console.log(`  ┌─────────────────────┐`);
      console.log(`  │  Gallery PIN: ${client.pin}   │`);
      console.log(`  └─────────────────────┘`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('  ✓ Keep this information private and share PINs securely.');
  console.log('═'.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
