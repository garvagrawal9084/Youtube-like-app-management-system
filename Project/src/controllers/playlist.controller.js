import mongoose, { isValidObjectId } from "mongoose";
import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.models.js";
import { ApiResponse } from "../utils/ApiResponse";

const createPlaylist = asyncHandler(async (req, res) => {
  // todo

  // 1) Get name and description from req.body
  // 2) Check if we get name or not
  // 3) Get user id
  // 4) Create a new document
  // 5) return response

  // 1)
  const { name, description } = req.body;

  // 2)
  if (!name) {
    throw new APIError(400, "Name of the playlist is required");
  }

  // 3)

  const userID = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(userID)) {
    throw new APIError(400, "Invalid user id");
  }

  // 4)

  const playlist = await Playlist.create({
    name: name,
    description: description,
    owner: userID,
  });

  if (!playlist) {
    throw new APIError(500, "Cannot create playlist right now");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created"));
});

const getUserPlaylist = asyncHandler(async (req, res) => {
  // todo
  // 1) Get user if from req user
  // 2) search for playlist
  // 3) return video

  // 1)
  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    throw new APIError(400, "Invalid user id");
  }

  // 2)

  const playlist = await Playlist.find({ owner: userId }).populate("videos");

  if (!playlist || playlist.length === 0) {
    throw new APIError(400, "No playlist is found for this user");
  }

  // 3)

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "Playlist of the user is fetch successfully"
      )
    );
});

const getPlaylistById = asyncHandler(async (req, res) => {
    
});

export { createPlaylist, getUserPlaylist };
