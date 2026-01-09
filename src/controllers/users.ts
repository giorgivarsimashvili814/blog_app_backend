import { Request, Response } from "express";
import { prisma } from "../config/db";
import { Prisma } from "../generated/prisma/client";
import * as bcrypt from "bcrypt";
import { editUserSchema } from "../schemas/users/editUser.schema";
import z, { ZodError } from "zod";

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    await prisma.user.delete({ where: { id: user.id } });

    return res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user.id,
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ error: "User not found" });
    }
    console.error("Delete User Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const editUser = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { username, email, password } = editUserSchema.parse(req.body);

    const data: {
      username?: string;
      email?: string;
      password?: string;
    } = {};

    if (username) data.username = username;
    if (email) data.email = email;

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    return res.status(200).json({
      status: "success",
      data: {
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
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
      error.code === "P2025"
    ) {
      return res.status(404).json({ error: "User not found" });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return res.status(400).json({
        error: "Credentials already in use",
      });
    }

    console.error("Edit User Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
