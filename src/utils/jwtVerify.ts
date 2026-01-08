import jwt from "jsonwebtoken";
import JwtPayload from "../types/jwtPayload";

export const jwtVerify = (token: string) => {
  const payload = jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET!
  ) as JwtPayload;
  return payload;
};
