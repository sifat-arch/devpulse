import bcrypt from "bcrypt";
import { pool } from "../../db";

const createUserIntoDB = async (payload: any) => {
  const { name, email, password, role } = payload;

  const passwordHashed = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
         INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING * 
        
        `,
    [name, email, passwordHashed, role],
  );

  return result;
};

export const authServices = {
  createUserIntoDB,
};
