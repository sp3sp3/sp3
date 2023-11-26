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
      expect(result.body.projects).toHaveLength(5);
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
        const payload: CreateProjectHandlerRequest = {
          name: "test add image",
          base64image:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAAAnCAYAAADpYmEPAAAAAXNSR0IArs4c6QAABz5JREFUeF7tnHdoVE8Qxyd2EXuPhaBBMWIDUTGWf0TUWJGoWGJEUbEhioj+EY1gxy6iwRJDYgex16io2LB3BfUPC1gQoygR0fz4zM93JjEmd/f2zou3A2G593ZnZ2e/b3Z2djYROTk5OWLJasCQBiIsoAxp0rJRDVhAWSAY1YAFlFF1WmYWUBYDHg2cOnVKlixZIqVKlZLs7GypXLmyLF26VBo1aiQrV66UDx8+yNy5cz3127ZtK3v27JGoqCjPM78BBaNNmzZJhw4dZM6cOXZairkGHj16JP3795fTp09LnTp1dDSZmZkyceJEuXfvnqxZsyYwgLp+/bokJyfLixcvZNy4cXL+/Hm5cOGCInf48OHFXK2hL35qaqoKmZiYaFTY5cuXy8ePH/NYIDro1KmTWifmee3atRIdHe3p9+LFi3Lr1i3/LBTmDiAxICzS1KlTPYxPnDihglSoUEHLjh07Gh2sZSZy7tw51e27d+8kIiJCqlevrr87d+5sRD2LFy+Wz58/y7x58/LwYy4B0tmzZ81ZKMwdwg8bNkzLatWqaaf79u2TGzduKMAY5IYNG/R9v379tHRMp5ERhymTly9fqi6PHDmi5ZgxY1QTGzdu1N89e/bUsl69eq409PjxY+nVq5ecOXNG6tevr7xOnjwp06ZNk5s3b8rq1avdA+rQoUNqlWrVqqVC44TlpmfPnulz5+tJSEiQL1++aBtQzbsZM2a4Gmg4N164cKHqkknloy1btqyqY8uWLTJq1Cj5+vWrvme54v2sWbN8UhcxbdrjutStW1d9pvnz50vp0qXl+/fvUrVqVVm2bJk0bNjQnVP+4MED7ej27dsq6ODBgwsVFCRTv1y5clqfdffu3bsKKJw9yoEDB/o02HCuvGvXLtVZixYttGzWrJlHHVgQnpUoUUJ13bVrV8k9X7wbNGhQkepLS0vTOWOu4MNOzgTl2eW5RXxKSooK2bt3bxUyMjJS9u/frwpo0KCBlm3atDEh9z/J4+rVq6qj169faxkXF/fHcbLDRtfdu3dXXaNfVhTa1a5du8AVBWY417QjLEC7bt26GdWlB1Cs1SxpgMHNmoygtF+1apWWM2fOVIHZKTCABQsW6FbU0i8NvH//XnWVkZGh5eTJk71Sz7dv37Q+sSLK2bNna7uCfN5Xr14pkA4ePKjzMHbsWK/68LWSB1BYEgTDHzJBxC4YwP3793UA8fHxsn79eg0xYG5DiWJiYqRVq1YyevRo419sUeN0PryRI0cqKKpUqVJUk9/eP3z4UHWN84yuhwwZ4nGgt27dqjtB3JIpU6bo+/Lly/vch7cN8gAKM8rOjYFhqfI74d4yzV3vwIED8uTJEw0zpKeny/Hjx0MOUOxucEjZqZYpU0b69OkjQ4cOLXTJ8UcXBbXB4d29e7e0b9/eNcvDhw8rsGrUqKHAadeunVy+fFl3b2z7mzdv7rqPohgUCCgEwOyyJTVJoQoodqaEQvAhHSKm9uPHD+nRo4eMGDFC+vbtKyVLljSpDuWFtSDG9/z5c/WdYmNjXffBDnvRokX6IUMcoeCKBIMsoH5qma0z23H8kvzEMkTQDweW0AhxNlPLhgOo7du3qxXZvHmzkXnPyspSIPGRWEAVoFKWBfyxQBFhjmPHjsmnT58K7YLYDBaladOmsnPnTmnZsqUrkRxAbdu2Tf1XU4ByhLKA+sP0BBpQnEnhuBYGKAJ+/BFva9y4sWBVKN1QoCyUBZSbWTHQlg3ItWvX8nDCZ8JJB0BdunRRJ50S62SKLKBcaDJUnXLiYlgbljKONwAQh6Kkc5gGUH71WUD9g4DiaIPTe2JBgQaQBZQLAOVvGqoWyuAQfWZlLZTPKvvVwALqd+VZQFlAudBAmAIq3I5ejCLER2b/tIUK18NhHzFgtHqgALVjxw49JP5rgc1gpa+QEThp0iSjk1KcmTmAIubF2SFxLzd05coVPSAm9xxQkZP2V45eGIRNsHMzlf615XyQUEVSUpJ/DH62AkAACRCRaeB8tFw64IyQU4BgUIH38mwKcDBU/38fXA4ACGRrAgTSZnylFStWaMoR+VyUlSpVEs4G4csJAHybNGniK1u/6hd60dNeUvBLp341Onr0qAKAzAYAwAXaoojcNdqQUwWQWrduLZcuXdJnRP3hQ/pNMMmrm8P2GlXwpmTdunUKDjJcKWvWrPlb53fu3FHQYN0ADRdA3r59q/U5RKecMGFC8ITO1ZNXgKK+vegZvPkh4wHAcOkDwEyfPt3TOWm+zk0V54oaV52oT5449StWrBg8YfP15DWgnHa5r6KPHz9ec3jsVfTAzB8pNQDl6dOnCpQBAwZoR2R2crNl7969+p4rULwnL/5vk8+AcgS2/ywjeFMHcFjGyL2ihChJ8aV0gBY8if7ck9+ACgXhw00GljYnvEA4IPdSGCq6sIAKlZnwUo43b95oTf49QCiSBVQozkoxlskCqhhPXiiK/h/T9IHXJWl54gAAAABJRU5ErkJggg==",
        };

        const result = await supertest(server).post("/projects").send(payload);

        const expectedResult = {
          project: {
            id: expect.any(Number),
            name: "test add image",
            parentId: null,
            base64image:
              "data:image/png;base64,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",
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
