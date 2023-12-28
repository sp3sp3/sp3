import { server } from "../index";
import { Experiment, PrismaClient } from "@prisma/client";
import { resetDB, runSeedForTests } from "../../prisma/seed";
import {
  test,
  afterEach,
  beforeEach,
  describe,
  expect,
  afterAll,
} from "@jest/globals";
import { CreateExperimentHandlerRequest } from "../routes/experiments";
import supertest from "supertest";

export type SupertestResponse<T> = Omit<Response, "body"> & { body: T };
const prisma = new PrismaClient();

describe("experiments routes", () => {
  beforeEach(async () => {
    await resetDB();
    await runSeedForTests();
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  afterAll(() => {
    server.close();
  });

  describe("POST /experiments", () => {
    test("creates a new experiment", async () => {
      const payload: CreateExperimentHandlerRequest = {
        name: "test experiment",
        parentId: "1",
      };
      const result = await supertest(server).post("/experiments").send(payload);
      const expectedResult = {
        name: "test experiment",
        parentId: 1,
      };

      expect(result.body).toStrictEqual(expectedResult);
    });
  });
});
