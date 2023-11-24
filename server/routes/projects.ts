import { PrismaClient, Project } from "@prisma/client";
import { Send } from "express-serve-static-core";
import { Router, Response, Request } from "express";

export const projectRoutes = Router();

const prisma = new PrismaClient();

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface TypedResponse<T> extends Response {
  json: Send<T, this>;
}

projectRoutes.get(
  "/",
  async (
    _: TypedRequestBody<{}>,
    res: TypedResponse<{ projects: Project[] }>,
  ) => {
    const projects = await prisma.project.findMany({});
    res.json({ projects: projects });
  },
);

projectRoutes.get(
  "/:id",
  async (
    req: TypedRequestBody<{ id: string }>,
    res: TypedResponse<{ project: Project }>,
  ) => {
    const project = await prisma.project.findUnique({
      where: { id: Number(req.body.id) },
    });

    if (!project) {
      res.status(404).send(`Project id=${req.body.id} not found`);
    } else {
      res.json({ project: project });
    }
  },
);

projectRoutes.post(
  "/",
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
    res.json({ project: project });
  },
);
