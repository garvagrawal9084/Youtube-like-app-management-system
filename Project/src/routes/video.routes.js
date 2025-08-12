import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { deleteVideo, getVideoById, publishVideo, updateVideo } from "../controllers/videos.controller.js";

const router = Router()

router.route("/publish-video").post(verifyJWT , 
upload.fields([
    {
        name : "video" ,
        maxCount : 1 
    } ,
    {
        name : "thumbnail",
        maxCount:1
    }
]) , publishVideo)

router.route("/c/:videoId").get(verifyJWT , getVideoById)

router.route("/update-video/c/:videoId").patch(verifyJWT , upload.single("video") , updateVideo)

router.route("/delete-video/c/:videoId").delete(verifyJWT , deleteVideo)

export default router