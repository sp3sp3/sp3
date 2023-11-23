import { db } from "../db/database";
import { ProjectUpdate, Project, NewProject } from "../db/types";

export const getProjects = async () => {
  return await db.selectFrom("project").selectAll().execute();
};
