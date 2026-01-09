import { Request, Response } from "express";
import { prisma } from "../config/db";
import * as bcrypt from "bcrypt";
import { generateRefreshToken } from "../utils/generateRefreshToken";
import { registerSchema } from "../schemas/auth/register.schema";
import z, { ZodError } from "zod";
import { loginSchema } from "../schemas/auth/login.schema";
import { Prisma } from "../generated/prisma/client";
import { generateAccessToken } from "../utils/generateAccessToken";
import { setRefreshTokenCookie } from "../utils/setRefreshTokenCookie";
import { jwtVerify } from "../utils/jwtVerify";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    return res.status(201).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          username,
          email,
        },
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = z.treeifyError(error);
      return res.status(400).json(errors);
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(400).json({
        error: "Credentials already in use",
      });
    }
    console.error("registration Error:", error);
    return res.status(500).json({ error: "internal server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid)
      return res.status(401).json({ error: "Invalid credentials" });

    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    setRefreshTokenCookie(res, refreshToken);

    return res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          username: username,
          email: user.email,
          createdAt: user.createdAt,
        },
        accessToken,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = z.treeifyError(error);
      return res.status(400).json(errors);
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = (req: Request, res: Response) => {
  res.cookie("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
  });

  return res
    .status(200)
    .json({ status: "success", message: "Logged out successfully" });
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    const payload = jwtVerify(oldRefreshToken);

    const accessToken = generateAccessToken(payload.userId, payload.role);
    const newRefreshToken = generateRefreshToken(payload.userId, payload.role);

    setRefreshTokenCookie(res, newRefreshToken);

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};
