import { Prisma, PrismaClient, Project } from "@prisma/client";
import { Router } from "express";
import { TypedRequestBody, TypedResponse } from "../types";
import sharp from "sharp";
import multer from "multer";

const upload = multer({ dest: "uploads/" });

export const projectRoutes = Router();

const prisma = new PrismaClient();

const project2ProjectWithDataBuffer = (
  project: Project & { children?: Project[] },
): ProjectWithDataBuffer => {
  const { image, children, ...rest } = project;
  if (children) {
    const processedChildren = children.map((i) =>
      project2ProjectWithDataBuffer(i),
    );
    return {
      ...rest,
      children: processedChildren,
      base64image: image ? image.toString("base64") : null,
    };
  } else {
    return {
      ...rest,
      base64image: image ? image.toString("base64") : null,
    };
  }
};

export type ProjectWithDataBuffer = Omit<Project, "image"> & {
  base64image: string | null;
  children?: ProjectWithDataBuffer[];
};

export interface GetTopLevelProjectsHandlerResponse {
  projects: ProjectWithDataBuffer[];
}

export const getTopLevelProjectsHandler = async (
  _: TypedRequestBody<{}>,
  res: TypedResponse<GetTopLevelProjectsHandlerResponse>,
) => {
  const projects = await prisma.project.findMany({ where: { parentId: null } });
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
    include: { children: true },
  });

  if (!project) {
    res
      .status(404)
      .send(JSON.stringify(`Project id=${req.params.id} not found`));
  } else {
    res.json({ project: project2ProjectWithDataBuffer(project) });
  }
};

export interface GetPathToProjectHandlerRequest {
  id: string;
}

export interface GetPathToProjectHandlerResponse {
  path: { id: number; name: string; parentId: number }[];
}

// get the path from leaf to root of the requested project id
export const getPathToProjectHandler = async (
  req: TypedRequestBody<GetPathToProjectHandlerRequest>,
  res: TypedResponse<GetPathToProjectHandlerResponse>,
) => {
  const result: { id: number; name: string; parentId: number }[] =
    await prisma.$queryRaw`
    WITH RECURSIVE path(id, name, "parentId") 
    AS (SELECT id,
        name,
        "parentId"
    FROM "Project"
    WHERE id=${Number(req.params.id)}
    UNION ALL 
    SELECT p.id,
            p.name, 
            p."parentId"
    FROM path, "Project" p
    WHERE p.id=path."parentId"
    ) 
    SELECT * FROM path;`;

  res.json({
    path: result,
  });
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
      res.status(400).send(JSON.stringify(`Invalid request: ${e.message}`));
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

projectRoutes.get("/", getTopLevelProjectsHandler);
projectRoutes.get("/pathToProject/:id", getPathToProjectHandler);
projectRoutes.get("/:id", getProjectByIdHandler);
projectRoutes.post("/", upload.single("projectImage"), createProjectHandler);
