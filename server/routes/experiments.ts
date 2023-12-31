import {
  PrismaClient,
  Experiment,
  ReactionSchemeLocation,
  ExperimentReagent,
  Prisma,
  Reagent,
} from "@prisma/client";
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

export interface AddReagentHandlerRequest {
  reagentName?: string;
  canonicalSMILES?: string;
}

type ReagentWithSMILES = Reagent & { canonicalSMILES: string };

export interface AddReagentHandlerResponse {
  reagent: ReagentWithSMILES;
}

export const addReagentHandler = async (
  req: TypedRequestBody<AddReagentHandlerRequest>,
  res: TypedResponse<AddReagentHandlerResponse>,
) => {
  const { reagentName, canonicalSMILES } = req.body;
  try {
    // use queryRaw to insert RDKit molecule type which is not supported by Prisma
    // need to deserialize the RDKit mol type to a text
    const result = await prisma.$queryRaw<ReagentWithSMILES[]>`
            INSERT INTO "Reagent"
            (name, "canonicalSMILES")
            VALUES
            (${reagentName}, ${canonicalSMILES}::mol)
            RETURNING id, name, "canonicalSMILES"::text`;
    res.json({ reagent: result[0] });
  } catch (e) {
    return res.status(500).send(`Error: ${e}`);
  }
};

export interface AssignReagentToExperimentHandlerRequest {
  experimentId: string;
  reagentId: string;
  reactionSchemeLocation: ReactionSchemeLocation;
  equivalents: number;
}

export interface AssignReagentToExperimentHandlerResponse {
  experiment: Experiment & { reagents: ExperimentReagent[] };
}

// assign reagent to the experiment
// reagent needs to already be in the DB
export const assignReagentToExperiment = async (
  req: TypedRequestBody<AssignReagentToExperimentHandlerRequest>,
  res: TypedResponse<AssignReagentToExperimentHandlerResponse>,
) => {
  const { experimentId, reagentId, reactionSchemeLocation, equivalents } =
    req.body;
  try {
    const result = await prisma.experimentReagent.create({
      data: {
        reagentId: Number(reagentId),
        experimentId: Number(experimentId),
        reactionSchemeLocation: reactionSchemeLocation,
        equivalents: equivalents,
      },
      include: { experiment: { include: { reagents: true } } },
    });

    res.json({ experiment: result.experiment });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2003") {
        return res.status(404).send(`Reagent not in DB: ${e.message}`);
      }
    }
    return res.status(500).send(`Error: ${e}`);
  }
};

experimentRoutes.post("/", createExperimentHandler);
experimentRoutes.post("/assignReagentToExperiment", assignReagentToExperiment);
experimentRoutes.post("/addReagent", addReagentHandler);
