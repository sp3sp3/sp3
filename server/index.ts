import express from "express";
import { projectRoutes } from "./routes/projects";
import { experimentRoutes } from "./routes/experiments";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/projects", projectRoutes);
app.use("/experiments", experimentRoutes);

export const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
