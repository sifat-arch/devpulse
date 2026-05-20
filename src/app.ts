import express, { request } from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ data: "hello world" });
});

export default app;
