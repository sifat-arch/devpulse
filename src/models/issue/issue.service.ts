import { pool } from "../../db";

const createIssuesInDB = async (
  payload: { title: string; description: string; type: string; status: string },
  id: string,
) => {
  const { title, description, type, status } = payload;

  const result = await pool.query(
    `
       INSERT INTO issues(title,description,type,status,reporter_id) VALUES($1,$2,$3,$4,$5) RETURNING *
    `,
    [title, description, type, status || "open", id],
  );

  return result;
};

const getAllIssuesFromDB = async (payload: any) => {
  console.log(payload.sort);
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
    [type, status],
  );

  const issues = result.rows;

  const reporterIds = issues.map((issue) => issue.reporter_id);

  const userResults = await pool.query(
    `

        SELECT id,name,role FROM users WHERE id=ANY($1)
    `,
    [reporterIds],
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
      updated_at: issue.updated_at,
    };
  });

  return formattedIssues;
};

const getSingleIssueFromDB = async (id: string) => {
  const result = await pool.query(
    `
       SELECT * FROM issues WHERE id=$1
      `,
    [id],
  );

  const singleUser = result.rows;

  const reporterID = result.rows[0].reporter_id;

  const reporterArr = await pool.query(
    `
      
      SELECT id,name,role FROM users WHERE id=$1
    
    `,
    [reporterID],
  );
  const reporter = reporterArr.rows[0];

  const issues = result.rows[0];

  const fResult = {
    id: issues.id,
    title: issues.title,
    description: issues.description,
    type: issues.type,
    status: issues.status,
    reporter: reporter,
    created_at: issues.created_at,
    updated_at: issues.updated_at,
  };
  return fResult;
};

const updateIssueFromDB = async (
  payload: { title: string; description: string; type: string },
  id: string,
) => {
  const { title, description, type } = payload;
  const result = await pool.query(
    `
         UPDATE issues
         SET title=$1,description=$2,type=$3
         WHERE id=$4 RETURNING * 
      
      `,
    [title, description, type, id],
  );

  return result;
};

export const issueServices = {
  createIssuesInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateIssueFromDB,
};
