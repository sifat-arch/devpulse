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

export const issueServices = {
  createIssuesInDB,
  getAllIssuesFromDB,
};
