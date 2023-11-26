import { createTRPCRouter } from "./trpc";
import { projectsRouter } from "./routers/projects";

/**
 * This is the primary router for your server.
 *
 * All routers added in /server/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  projects: projectsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
