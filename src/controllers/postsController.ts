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
      return res.status(400).json(errors);
    }
    console.error("Create Post Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const editPost = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const { body } = editPostSchema.parse(req.body);

    const postId = Number(req.params.postId);
    if (isNaN(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (user.role !== "ADMIN" && post.authorId !== user.id) {
      return res.status(403).json({ error: "Forbidden: Cannot edit post" });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { body },
    });

    return res.status(200).json({ status: "success", data: updatedPost });
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = z.treeifyError(error);
      return res.status(400).json(errors);
    }
    console.error("Edit Post Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const postId = Number(req.params.postId);

    if (isNaN(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await prisma.post.findUnique({ where: { id: postId } });

    if (!post) return res.status(404).json({ error: "Post not found" });

    if (user.role !== "ADMIN" && post.authorId !== user.id) {
      return res.status(403).json({ error: "Forbidden: Cannot delete post" });
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

export const getPostById = async (req: Request, res: Response) => {
  try {
    const postId = Number(req.params.postId);
    if (isNaN(postId))
      return res.status(400).json({ error: "Invalid post ID" });

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        title: true,
        body: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!post) return res.status(404).json({ error: "Post not found" });

    return res.status(200).json({ status: "success", data: post });
  } catch (error) {
    console.error("Get Post Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await fetchPosts();

    return res.status(200).json({ status: "success", data: posts });
  } catch (error) {
    console.error("Get All Posts Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getPostsByAuthor = async (req: Request, res: Response) => {
  try {
    const authorId = Number(req.params.authorId);
    if (isNaN(authorId))
      return res.status(400).json({ error: "Invalid user ID" });

    const posts = await fetchPosts({ authorId });

    if (posts.length === 0) {
      return res.status(404).json({ error: "No posts found" });
    }

    return res.status(200).json({ status: "success", data: posts });
  } catch (error) {
    console.error("Get Posts By Author Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const fetchPosts = async (filter?: { authorId?: number }) => {
  return prisma.post.findMany({
    where: filter,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      body: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });
};
