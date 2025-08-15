import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addCommment, updateComment } from "../controllers/comment.controller.js";

const router = Router()

router.route("/add-comment/c/:videoId").get(verifyJWT , addCommment)
router.route("/update-comment/c/:videoId/:commentId").patch(verifyJWT , updateComment )

export default router