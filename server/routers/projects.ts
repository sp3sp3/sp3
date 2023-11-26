import { z } from "zod";
import {
  CreateContextOptions,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

const getProjectsHandler = async (ctx: CreateContextOptions) => {
  return await ctx.prisma.project.findMany();
};

const getProjectByIdHandler = async (
  ctx: CreateContextOptions,
  input: { id: number },
) => {
  return await ctx.prisma.project.findUnique({
    where: { id: input.id },
  });
};

export const projectsRouter = createTRPCRouter({
  getProjects: publicProcedure.query(({ ctx }) => {
    return getProjectsHandler(ctx);
  }),

  getProjectById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(({ ctx, input }) => {
      return getProjectByIdHandler(ctx, input);
    }),
});
