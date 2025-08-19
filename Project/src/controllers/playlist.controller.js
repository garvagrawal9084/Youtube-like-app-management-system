import mongoose, { isValidObjectId } from "mongoose";
import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "invalid Playlist id");
  }

  const playlist = await Playlist.findById(playlistId).populate("videos");

  if (!playlist) {
    throw new APIError(400, "PlayList not found for the id");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetch successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video Id");
  }

  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist Id");
  }

  const response = await Playlist.findByIdAndUpdate(
    playlistId,
    { $addToSet: { videos: videoId } },
    { new: true }
  );

  if (!response || response.length === 0) {
    throw new APIError(404, "Cannot add video to playlist right now");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, response, "Video add successfully to the playlist")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new APIError(400, "Invalid video id");
  }

  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist id");
  }

  const response = await Playlist.findByIdAndUpdate(playlistId, {
    $pull: { videos: videoId },
  });

  if (!response) {
    throw new APIError(400, "Cannot remove video right now");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Video remove successfully"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid playlist id");
  }

  const response = await Playlist.findByIdAndDelete(playlistId);

  if (!response) {
    throw new APIError(400, "Playlist not found or already deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, response, "Delete playlist successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    throw new APIError(400, "Invalid User Id");
  }

  const { name, description } = req.body;

  if (!name && !description) {
    throw new APIError(400, "Need atleast one name or description");
  }

const response = await Playlist.findByIdAndUpdate(
  playlistId,
  [
    {
      $set: {
        name: { $cond: [{ $ne: [name, null] }, name, "$name"] },
        description: { $cond: [{ $ne: [description, null] }, description, "$description"] }
      }
    }
  ],
  { new: true } // return the updated doc
);

if (!response) {
  throw new APIError(404, "Playlist not found or cannot update");
}

return res
  .status(200)
  .json(new ApiResponse(200, response, "Playlist updated successfully"));
});

export {
  createPlaylist,
  getUserPlaylist,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist
};
