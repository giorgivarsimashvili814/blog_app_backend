import { Request, Response } from "express";
import { prisma } from "../config/db";
import { createPostSchema } from "../schemas/posts/createPost.schema";
import z, { ZodError } from "zod";
import { editPostSchema } from "../schemas/posts/editPost.schema";

export const createPost = async (req: Request, res: Response) => {
  try {
    const { title, body } = createPostSchema.parse(req.body);

    const post = await prisma.post.create({
      data: {
        title,
        body,
        authorId: req.user!.id,
      },
    });

    return res.status(201).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = z.treeifyError(error);
      return res.status(400).json({ errors: errors });
    }
    console.error("Create Post Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const editPost = async (req: Request, res: Response) => {
  try {
    const { body } = editPostSchema.parse(req.body);
    const postId = Number(req.params.postId);
    if (isNaN(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!req.user || post.authorId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: Not your post" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { body },
    });

    return res.status(200).json({ status: "success", data: updatedPost });
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = z.treeifyError(error);
      return res.status(400).json({ errors: errors });
    }
    console.error("Edit Post Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const postId = Number(req.params.postId);
    if (isNaN(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (!req.user || post.authorId !== req.user.id) {
      return res.status(403).json({ error: "Forbidden: Not your post" });
    }

    const deletedPost = await prisma.post.delete({
      where: { id: postId },
    });

    return res.status(200).json({ status: "success", data: deletedPost });
  } catch (error) {
    console.error("Delete Post Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
