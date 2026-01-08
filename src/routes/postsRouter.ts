import express from "express";
import {
  createPost,
  deletePost,
  editPost,
  getAllPosts,
  getPostById,
  getPostsByAuthor,
} from "../controllers/postsController";
import { isAuth } from "../middlewares/isAuth";

const router = express.Router();

router.post("/", isAuth, createPost);
router.patch("/:postId", isAuth, editPost);
router.delete("/:postId", isAuth, deletePost);
router.get("/:postId", getPostById);
router.get("/", getAllPosts);
router.get("/author/:authorId", getPostsByAuthor);

export default router;
