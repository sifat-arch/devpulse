import express, { application, request, type Application } from "express";
import { authRouter } from "./models/auth/auth.route";

const app: Application = express();
app.use(express.json());

app.use("/api/auth", authRouter);

app.get("/", (req, res) => {
  res.json({ data: "hello world" });
});

export default app;
