import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
  connection_string: process.env.DB_CONNECT_STR,
  port: process.env.PORT,
};

export default config;
