import { PrismaClient } from "@prisma/client";
import Fastify, { FastifyRequest } from "fastify";
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

export interface BodyType {
  name: string;
}

fastify.post(
  "/addProject",
  async function (request: FastifyRequest<{ Body: BodyType }>, reply) {
    console.log("BODY: ", request.body);
    const { name } = request.body;

    const project = await prisma.project.create({
      data: {
        name: name,
      },
    });

    reply.send({ project: project });
  },
);

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
