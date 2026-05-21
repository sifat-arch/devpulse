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

  return result;
};

export const issueServices = {
  createIssuesInDB,
  getAllIssuesFromDB,
};
