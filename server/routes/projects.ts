import { Prisma, PrismaClient, Project } from "@prisma/client";
import { Router } from "express";
import { TypedRequestBody, TypedResponse } from "../types";
import sharp from "sharp";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const projectRoutes = Router();

const prisma = new PrismaClient();

export type ProjectWithDataBufferResponse = Omit<Project, "image"> & {
  image: { data: Buffer | null };
};

export interface GetProjectsHandlerResponse {
  projects: ProjectWithDataBufferResponse[];
}

export const getProjectsHandler = async (
  _: TypedRequestBody<{}>,
  res: TypedResponse<GetProjectsHandlerResponse>,
) => {
  const projects = await prisma.project.findMany({});
  const result = projects.map((i) => {
    const { image, ...rest } = i;
    return {
      ...rest,
      image: { data: image },
    };
  });
  res.json({ projects: result });
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
}

export interface CreateProjectHandlerResponse {
  project: Project;
}

export const createProjectHandler = async (
  req: TypedRequestBody<CreateProjectHandlerRequest>,
  res: TypedResponse<CreateProjectHandlerResponse>,
) => {
  const { name, parentId } = req.body;
  try {
    const project = await prisma.project.create({
      data: {
        name: name,
        parentId: parentId ? Number(parentId) : null,
      },
    });
    res.json({ project: project });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientValidationError) {
      res.status(400).send(`Invalid request: ${e.message}`);
    }
  }
};

const resizeFile = async (pathToImage: string) => {
  const buffer = await sharp(pathToImage)
    .resize(300, 300, {
      fit: sharp.fit.inside,
      withoutEnlargement: true,
    })
    .toBuffer();
  // return buffer.toString("base64");
  return buffer;
};

export interface UploadImageHandlerRequest {
  // the fields within body
  projectId: string;
}

export interface UploadImageHandlerResponse {
  base64Image: string;
}

export const uploadImageToProjectHandler = async (
  req: TypedRequestBody<UploadImageHandlerRequest>,
  _: TypedResponse<UploadImageHandlerResponse>,
) => {
  // multer middleware will handle req.file field. file in the body is
  // something else it seems, undefined
  const img = req.file;
  const projectId = Number(req.body.projectId);
  console.log(req.body);
  if (img) {
    // const base64image = await resizeFile(img.path);
    const fileBuffer = await resizeFile(img.path);
    await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        // base64image: `data:image/png;base64,${base64image}`,
        image: fileBuffer,
      },
    });
  }
};

projectRoutes.get("/", getProjectsHandler);
projectRoutes.get("/:id", getProjectByIdHandler);
projectRoutes.post("/", createProjectHandler);
projectRoutes.post(
  "/uploadImage",
  upload.single("projectImage"),
  uploadImageToProjectHandler,
);
