import { PrismaClient } from ".prisma/client";
import {
  test,
  afterEach,
  beforeEach,
  describe,
  expect,
  afterAll,
} from "@jest/globals";
import { resetDB, runSeedForTests } from "../../prisma/seed";
import supertest from "supertest";
import { server } from "../index";
import { CreateProjectHandlerRequest } from "../routes/projects";

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

    test("GET /:id", async () => {
      const result = await supertest(server).get("/projects/1");

      const expectedResult = {
        project: {
          id: 1,
          name: "EGFR inhibitors",
          parentId: null,
        },
      };

      expect(result.statusCode).toEqual(200);
      expect(result.body).toStrictEqual(expectedResult);
    });

    describe("POST /", () => {
      test("creates a top level project", async () => {
        const payload: CreateProjectHandlerRequest = {
          name: "test top level project",
        };
        const result = await supertest(server).post("/projects").send(payload);

        const expectedResult = {
          project: {
            id: expect.any(Number),
            name: "test top level project",
            parentId: null,
          },
        };
        expect(result.body).toStrictEqual(expectedResult);
      });

      test("creates a child project", async () => {
        const payload: CreateProjectHandlerRequest = {
          name: "test child project",
          parentId: "1",
        };

        const result = await supertest(server).post("/projects").send(payload);

        const expectedResult = {
          project: {
            id: expect.any(Number),
            name: "test child project",
            parentId: 1,
          },
        };
        expect(result.body).toStrictEqual(expectedResult);
      });

      test("fails if name is not specified", async () => {
        await supertest(server).post("/projects").send({}).expect(400);
      });
    });
  });
});
