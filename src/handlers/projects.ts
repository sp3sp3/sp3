import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getProjects = async () => {
  const projects = await prisma.project.findMany({});

  return projects;
};
