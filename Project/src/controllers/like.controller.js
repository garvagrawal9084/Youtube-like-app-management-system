import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { Like } from "../models/likes.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleVideoLike  = asyncHandler(async(req , res) => {
    // todo
    // 1) Get video id from params
    // 2) Get user id from req user
    // 3) check if the user and like found in data base delete if not add one by adding new record
    // 4) return response

    // 1)
    const {videoId} = req.params

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new APIError(400 , "Invlid video id")
    }

    // 2)
    const userId = req.user?._id
    
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new APIError(400 , "Invalid User Id")
    }

    // 3

    const existingLike = await Like.findOne({video : videoId , likedBy : userId})

    if(existingLike){
        await Like.deleteOne(existingLike)
        return res.status(200).json(new ApiResponse(200 , existingLike , "Like remove successfully"))
    }

   const like =  await Like.create({
        video : videoId ,
        likedBy : userId
    })
    
    return res.status(200).json(new ApiResponse(200 , like , "Video like successfully"))

})

const toggleCommentLike  = asyncHandler(async(req , res) => {
    // todo
    // 1) Get video id from params
    // 2) Get user id from req user
    // 3) check if the user and like found in data base delete if not add one by adding new record
    // 4) return response

    // 1)
    const {commentId} = req.params

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new APIError(400 , "Invlid comment id")
    }

    // 2)
    const userId = req.user?._id
    
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new APIError(400 , "Invalid User Id")
    }

    // 3

    const existingLike = await Like.findOne({comment : commentId , likedBy : userId})

    if(existingLike){
        await Like.deleteOne(existingLike)
        return res.status(200).json(new ApiResponse(200 , existingLike , "Like remove successfully"))
    }

   const like =  await Like.create({
        comment : commentId ,
        likedBy : userId
    })
    
    return res.status(200).json(new ApiResponse(200 , like , "Comment like successfully"))

})

const toggleTweetLike  = asyncHandler(async(req , res) => {
    // todo
    // 1) Get video id from params
    // 2) Get user id from req user
    // 3) check if the user and like found in data base delete if not add one by adding new record
    // 4) return response

    // 1)
    const {tweetId} = req.params

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new APIError(400 , "Invlid tweet id")
    }

    // 2)
    const userId = req.user?._id
    
    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new APIError(400 , "Invalid User Id")
    }

    // 3

    const existingLike = await Like.findOne({tweet : tweetId , likedBy : userId})

    if(existingLike){
        await Like.deleteOne(existingLike)
        return res.status(200).json(new ApiResponse(200 , existingLike , "Like remove successfully"))
    }

   const like =  await Like.create({
        tweet : tweetId ,
        likedBy : userId
    })
    
    return res.status(200).json(new ApiResponse(200 , like , "Tweet like successfully"))
})

const getallLike = asyncHandler(async(req , res) => {
    
})

export { toggleVideoLike , toggleCommentLike , toggleTweetLike}