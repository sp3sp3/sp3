import express from "express";
import { projectRoutes } from "./routes/projects";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/projects", projectRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
