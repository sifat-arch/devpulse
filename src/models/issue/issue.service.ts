import { pool } from "../../db";

const createIssuesInDB = async (payload: any, id: string) => {
  const { title, description, type, status } = payload;

  const result = await pool.query(
    `
       INSERT INTO issues(title,description,type,status,reporter_id) VALUES($1,$2,$3,$4,$5) RETURNING *
    `,
    [title, description, type, status || "open", id],
  );

  return result;
};

export const issueServices = {
  createIssuesInDB,
};
