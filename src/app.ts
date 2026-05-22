import express, { application, request, type Application } from "express";
import { authRouter } from "./models/auth/auth.route";
import { issueRouter } from "./models/issue/issue.route";
import globalErrorHanler from "./middlewere/glabalErrorHanlder";

const app: Application = express();
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);

app.get("/", (req, res) => {
  res.json({ data: "hello world" });
});

app.use(globalErrorHanler)

export default app;
