import express from "express";
import path from "path";
import { EnvVar } from "./config/EnvVar";
import router from "./routes/routes";


const app = express();

app.use(express.json());

app.use(
  "/images",
  express.static(path.resolve(process.cwd(), "uploads", "Images")),
);

app.use("/", router);

app.listen(EnvVar.SERVER_PORT, "0.0.0.0", () => {
  console.log(`Servidor rodando na porta ${EnvVar.SERVER_PORT}`);
});