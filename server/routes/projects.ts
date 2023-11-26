import { Prisma, PrismaClient, Project } from "@prisma/client";
import { Router } from "express";
import { TypedRequestBody, TypedResponse } from "../types";

export const projectRoutes = Router();

const prisma = new PrismaClient();

export interface GetProjectsHandlerResponse {
  projects: Project[];
}

export const getProjectsHandler = async (
  _: TypedRequestBody<{}>,
  res: TypedResponse<GetProjectsHandlerResponse>,
) => {
  const projects = await prisma.project.findMany({});
  res.json({ projects: projects });
};

export interface GetProjectByIdHandlerRequest {
  id: string;
}

export interface GetProjectByIdHandlerResponse {
  project: Project;
}

export const getProjectByIdHandler = async (
  req: TypedRequestBody<GetProjectByIdHandlerRequest>,
  res: TypedResponse<GetProjectByIdHandlerResponse>,
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
  base64image?: string;
}

export interface CreateProjectHandlerResponse {
  project: Project;
}

export const createProjectHandler = async (
  req: TypedRequestBody<CreateProjectHandlerRequest>,
  res: TypedResponse<CreateProjectHandlerResponse>,
) => {
  const { name, parentId, base64image } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name: name,
        parentId: parentId ? Number(parentId) : null,
        base64image: base64image ? base64image : null,
      },
    });
    res.json({ project: project });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.status(400).send(`Invalid request: ${e.message}`);
    }
  }
};

projectRoutes.get("/", getProjectsHandler);
projectRoutes.get("/:id", getProjectByIdHandler);
projectRoutes.post("/", createProjectHandler);
