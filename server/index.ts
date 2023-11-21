import { PrismaClient } from "@prisma/client";
import { publicProcedure, router } from "./trpc";

const prisma = new PrismaClient();

const appRouter = router({
  projectList: publicProcedure.query(async () => {
    // get projects
    await prisma.project.findMany({});
  }),
});
// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
