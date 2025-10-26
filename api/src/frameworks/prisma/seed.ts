// api/src/frameworks/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

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

  // ログイン用のアカウントデータを作成
  console.log('🔐 アカウントデータを作成中...');

  // 管理者用アカウント
  const adminPerson = await prisma.person.create({
    data: {
      name: '管理者',
      organizationId: org.id,
    },
  });

  const adminPrincipal = await prisma.principal.create({
    data: {
      personId: adminPerson.id,
      kind: 'ADMIN',
    },
  });

  const adminPasswordHash = await argon2.hash('admin123');
  await prisma.account.create({
    data: {
      principalId: adminPrincipal.id,
      username: 'admin',
      password: adminPasswordHash,
      email: 'admin@example.com',
      isActive: true,
    },
  });

  // 教師用アカウント
  const teacherPerson = await prisma.person.create({
    data: {
      name: '山田花子',
      organizationId: org.id,
      facilities: {
        connect: { id: facility.id },
      },
    },
  });

  const teacherPrincipal = await prisma.principal.create({
    data: {
      personId: teacherPerson.id,
      kind: 'TEACHER',
    },
  });

  const teacherPasswordHash = await argon2.hash('teacher123');
  await prisma.account.create({
    data: {
      principalId: teacherPrincipal.id,
      username: 'teacher',
      password: teacherPasswordHash,
      email: 'yamada@example.com',
      isActive: true,
    },
  });

  // 学生用アカウント
  const studentPerson = await prisma.person.create({
    data: {
      name: '佐藤次郎',
      organizationId: org.id,
      facilities: {
        connect: { id: facility.id },
      },
    },
  });

  const studentPrincipal = await prisma.principal.create({
    data: {
      personId: studentPerson.id,
      kind: 'STUDENT',
    },
  });

  const studentPasswordHash = await argon2.hash('student123');
  await prisma.account.create({
    data: {
      principalId: studentPrincipal.id,
      username: 'student',
      password: studentPasswordHash,
      email: 'sato@example.com',
      isActive: true,
    },
  });

  console.log('✅ seed 完了');
  console.log('🔐 作成されたアカウント:');
  console.log('  管理者: username=admin, password=admin123');
  console.log('  教師: username=teacher, password=teacher123');
  console.log('  学生: username=student, password=student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect().catch((e) => console.error(e));
  });
