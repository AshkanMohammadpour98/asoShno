// @ts-ignore
import { PrismaClient } from '@prisma/client';
// @ts-ignore
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcrypt';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting seed...");
  const adminPhone = '09302695785';
  const hashedPassword = await bcrypt.hash('ashkan780011', 10);

  if (!prisma.user) {
     console.error("Prisma User model is not available. Did you run 'prisma generate'?");
     return;
  }

  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {
      firstName: 'ashkan',
      lastName: 'admin',
      password: hashedPassword,
      role: 'ADMIN',
    },
    create: {
      firstName: 'ashkan',
      lastName: 'admin',
      phone: adminPhone,
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log({ admin });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
