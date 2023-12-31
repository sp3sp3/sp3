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
import {
  AddReagentHandlerRequest,
  AssignReagentToExperimentHandlerRequest,
  CreateExperimentHandlerRequest,
} from "../routes/experiments";
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
        experiment: {
          id: 2,
          name: "test experiment",
          parentId: 1,
        },
      };

      expect(result.body).toStrictEqual(expectedResult);
    });
  });

  describe("POST /addReagent", () => {
    test("adds a new reagent to the DB", async () => {
      const payload: AddReagentHandlerRequest = {
        reagentName: "2,2'-Bipyridine",
        canonicalSMILES: "C1=CC=NC(=C1)C2=CC=CC=N2",
      };

      const result = await supertest(server)
        .post("/experiments/addReagent")
        .send(payload);

      const expectedResult = {
        reagent: {
          id: 2,
          name: "2,2'-Bipyridine",
          canonicalSMILES: "c1ccc(-c2ccccn2)nc1",
        },
      };

      expect(result.body).toStrictEqual(expectedResult);
    });

    test("throws error if the reagent is already in the DB", async () => {});
  });

  describe("POST /assignReagentToExperiment", () => {
    test("assigns a reagent to experiment", async () => {
      const payload: AssignReagentToExperimentHandlerRequest = {
        experimentId: "1",
        reagentId: "1",
        reactionSchemeLocation: "LEFT_SIDE",
        equivalents: 1,
      };

      const result = await supertest(server)
        .post("/experiments/assignReagentToExperiment")
        .send(payload);

      const expectedResult = {
        experiment: {
          id: 1,
          name: "01012024-suzuki coupling",
          parentId: 4,
          reagents: [
            {
              id: 1,
              reagentId: 1,
              reactionSchemeLocation: "LEFT_SIDE",
              experimentId: 1,
              equivalents: 1,
            },
          ],
        },
      };

      expect(result.body).toStrictEqual(expectedResult);
    });

    test("throws error if reagent not in DB", async () => {
      const payload: AssignReagentToExperimentHandlerRequest = {
        experimentId: "1",
        reagentId: "100",
        reactionSchemeLocation: "LEFT_SIDE",
        equivalents: 1,
      };

      await supertest(server)
        .post("/experiments/assignReagentToExperiment")
        .send(payload)
        .expect(404);
    });
  });
});
