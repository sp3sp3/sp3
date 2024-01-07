import { Prisma, PrismaClient } from "@prisma/client";
import { resizeFile } from "../server/routes/projects";
import path from "path";

const prisma = new PrismaClient();

// some global variables so that they can be used to link up different data
// in different functions
let EGFR2ID: number;
const seedProjects = async () => {
  //
  // first project path
  //
  // level 0
  const egfr0 = await prisma.project.create({
    data: { name: "EGFR inhibitors" },
  });
  // level 1
  const egfr1 = await prisma.project.create({
    data: {
      name: "synthesis of XYZ-1",
      parentId: egfr0.id,
      image: await resizeFile(
        path.resolve(__dirname, "../server/tests/Gefitinib_structure.png"),
      ),
    },
  });
  await prisma.project.create({
    data: {
      name: "synthesis of XYZ-2",
      parentId: egfr0.id,
      image: await resizeFile(
        path.resolve(__dirname, "../server/tests/gefitinib_analog.png"),
      ),
    },
  });
  // level 2
  const egfr2 = await prisma.project.create({
    data: { name: "step 1 - aryl coupling", parentId: egfr1.id },
  });
  // save this for use in other functions
  EGFR2ID = egfr2.id;
  await prisma.project.create({
    data: { name: "step 2 - amide coupling", parentId: egfr1.id },
  });
  // level 3
  await prisma.project.create({
    data: { name: "screening catalysts", parentId: egfr2.id },
  });

  //
  // second project path
  //
  // level 0
  const abcd0 = await prisma.project.create({
    data: { name: "ABCD inhibitors" },
  });
  // level 1
  await prisma.project.create({
    data: {
      name: "step 1 - ether synthesis",
      parentId: abcd0.id,
      image: await resizeFile(
        path.resolve(__dirname, "../server/tests/ether_synthesis.png"),
      ),
    },
  });
  const abcd1 = await prisma.project.create({
    data: {
      name: "step 2 - amide coupling",
      parentId: abcd0.id,
      image: await resizeFile(
        path.resolve(__dirname, "../server/tests/amide.png"),
      ),
    },
  });
  // level 2
  await prisma.project.create({
    data: {
      name: "phenyl analogs",
      parentId: abcd1.id,
    },
  });
  await prisma.project.create({
    data: {
      name: "pyridine analogs",
      parentId: abcd1.id,
    },
  });
};

const seedExperiments = async () => {
  await prisma.project.findFirst({ where: { name: "step 1 - aryl coupling" } });
  await prisma.experiment.create({
    data: {
      parentId: EGFR2ID,
      name: "01012024-suzuki coupling",
    },
  });
};

const seedReagents = async () => {
  await prisma.$queryRaw`
        INSERT INTO "Reagent"
        (name, "canonicalSMILES", "molecularWeight", density)
        VALUES
        ('ethanol', 'CCO', 46.07, 0.79),
        ('butane', 'CCCC', 58.12, 0.6)
`;
};

const seedAssignReagentToExperiments = async () => {
  await prisma.experimentReagent.createMany({
    data: [
      {
        reagentId: 2,
        experimentId: 1,
        reactionSchemeLocation: "ABOVE_ARROW",
        equivalents: 1,
      },
    ],
  });
};

const seedForTests = async () => {
  await seedProjects();
  await seedExperiments();
  await seedReagents();
  await seedAssignReagentToExperiments();
};

export const resetDB = async () => {
  // Special fast path to drop data from a postgres database.
  // This is an optimization which is particularly crucial in a unit testing context.
  // This code path takes milliseconds, vs ~7 seconds for a migrate reset + db push
  const tablenames = await prisma.$queryRaw<
    { tablename: string }[]
  >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;
  for (const { tablename } of tablenames) {
    if (tablename !== "_prisma_migrations") {
      await prisma.$queryRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
    }
  }
  const relnames = await prisma.$queryRaw<
    { relname: string }[]
  >`SELECT c.relname FROM pg_class AS c JOIN pg_namespace AS n ON c.relnamespace = n.oid WHERE c.relkind='S' AND n.nspname='public';`;

  for (const { relname } of relnames) {
    await prisma.$queryRawUnsafe(`ALTER SEQUENCE "${relname}" RESTART WITH 1;`);
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
