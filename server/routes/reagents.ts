import { Prisma, PrismaClient, Reagent } from "@prisma/client";
import { TypedRequestBody, TypedRequestQuery, TypedResponse } from "../types";
import { Router } from "express";

export const reagentRoutes = Router();
const prisma = new PrismaClient();

export interface GetReagentHandlerRequest {
  name: string;
  smiles: string;
}

export interface GetReagentHandlerResponse {
  reagent: ReagentWithSMILES | null;
}

export const getReagentHandler = async (
  req: TypedRequestQuery<GetReagentHandlerRequest>,
  res: TypedResponse<GetReagentHandlerResponse>,
) => {
  const { name, smiles } = req.query;
  try {
    // search by canonicalSMILES if both name and SMILES are provided
    // otherwise search by name

    // need to use Prisma.sql and not just a multi line string `` to
    // do a double string templating
    const query = smiles
      ? Prisma.sql`"canonicalSMILES"@=${smiles}::mol`
      : Prisma.sql`name=${name}`;

    const result = await prisma.$queryRaw<ReagentWithSMILES[]>`
            SELECT id, name, "canonicalSMILES"::text
            FROM "Reagent"
            WHERE ${query}`;

    if (result.length > 0) {
      return res.json({ reagent: result[0] });
    }
    return res.json({ reagent: null });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2010") {
        return res.status(400).send(`${smiles} is an invalid SMILES`);
      }
    }
    return res.status(500).send(`Error: ${e}`);
  }
};

export interface GetSimilarReagentsByNameHandlerRequest {
  name: string;
}

export interface GetSimilarReagentsByNameHandlerResponse {
  reagents: ReagentWithSMILES[];
}

export const getSimilarReagentsByNameHandler = async (
  req: TypedRequestQuery<GetSimilarReagentsByNameHandlerRequest>,
  res: TypedResponse<GetSimilarReagentsByNameHandlerResponse>,
) => {
  const { name } = req.query;
  const nameWithOperator = name + "%";
  const result = await prisma.$queryRaw<ReagentWithSMILES[]>`
            SELECT id, name, "canonicalSMILES"::text
            FROM "Reagent"
            WHERE name LIKE ${nameWithOperator}`;
  if (result.length > 0) {
    return res.json({ reagents: result });
  }
  return res.json({ reagents: [] });
};

export interface AddReagentHandlerRequest {
  reagentName?: string;
  canonicalSMILES?: string;
}

export type ReagentWithSMILES = Reagent & { canonicalSMILES: string };

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
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return res
        .status(400)
        .send(`Reagent ${reagentName || canonicalSMILES} already stored`);
    }
    return res.status(500).send(`Error: ${e}`);
  }
};

reagentRoutes.post("/addReagent", addReagentHandler);
reagentRoutes.get("/", getReagentHandler);
reagentRoutes.get("/getSimilarReagentsByName", getSimilarReagentsByNameHandler);
