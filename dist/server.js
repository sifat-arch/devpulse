

import { createRequire } from 'module';

const require = createRequire(import.meta.url);



// src/app.ts
import express from "express";

// src/models/auth/auth.route.ts
import { Router } from "express";

// src/models/auth/auth.service.ts
import bcrypt from "bcrypt";

// src/db/index.ts
import { Pool } from "pg";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({
  path: path.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.DB_CONNECT_STR,
  port: process.env.PORT,
  secret: process.env.SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
              CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role VARCHAR(20) NOT NULL DEFAULT 'contributor', 
                CHECK(role IN('contributor', 'maintainer')),
             

                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
              )
            
             `);
    await pool.query(`
          CREATE TABLE IF NOT EXISTS issues(
            id SERIAL PRIMARY KEY,
            title VARCHAR(150) NOT NULL,
            description TEXT NOT NULL CHECK(char_length(description) >= 20),

            type VARCHAR(20) NOT NULL CHECK(type IN('bug' ,'feature_request')),
            status VARCHAR(30) NOT NULL DEFAULT 'open',
            CHECK(status IN('open', 'in_progress', 'resolved')),
            reporter_id INT,

            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        ) 
        
        `);
    console.log("Database is connected");
  } catch (error) {
    console.log(error);
  }
};

// src/models/auth/auth.service.ts
import jwt from "jsonwebtoken";
var createUserIntoDB = async (payload) => {
  const { name, email, password, role } = payload;
  const passwordHashed = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `
         INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING * 
        
        `,
    [name, email, passwordHashed, role]
  );
  return result;
};
var loginUserIntoDB = async (payload) => {
  const { email, password } = payload;
  const userData = await pool.query(
    `
          
         SELECT * FROM users WHERE email=$1
        
         `,
    [email]
  );
  if (userData.rows[0] === 0) {
    throw new Error("Invilid Credentials!");
  }
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Invilid Credentials!");
  }
  const jwtpaylead = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = jwt.sign(jwtpaylead, config_default.secret, {
    expiresIn: "1d"
  });
  return {
    token: accessToken,
    user
  };
};
var authServices = {
  createUserIntoDB,
  loginUserIntoDB
};

// src/utility/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    error: data.error
  });
};
var sendResponse_default = sendResponse;

// src/models/auth/auth.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await authServices.createUserIntoDB(req.body);
    delete result.rows[0].password;
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully",
      data: result.rows[0]
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message,
      error
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await authServices.loginUserIntoDB(req.body);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Login Successfull",
      data: {
        token: result.token,
        user: result.user
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    sendResponse_default(res, {
      statusCode: 401,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : void 0
      }
    });
  }
};
var authController = {
  createUser,
  loginUser
};

// src/models/auth/auth.route.ts
var router = Router();
router.post("/signup", authController.createUser);
router.post("/login", authController.loginUser);
var authRouter = router;

// src/models/issue/issue.route.ts
import { Router as Router2 } from "express";

// src/models/issue/issue.controller.ts
import "express";

// src/models/issue/issue.service.ts
var createIssuesInDB = async (payload, id) => {
  const { title, description, type, status } = payload;
  const result = await pool.query(
    `
       INSERT INTO issues(title,description,type,status,reporter_id) VALUES($1,$2,$3,$4,$5) RETURNING *
    `,
    [title, description, type, status || "open", id]
  );
  return result;
};
var getAllIssuesFromDB = async (payload) => {
  const order = payload.sort === "oldest" ? "ASC" : "DESC";
  const type = payload.type || null;
  const status = payload.status || null;
  const result = await pool.query(
    `
        SELECT * FROM issues 
        WHERE($1::text IS NULL OR type=$1)
        AND ($2::text IS NULL OR status= $2)
        ORDER BY created_at ${order}
      `,
    [type, status]
  );
  const issues = result.rows;
  const reporterIds = issues.map((issue) => issue.reporter_id);
  const userResults = await pool.query(
    `

        SELECT id,name,role FROM users WHERE id=ANY($1)
    `,
    [reporterIds]
  );
  const users = userResults.rows;
  const formattedIssues = issues.map((issue) => {
    const reporter = users.find((user) => user.id === issue.reporter_id);
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
  });
  return formattedIssues;
};
var getSingleIssueFromDB = async (id) => {
  const result = await pool.query(
    `
       SELECT * FROM issues WHERE id=$1
      `,
    [id]
  );
  const singleUser = result.rows;
  const reporterID = result.rows[0].reporter_id;
  const reporterArr = await pool.query(
    `
      
      SELECT id,name,role FROM users WHERE id=$1
    
    `,
    [reporterID]
  );
  const reporter = reporterArr.rows[0];
  const issues = result.rows[0];
  const fResult = {
    id: issues.id,
    title: issues.title,
    description: issues.description,
    type: issues.type,
    status: issues.status,
    reporter,
    created_at: issues.created_at,
    updated_at: issues.updated_at
  };
  return fResult;
};
var updateIssueFromDB = async (user, payload, id) => {
  const { title, description, type } = payload;
  const issueRes = await pool.query(
    `
    SELECT * FROM issues WHERE id=$1
    
    `,
    [id]
  );
  if (!issueRes.rows.length) throw new Error("Issue not found");
  const issue = issueRes.rows[0];
  const isMaintainer = user.role === "maintainer";
  const isOwner = issue.reporter_id === user.id;
  const isOpen = issue.status === "open";
  if (!isMaintainer && (!isOwner || !isOpen)) {
    throw new Error("Forbidden");
  }
  const result = await pool.query(
    `
         UPDATE issues
         SET title=COALESCE($1,title),description=COALESCE($2,description),type=COALESCE($3,type)
         WHERE id=$4 RETURNING * 
      
      `,
    [title, description, type, id]
  );
  return result;
};
var deleteIssueFromDB = (id, user) => {
  const role = user.role;
  if (role !== "maintainer") {
    throw new Error("Unauthorized access");
  }
  const result = pool.query(
    `
        DELETE FROM issues WHERE id=$1
        
      
      `,
    [id]
  );
  return result;
};
var issueServices = {
  createIssuesInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
  deleteIssueFromDB
};

// src/models/issue/issue.controller.ts
var createUssues = async (req, res) => {
  try {
    const result = await issueServices.createIssuesInDB(req.body, req.user?.id);
    sendResponse_default(res, {
      statusCode: 201,
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : void 0
      }
    });
  }
};
var getAllIssues = async (req, res) => {
  try {
    const query = req.query;
    const result = await issueServices.getAllIssuesFromDB(query);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue created successfully",
      data: result
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : void 0
      }
    });
  }
};
var getSingleIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await issueServices.getSingleIssueFromDB(id);
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Success!!",
      data: result
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : void 0
      }
    });
  }
};
var updateIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const result = await issueServices.updateIssueFromDB(
      user,
      req.body,
      id
    );
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "Issue updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    sendResponse_default(res, {
      statusCode: 400,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : void 0
      }
    });
  }
};
var deleteIssues = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const result = await issueServices.deleteIssueFromDB(
      id,
      user
    );
    if (result.rowCount === 0) {
      sendResponse_default(res, {
        statusCode: 404,
        success: true,
        message: "User not Found"
      });
    }
    sendResponse_default(res, {
      statusCode: 200,
      success: true,
      message: "message deleted successfully"
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    sendResponse_default(res, {
      statusCode: 500,
      success: false,
      message,
      error: {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : void 0
      }
    });
  }
};
var issueController = {
  createUssues,
  getAllIssues,
  getSingleIssues,
  updateIssues,
  deleteIssues
};

// src/middlewere/auth.ts
import jwt2 from "jsonwebtoken";
var auth = () => {
  return async (req, res, next) => {
    try {
      const tokenStr = req.headers.authorization;
      if (!tokenStr) {
        sendResponse_default(res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized access!!"
        });
      }
      const decodeed = jwt2.verify(
        tokenStr,
        config_default.secret
      );
      const userData = await pool.query(
        `
        SELECT * from users WHERE id=$1
      
      `,
        [decodeed.id]
      );
      const user = userData.rows[0];
      if (userData.rows[0] === 0) {
        sendResponse_default(res, {
          statusCode: 404,
          success: false,
          message: "User not found!!"
        });
      }
      if (user.role !== "contributor" && user.role !== "maintainer") {
        sendResponse_default(res, {
          statusCode: 403,
          success: false,
          message: "unauthorized access!!"
        });
      }
      req.user = decodeed;
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/models/issue/issue.route.ts
var router2 = Router2();
router2.post("/", auth_default(), issueController.createUssues);
router2.get("/", issueController.getAllIssues);
router2.get("/:id", issueController.getSingleIssues);
router2.patch("/:id", auth_default(), issueController.updateIssues);
router2.delete("/:id", auth_default(), issueController.deleteIssues);
var issueRouter = router2;

// src/middlewere/glabalErrorHanlder.ts
var globalErrorHanler = (err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
};
var glabalErrorHanlder_default = globalErrorHanler;

// src/app.ts
var app = express();
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);
app.get("/", (req, res) => {
  res.json({ data: "hello world" });
});
app.use(glabalErrorHanlder_default);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Server is running port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.js.map