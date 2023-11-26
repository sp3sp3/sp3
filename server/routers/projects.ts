import { z } from "zod";
import {
  CreateContextOptions,
  createTRPCRouter,
  publicProcedure,
} from "../trpc";

const getProjectsHandler = (ctx: CreateContextOptions) => {
  return ctx.prisma.project.findMany();
};

const getProjectByIdHandler = (
  ctx: CreateContextOptions,
  input: { id: number },
) => {
  return ctx.prisma.project.findUnique({
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
