import { PrismaClient } from "@prisma/client";
import Fastify from "fastify";
import cors from "@fastify/cors";

const fastify = Fastify({
  logger: true,
});

fastify.register(cors, {
  origin: (origin, cb) => {
    if (origin) {
      const hostname = new URL(origin).hostname;
      if (hostname === "localhost") {
        cb(null, true);
        return;
      }
      cb(new Error("Not allowed"), false);
    }
  },
});

const prisma = new PrismaClient();

fastify.get("/", function (request, reply) {
  reply.send({ hello: "world" });
});

fastify.get("/projects", async function (request, reply) {
  const projects = await prisma.project.findMany({});
  reply.send({ projects: projects });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
