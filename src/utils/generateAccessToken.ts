import jwt from "jsonwebtoken";
import "dotenv/config";
import { UserRole } from "../types/userRole";

export const generateAccessToken = (userId: number, role: UserRole) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "15m",
    }
  );

  return accessToken;
};
