import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Comment } from "../models/comment.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addCommment = asyncHandler(async (req, res) => {
  // Todo
  // 1) Get comment from req body check if we get comment for not
  // 2) Get user id from req user  and check if we get user id or not
  // 3) Get video id from params and check
  // 4) store comment content , user id and video id in the database
  // 5) Return response

  // 1)
  const { commentContent } = req.body;

  if (!commentContent) {
    throw new APIError(400, "Comment is required");
  }

  // 2)
  const userId = req.user._id;

  if (!userId) {
    throw new APIError(401, "Unauthorized");
  }
  // 3)
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new APIError(400, "Video id is not provided");
  }

  // 4)
  const comment = await Comment.create({
    content: commentContent,
    owner: userId,
    video: videoId,
  });

  if (!comment) {
    throw new APIError(500, "Cannot add comment right now");
  }

  // 5)

  return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // Todo
  // 1) Get new Comment from req body
  // 2) Get user id from req user
  // 3) Get video id from params
  // 4) Find the comment with videoId and user id and update the old comment with new Comment and save
  // 5) return response

  // 1)
  const { newComment } = req.body;

  if (!newComment) {
    throw new APIError(400, "Comment is not provided");
  }

  // 2)
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new APIError(400, "Unauthorized");
  }

  // 3)
  const { videoId, commentId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new APIError(400, "Video id is not provided");
  }

  // 4)
  const updateComment = await Comment.updateOne(
    { _id: commentId, owner: userId, video: videoId },
    { $set: { content: newComment } },
    { new: true }
  );

  if (!updateComment) {
    throw new APIError(400, "Cannot update comment right now");
  }

  // 5)
  return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // Todo
  // 1) Get comment id from params
  // 2) delete comment
  // 3) Send response

  const { commentId } = req.params;

  const userId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(commentId)) {
    throw new APIError(400, "Invlaid comment id");
  }

  const deleteComment = await Comment.deleteOne(
    { _id: commentId, owner: userId },
    { new: true }
  );

  if (deleteComment.deletedCount === 0) {
    throw new APIError(200, "Comment not found or not authorized to delete it");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, deleteComment, "Comment delete successfully"));
});

const getAllComment = asyncHandler(async (req, res) => {
  // todo
  // 1) Get videoId
  // 2) get page, limit from query

  const { videoId } = req.params;

  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const comment = await Comment.aggregate([
    {
      $match: {
        video: mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    
    {
      $match: {
        video: mongoose.Types.ObjectId(videoId) ,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetail",
        pipeline: [
          {
            $project: {
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        ownerDetail: {
          $first: "$ownerDetail",
        },
      },
    },
    {
      $project: {
        content: 1,
        ownerDetail: 1,
        video: 1,
      },
    },
  ]);

  if(!comment){
    throw new APIError(500 , "Cannot retreive comment right now")
  }

  return res.status(200).json(new ApiResponse(200 , comment , "Comment fetch successfully"))
});

export { addCommment, updateComment, deleteComment };
