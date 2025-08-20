import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylist, removeVideoFromPlaylist, updatePlaylist } from "../controllers/playlist.controller.js";

const playlistRouter = Router()

playlistRouter.route("/create-playlist").post(verifyJWT , createPlaylist )
playlistRouter.route("/user-playlist").post(verifyJWT , getUserPlaylist)
playlistRouter.route("/playlist/c/:playlistId").get(verifyJWT ,getPlaylistById )
playlistRouter.route("/add-video/c/:videoId/:playlistId").get(verifyJWT , addVideoToPlaylist)
playlistRouter.route("/remove-video-playlist/c/:videoId/:playlistId").get(verifyJWT , removeVideoFromPlaylist)
playlistRouter.route("/delete-playlist/c/:playlistId").get(verifyJWT , deletePlaylist)
playlistRouter.route("/update-playlist/c/:playlistId").get(verifyJWT , updatePlaylist)

export {playlistRouter}

