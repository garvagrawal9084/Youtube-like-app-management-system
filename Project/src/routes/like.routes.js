import { Router } from "express";

import { verifyJWT } from "../middlewares/auth.middleware.js";
import { toggleCommentLike,  toggleTweetLike,  toggleVideoLike } from "../controllers/like.controller.js";

const likeRouter = Router()



likeRouter.route("/toggle-video-like/c/:videoId").get(verifyJWT , toggleVideoLike)
likeRouter.route("/toggle-comment-like/c/:commentId").get(verifyJWT , toggleCommentLike)
likeRouter.route("/toggle-tweet-like/c/:tweetId").get(verifyJWT , toggleTweetLike)

export {likeRouter}