import { PrismaClient } from "@prisma/client";
import { GetStaticProps } from "next";

const prisma = new PrismaClient();

export const getStaticProps: GetStaticProps = async () => {
  const projects = await prisma.project.findMany({});

  return {
    props: { projects },
    revalidate: 10,
  };
};
