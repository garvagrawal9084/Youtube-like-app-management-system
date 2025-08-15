import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addCommment, deleteComment, updateComment } from "../controllers/comment.controller.js";

const router = Router()

router.route("/add-comment/c/:videoId").get(verifyJWT , addCommment)
router.route("/update-comment/c/:videoId/:commentId").patch(verifyJWT , updateComment )
router.route("/delete-comment/c/:commentId").delete(verifyJWT , deleteComment)

export default router