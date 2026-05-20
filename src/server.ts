import express, { request } from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ data: "hello world" });
});

app.listen(5000, () => {
  console.log("Server is running port 5000");
});
