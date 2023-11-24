import { PrismaClient, Project } from "@prisma/client";
import express from "express";
import { Send } from "express-serve-static-core";

const app = express();
const port = process.env.PORT || 3000;

const prisma = new PrismaClient();

export interface TypedRequestBody<T> extends Express.Request {
  body: T;
}

export interface TypedResponse<ResBody> extends Express.Response {
  json: Send<ResBody, this>;
}

app.get("/projects", async (_, res: TypedResponse<{ projects: Project[] }>) => {
  const projects = await prisma.project.findMany({});
  res.json({ projects: projects });
});

app.post(
  "/projects",
  async (
    req: TypedRequestBody<{ name: string }>,
    res: TypedResponse<{ project: Project }>,
  ) => {
    const { name } = req.body;

    const project = await prisma.project.create({
      data: {
        name: name,
      },
    });
    console.log(res);
    res.json({ project: project });
  },
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
