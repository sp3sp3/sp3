import { PrismaClient, Project } from "@prisma/client";
import { Router } from "express";
import { TypedRequestBody, TypedResponse } from "../types";

export const projectRoutes = Router();

const prisma = new PrismaClient();

export const getProjectsHandler = async (
  _: TypedRequestBody<{}>,
  res: TypedResponse<{ projects: Project[] }>,
) => {
  const projects = await prisma.project.findMany({});
  res.json({ projects: projects });
};

export const getProjectByIdHandler = async (
  req: TypedRequestBody<{ id: string }>,
  res: TypedResponse<{ project: Project }>,
) => {
  const project = await prisma.project.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!project) {
    res.status(404).send(`Project id=${req.params.id} not found`);
  } else {
    res.json({ project: project });
  }
};

export interface CreateProjectHandlerRequest {
  name: string;
  parentId?: string;
}

export const createProjectHandler = async (
  req: TypedRequestBody<CreateProjectHandlerRequest>,
  res: TypedResponse<{ project: Project }>,
) => {
  const { name, parentId } = req.body;

  const project = await prisma.project.create({
    data: {
      name: name,
      parentId: parentId ? Number(parentId) : null,
    },
  });
  res.json({ project: project });
};

projectRoutes.get("/", getProjectsHandler);
projectRoutes.get("/:id", getProjectByIdHandler);
projectRoutes.post("/", createProjectHandler);
