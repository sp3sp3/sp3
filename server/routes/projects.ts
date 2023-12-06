import { Prisma, PrismaClient, Project } from "@prisma/client";
import { Router } from "express";
import { TypedRequestBody, TypedResponse } from "../types";
import sharp from "sharp";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const projectRoutes = Router();

const prisma = new PrismaClient();

const project2ProjectWithDataBuffer = (project: Project) => {
  const { image, ...rest } = project;
  return {
    ...rest,
    base64image: image ? image.toString("base64") : null,
  };
};

export type ProjectWithDataBuffer = Omit<Project, "image"> & {
  base64image: string | null;
};

export interface GetProjectsHandlerResponse {
  projects: ProjectWithDataBuffer[];
}

export const getProjectsHandler = async (
  _: TypedRequestBody<{}>,
  res: TypedResponse<GetProjectsHandlerResponse>,
) => {
  const projects = await prisma.project.findMany({});
  const result = projects.map((i) => project2ProjectWithDataBuffer(i));
  res.json({ projects: result });
};

export interface GetProjectByIdHandlerRequest {
  id: string;
}

export interface GetProjectByIdHandlerResponse {
  project: ProjectWithDataBuffer;
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
    res.json({ project: project2ProjectWithDataBuffer(project) });
  }
};

export interface CreateProjectHandlerRequest {
  name: string;
  parentId?: string;
  file?: Express.Multer.File;
}

export interface CreateProjectHandlerResponse {
  project: ProjectWithDataBuffer;
}

export const createProjectHandler = async (
  req: TypedRequestBody<CreateProjectHandlerRequest>,
  res: TypedResponse<CreateProjectHandlerResponse>,
) => {
  const { name, parentId } = req.body;
  // multer middleware will handle req.file field. file in the body is
  // something else it seems, undefined
  const img = req.file;

  try {
    const project = await prisma.project.create({
      data: {
        name: name,
        parentId: parentId ? Number(parentId) : null,
        image: img ? await resizeFile(img.path) : null,
      },
    });
    res.json({ project: project2ProjectWithDataBuffer(project) });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.status(400).send(`Invalid request: ${e.message}`);
    }
  }
};

export const resizeFile = async (pathToImage: string) => {
  const buffer = await sharp(pathToImage)
    .resize(300, 300, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toBuffer();
  return buffer;
};

projectRoutes.get("/", getProjectsHandler);
projectRoutes.get("/:id", getProjectByIdHandler);
projectRoutes.post("/", upload.single("projectImage"), createProjectHandler);
