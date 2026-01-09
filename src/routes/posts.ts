import Router from "express";
import {
  createPost,
  deletePost,
  editPost,
  getAllPosts,
  getPostById,
  getPostsByAuthor,
} from "../controllers/posts";
import { isAuth } from "../middlewares/isAuth";

const router = Router();

router.post("/", isAuth, createPost);
router.patch("/:postId", isAuth, editPost);
router.delete("/:postId", isAuth, deletePost);
router.get("/:postId", getPostById);
router.get("/", getAllPosts);
router.get("/author/:authorId", getPostsByAuthor);

export default router;
