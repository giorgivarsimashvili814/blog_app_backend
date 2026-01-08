import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import JwtPayload from "../types/jwtPayload";

export const isAuth = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
    ) as JwtPayload;

    req.user = { id: payload.userId, role: payload.role };

    next();
  } catch (err) {
    console.error("Access token verification failed:", err);
    return res
      .status(401)
      .json({ error: "Unauthorized: Invalid or expired token" });
  }
};
