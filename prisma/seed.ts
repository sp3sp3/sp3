import { PrismaClient } from "@prisma/client";
import { resizeFile } from "../server/routes/projects";
import path from "path";

const prisma = new PrismaClient();
const seedProjects = async () => {
  let projects = [
    {
      name: "EGFR inhibitors",
      id: 1,
    },
    { name: "Pyridine synthesis", id: 2 },
    // seed sub projects
    {
      name: "synthesis of XYZ-1",
      parentId: 1,
      id: 3,
      image: await resizeFile(
        path.resolve(__dirname, "../server/tests/Gefitinib_structure.png"),
      ),
    },
    {
      name: "synthesis of XYZ-2",
      parentId: 1,
      id: 6,
      image: await resizeFile(
        path.resolve(__dirname, "../server/tests/gefitinib_analog.png"),
      ),
    },
    { name: "Pd catalysts", parentId: 2, id: 8 },
    // sub sub project
    { name: "synthesis of step 1 - bromination", parentId: 3, id: 4 },
    { name: "synthesis of step 2 - amide coupling", parentId: 3, id: 5 },
    { name: "screening catalysts", parentId: 4, id: 7 },
    { name: "screening ligands", parentId: 8, id: 9 },
  ];

  for (const p of projects) {
    await prisma.project.create({
      data: p,
    });
  }
};

const seedForTests = async () => {
  await seedProjects();
};

export const resetDB = async () => {
  const tablenames = await prisma.$queryRaw<
    Array<{ name: string }>
  >`SELECT name FROM sqlite_schema WHERE type='table'`;

  for (const { name } of tablenames) {
    if (name !== "_prisma_migrations") {
      try {
        await prisma.$executeRawUnsafe(`DELETE FROM ${name}`);
      } catch (error) {
        console.log(error);
      }
    }
  }
};

export const runSeedForTests = async () => {
  return seedForTests()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
};
