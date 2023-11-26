import { test } from "@jest/globals";
import { createInnerTRPCContext } from "../trpc";
import { PrismaClient } from "@prisma/client";
import { AppRouter, appRouter } from "../index";
import { resetDB, runSeedForTests } from "../prisma/seed";
import { inferProcedureInput } from "@trpc/server";

const prisma = new PrismaClient();

describe("projects router", () => {
  beforeEach(async () => {
    await runSeedForTests();
  });

  afterEach(async () => {
    await resetDB();
    await prisma.$disconnect();
  });

  const caller = appRouter.createCaller(
    createInnerTRPCContext({ prisma: prisma }),
  );

  test("getProjects", async () => {
    const result = await caller.projects.getProjects();

    const expectedResult = [
      { id: 1, name: "EGFR inhibitors", parentId: null },
      { id: 2, name: "Pyridine synthesis", parentId: null },
      { id: 3, name: "synthesis of XYZ", parentId: 1 },
      { id: 4, name: "synthesis of step 1 - bromination", parentId: 3 },
      { id: 5, name: "screening catalysts", parentId: 4 },
    ];

    expect(result).toStrictEqual(expectedResult);
  });

  test("getProjectById", async () => {
    type Input = inferProcedureInput<AppRouter["projects"]["getProjectById"]>;

    const input: Input = {
      id: 1,
    };

    const result = await caller.projects.getProjectById(input);
    const expectedResult = {
      id: 1,
      name: "EGFR inhibitors",
      parentId: null,
    };
    expect(result).toStrictEqual(expectedResult);
  });
});
