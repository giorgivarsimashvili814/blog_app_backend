import jwt from "jsonwebtoken";
import "dotenv/config";
import { UserRole } from "../types/userRole";

export const generateRefreshToken = (userId: number, role: UserRole) => {
  const refreshToken = jwt.sign(
    { userId, role },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );

  return refreshToken;
};
