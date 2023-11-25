import { PrismaClient } from ".prisma/client";
import {
  it,
  afterEach,
  beforeEach,
  describe,
  expect,
  afterAll,
} from "@jest/globals";
import { resetDB, runSeedForTests } from "../../prisma/seed";
import supertest from "supertest";
import { server } from "../index";

const prisma = new PrismaClient();
describe("projects handlers", () => {
  beforeEach(async () => {
    await runSeedForTests();
  });

  afterEach(async () => {
    await resetDB();
    await prisma.$disconnect();
  });

  afterAll(() => {
    server.close();
  });

  describe("projects routes", () => {
    // Here is how the handlers could be tested
    // mocks the json function and checks that it is called with
    // the correct response
    // it("getProjectsHandler returns all projects in the DB", async () => {
    //   const req = {} as Request;
    //   const res = { json: jest.fn().mockReturnThis() } as unknown as Response;
    //   await getProjectsHandler(req, res);
    //
    //   const expectedResult = {
    //     projects: [
    //       { id: 1, name: "EGFR inhibitors", parentId: null },
    //       { id: 2, name: "Pyridine synthesis", parentId: null },
    //       { id: 3, name: "synthesis of XYZ", parentId: 1 },
    //       { id: 4, name: "synthesis of step 1 - bromination", parentId: 3 },
    //       { id: 5, name: "screening catalysts", parentId: 4 },
    //     ],
    //   };
    //
    //   expect(res.json).toHaveBeenCalledWith(expectedResult);
    // });

    test("GET /projects", async () => {
      const result = await supertest(server).get("/projects");
      const expectedResult = {
        projects: [
          { id: 1, name: "EGFR inhibitors", parentId: null },
          { id: 2, name: "Pyridine synthesis", parentId: null },
          { id: 3, name: "synthesis of XYZ", parentId: 1 },
          { id: 4, name: "synthesis of step 1 - bromination", parentId: 3 },
          { id: 5, name: "screening catalysts", parentId: 4 },
        ],
      };

      expect(result.statusCode).toEqual(200);
      expect(result.body).toStrictEqual(expectedResult);
    });
  });
});
