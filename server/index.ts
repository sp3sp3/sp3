import express from "express";
import { projectRoutes } from "./routes/projects";
import { experimentRoutes } from "./routes/experiments";
import cors from "cors";
import { reagentRoutes } from "./routes/reagents";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/projects", projectRoutes);
app.use("/experiments", experimentRoutes);
app.use("/reagents", reagentRoutes);

export const server = app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
