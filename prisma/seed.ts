import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedProjects = async () => {
  await prisma.project.create({
    data: {
      name: 'IspH inhibitors',
    },
  });
};

export const seedDb = async () => {
  await seedProjects();
};

seedDb()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
