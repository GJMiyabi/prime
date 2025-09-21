// api/src/frameworks/prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.create({
    data: {
      name: 'サンプル組織',
      IDNumber: 'ORG-001',
    },
  });

  const facility = await prisma.facility.create({
    data: {
      name: '第一施設',
      IDNumber: 'FAC-001',
      organizationId: org.id,
    },
  });

  const person = await prisma.person.create({
    data: {
      name: '田中太郎',
      organizationId: org.id,
      facilities: {
        connect: { id: facility.id },
      },
    },
  });

  await prisma.contactAddress.create({
    data: {
      type: 'EMAIL',
      value: 'tanaka@example.com',
      personId: person.id,
      organizationId: org.id,
      facilityId: facility.id,
    },
  });

  console.log('✅ seed 完了');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch((e) => console.error(e));
  });
