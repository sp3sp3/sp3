import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seedProjects = async () => {
  const projects = [
    {
      name: "EGFR inhibitors",
    },
    { name: "Pyridine synthesis" },
  ];

  for (const p of projects) {
    await prisma.project.create({
      data: p,
    });
  }
};

async function main() {
  await seedProjects();
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
