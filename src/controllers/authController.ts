import { Request, Response } from "express";
import { prisma } from "../config/db";
import * as bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken";
import { registerSchema } from "../schemas/users/register.schema";
import z, { ZodError } from "zod";
import { loginSchema } from "../schemas/users/login.schema";

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (user) {
      const field = user.username === username ? "Username" : "Email";
      return res.status(400).json({ error: `${field} already taken` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = generateToken(newUser.id, res);

    return res.status(201).json({
      status: "success",
      data: {
        user: {
          id: newUser.id,
          username,
          email,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = z.treeifyError(error);
      return res.status(400).json({ errors: errors });
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

    const token = generateToken(user.id, res);

    return res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
          username: username,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = z.treeifyError(error);
      return res.status(400).json({ errors: errors });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};
