import { Router } from "express";
import { registerUser , loginUser, logoutUser, refreshAccessToken, changeCurrectPassword, getCurrentUserInfo, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getUserWatchHistory } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser)


// secured Routes
router.route("/logout").post(verifyJWT , logoutUser)

// refresh Access Token
router.route("/refreshAccessToken").post(refreshAccessToken)

// Change password
router.route("/changePassword").post(verifyJWT , changeCurrectPassword)

// get current user info 
router.route("/getUserInfo").post(verifyJWT , getCurrentUserInfo)

// update Account Detail
router.route("/update-account-detail").patch(verifyJWT , updateAccountDetails)

// Update user avatar
router.route("/update-avatar").patch(verifyJWT , upload.single("avatar") , updateUserAvatar)

// Update cover image
router.route("/update-coverImage").patch(verifyJWT , upload.single("coverImage") , updateUserCoverImage)

//  get user channel profile
router.route("/c/:username").get(verifyJWT , getUserChannelProfile)

// get watch history
router.route("/watch-history").get(verifyJWT , getUserWatchHistory)
export default router;
