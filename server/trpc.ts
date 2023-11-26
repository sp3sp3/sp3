import { PrismaClient } from "@prisma/client";
import { initTRPC } from "@trpc/server";

const prisma = new PrismaClient();

export type CreateContextOptions = {
  prisma: PrismaClient;
};

export const createInnerTRPCContext = (opts: CreateContextOptions) => {
  return {
    prisma: opts.prisma,
  };
};

export const createTRPCContext = async (opts: CreateContextOptions) => {
  return createInnerTRPCContext({
    prisma,
  });
};

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<typeof createTRPCContext>().create({});

/**
 * This is how you create new routers and subrouters in your tRPC API
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in
 */
export const publicProcedure = t.procedure;
