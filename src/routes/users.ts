import Router from "express";
import { isAuth } from "../middlewares/isAuth";
import { deleteUser, editUser } from "../controllers/users";

const router = Router();

router.delete("/", isAuth, deleteUser);
router.patch("/", isAuth, editUser);

export default router