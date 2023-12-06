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
import { Response } from "superagent";
import { Project } from "@prisma/client";
import path from "path";

export type SupertestResponse<T> = Omit<Response, "body"> & { body: T };

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
      const result: SupertestResponse<{ projects: Project[] }> =
        await supertest(server).get("/projects");
      expect(result.statusCode).toEqual(200);
      expect(result.body.projects).toHaveLength(9);
      expect(result.body.projects[0]).toHaveProperty("name");
      expect(result.body.projects[0]).toHaveProperty("parentId");
      expect(result.body.projects[0]).toHaveProperty("base64image");
    });

    describe("GET /:id", () => {
      test("returns a project", async () => {
        const result = await supertest(server).get("/projects/1");

        const expectedResult = {
          project: {
            id: 1,
            name: "EGFR inhibitors",
            parentId: null,
            base64image: null,
          },
        };

        expect(result.statusCode).toEqual(200);
        expect(result.body).toStrictEqual(expectedResult);
      });

      test("returns 404 if project cannot be found", async () => {
        await supertest(server).get("/projects/10000").expect(404);
      });
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
            base64image: null,
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
            base64image: null,
          },
        };
        expect(result.body).toStrictEqual(expectedResult);
      });

      test("stores an image as base64 string", async () => {
        const result = await supertest(server)
          .post("/projects")
          .field("name", "test add image")
          .attach("projectImage", path.resolve(__dirname, "./rxn-scheme.png"));

        const expectedResult = {
          project: {
            id: expect.any(Number),
            name: "test add image",
            parentId: null,
            base64image: expect.any(String),
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
