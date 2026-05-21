import bcrypt from "bcrypt";
import { pool } from "../../db";
import jwt from "jsonwebtoken";
import config from "../../config";

const createUserIntoDB = async (payload: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
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

const loginUserIntoDB = async (payload: {
  email: string;
  password: string;
}) => {
  const { email, password } = payload;
  // find the user if exist
  const userData = await pool.query(
    `
          
         SELECT * FROM users WHERE email=$1
        
         `,
    [email],
  );

  if (userData.rows[0] === 0) {
    throw new Error("Invilid Credentials!");
  }

  // Conpaire the cilnt password and db passowrd vie bcrypt
  const user = userData.rows[0];

  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error("Invilid Credentials!");
  }

  //  genereate jwt token

  const jwtpaylead = {
    id: user.id,
    name: user.name,
    role: user.role,
  };

  const accessToken = jwt.sign(jwtpaylead, config.secret as string, {
    expiresIn: "1d",
  });

  return {
    token: accessToken,
    user,
  };
};

export const authServices = {
  createUserIntoDB,
  loginUserIntoDB,
};
