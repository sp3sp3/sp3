import { PrismaClient, Experiment } from "@prisma/client";
import { Router } from "express";
import { TypedRequestBody, TypedResponse } from "../types";

export const experimentRoutes = Router();

const prisma = new PrismaClient();

export interface CreateExperimentHandlerRequest {
  name: string;
  parentId: string;
}

export interface CreateExperimentHandlerResponse {
  experiment: Experiment;
}

export const createExperimentHandler = async (
  req: TypedRequestBody<CreateExperimentHandlerRequest>,
  res: TypedResponse<CreateExperimentHandlerResponse>,
) => {
  const { name, parentId } = req.body;

  try {
    const experiment = await prisma.experiment.create({
      data: {
        name: name,
        parentId: Number(parentId),
      },
    });
    res.json({ experiment: experiment });
  } catch (e) {
    console.log(e);
    throw e;
  }
};

experimentRoutes.post("/", createExperimentHandler);
