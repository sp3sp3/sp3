import { server } from "../index";
import { resetDB, runSeedForTests } from "../../prisma/seed";
import {
  test,
  afterEach,
  beforeEach,
  describe,
  expect,
  afterAll,
} from "@jest/globals";
import { PrismaClient } from "@prisma/client";

import supertest from "supertest";
import { AddReagentHandlerRequest } from "../routes/reagents";

export type SupertestResponse<T> = Omit<Response, "body"> & { body: T };
const prisma = new PrismaClient();

describe("reagents routes", () => {
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

  describe("POST /addReagent", () => {
    test("adds a new reagent to the DB", async () => {
      const payload: AddReagentHandlerRequest = {
        reagentName: "2,2'-Bipyridine",
        canonicalSMILES: "C1=CC=NC(=C1)C2=CC=CC=N2",
      };

      const result = await supertest(server)
        .post("/reagents/addReagent")
        .send(payload);

      const expectedResult = {
        reagent: {
          id: 3,
          name: "2,2'-Bipyridine",
          canonicalSMILES: "c1ccc(-c2ccccn2)nc1",
        },
      };

      expect(result.body).toStrictEqual(expectedResult);
    });

    test("throws error if the reagent (name) is already in the DB", async () => {
      const payload: AddReagentHandlerRequest = {
        reagentName: "ethanol",
      };

      const result = await supertest(server)
        .post("/reagents/addReagent")
        .send(payload)
        .expect(400);

      expect(result.text).toStrictEqual("Reagent ethanol already stored");
    });

    test("throws error if the reagent (SMILES) is already in the DB", async () => {
      const payload: AddReagentHandlerRequest = {
        canonicalSMILES: "CCO",
      };

      const result = await supertest(server)
        .post("/reagents/addReagent")
        .send(payload);

      expect(result.text).toStrictEqual("Reagent CCO already stored");
    });
  });

  describe("GET /", () => {
    test("gets a reagent if provided a name", async () => {
      const result = await supertest(server).get("/reagents?name=ethanol");

      const expectedResult = {
        reagent: {
          id: 1,
          name: "ethanol",
          canonicalSMILES: "CCO",
        },
      };

      expect(result.body).toStrictEqual(expectedResult);
    });

    test("gets a reagent if provided a RDKit canonical smiles", async () => {
      const result = await supertest(server).get("/reagents?smiles=CCO");

      const expectedResult = {
        reagent: {
          id: 1,
          name: "ethanol",
          canonicalSMILES: "CCO",
        },
      };

      expect(result.body).toStrictEqual(expectedResult);
    });

    test("gets a reagent if provided non RDKit canonical smiles", async () => {
      const result = await supertest(server).get("/reagents?smiles=OCC");

      const expectedResult = {
        reagent: {
          id: 1,
          name: "ethanol",
          canonicalSMILES: "CCO",
        },
      };

      expect(result.body).toStrictEqual(expectedResult);
    });

    test("throws error if invalid smiles", async () => {
      const result = await supertest(server).get("/reagents?smiles=ABC");

      expect(result.text).toStrictEqual("ABC is an invalid SMILES");
    });

    test("returns null if no matching SMILES found", async () => {
      const result = await supertest(server).get("/reagents?smiles=C");
      expect(result.body).toStrictEqual({ reagent: null });
    });

    test("returns null if no matching name found", async () => {
      const result = await supertest(server).get(
        "/reagents?name=I am not here",
      );
      expect(result.body).toStrictEqual({ reagent: null });
    });
  });

  describe("GET /getSimilarReagentsByName", () => {
    test("finds reagent with partial match", async () => {
      const result = await supertest(server).get(
        "/reagents/getSimilarReagentsByName?name=e",
      );

      const expectedResult = {
        reagents: [
          {
            id: 1,
            name: "ethanol",
            canonicalSMILES: "CCO",
          },
        ],
      };

      expect(result.body).toStrictEqual(expectedResult);
    });

    test("returns empty array if no matches", async () => {
      const result = await supertest(server).get(
        "/reagents/getSimilarReagentsByName?name=nomatch",
      );

      expect(result.body).toStrictEqual({ reagents: [] });
    });
  });
});
