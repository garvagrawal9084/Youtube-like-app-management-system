import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { destroyImageOnCloudinary , destroyVideoOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";

const publishVideo = asyncHandler(async (req, res) => {
  // TODO
  // 1) Get the title , description from req body
  // 2) Check if we get title and description or not
  //   3) Get user id that upload the video using verifyJWT req.user
  // 4) Get Video local path by multer
  // 5) Check if we get video local path or not
  // 6) Get video thumbnail local path from multer
  // 7) Check if we get thumbail local path or not
  // 8) Upload video into cloudinary and get the url and check if we get url or not
  // 9) Upload thumnail into cloudinary and get the url and check if we get url or not
  // 10) create a db record
  // 11) return response

  // 1
  const { title, description } = req.body;

  // 2
  if (!(title && description)) {
    throw new APIError(200, "Title and Description are required");
  }

  //   3
  const id = req.user._id;

  console.log(req.files);

  // 3
  const videoLocalPath = req.files?.video[0]?.path;

  // 4
  if (!videoLocalPath) {
    throw new APIError(200, "Video is required");
  }

  // 5
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

  // 6
  if (!thumbnailLocalPath) {
    throw new APIError(400, "Thumbnail is required");
  }

  //   7
  const videoURL = await uploadOnCloudinary(videoLocalPath);

  if (!videoURL) {
    throw new APIError(500, "Server side error file cannot upload right now");
  }

  //   8
  const thumbnailURL = await uploadOnCloudinary(thumbnailLocalPath);

  if (!thumbnailURL) {
    throw new APIError(500, "Server side error file cannot upload right now");
  }

  const video = await Video.create({
    owner: id,
    videoFile: videoURL.url,
    thumbnail: thumbnailURL.url,
    title,
    description,
    duration: videoURL.duration,
  });

  const videopublished = await Video.findById(video._id);

  if (!videopublished) {
    throw new APIError(400, "File not uploaded");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, videopublished, "Video Upload Succesfully"));
});


// Can add more thing later
const getVideoById = asyncHandler(async (req, res) => {
  // Todo
  // 1) Get Video Id from Params
  // 2) Find the video with the help of ID
  // 3) Add the video in watch history of the user watching it (Additional if user already watched the video remove the previous one and add new one in front)
  // 4) Increase views of the videos
  // 5) Return the video

  // 1)
  const { videoId } = req.params;

  if (!videoId) {
    throw new APIError(400, "Invalid Params");
  }

  // 2)
  const video = await Video.findById(videoId);

  if (!video) {
    throw new APIError(200, "Video not found");
  }

  if(!video.isPublished){
    throw new APIError(200 , "Video is not published for public")
  }

  // 3)
  const userId = req.user?._id;

  if(!userId){
    throw new APIError(200 , "User not found")
  }

  await User.updateOne(
    {
      _id : userId ,
    },
    [
      {
        $set : {
          watchHistory : {
            $concatArrays : [
              [video._id] ,
              {
                $filter : {
                  input : "$watchHistory",
                  cond : {$ne : ["$$this" , video._id]}
                }
              }
            ]
          }
        }
      }
    ]
  ) 

  // 4)
  await Video.updateOne({_id : video._id} , {$inc : {views : 1}})

// 5)
  return res.status(200).json(new ApiResponse(200, { video }, "Get video Id"));
});

const updateVideo = asyncHandler(async (req , res) => {
  // Todo
  // 1) Get video Id from params
  // 2) Fetch video from database
  // 3) Get new video from User
  // 4) Update new video video to cloudinary
  // 5) if updated successfully delete old video
  // 6) update database by replacing old video url to new url
  // 7) return response

  // 1)
  const {videoId} = req.params 

  if(!videoId){
    throw new APIError(400 , "Invalid Params")
  }

  console.log("Video ID found " , videoId)

  // 2)

  const video = await Video.findById(videoId)

  if(!video){
    throw new APIError(400 , "Video not found")
  }

  console.log("Video found " , video)

  // 3)
  const newVideoLocalPath = req.file?.path

  if(!newVideoLocalPath){
    throw new APIError(400 , "Video is Missing")
  }

  console.log("New Video local path found " , newVideoLocalPath)

  // 4)

  const newVideo = await uploadOnCloudinary(newVideoLocalPath)

  if(!newVideo){
    throw new APIError(500 , "Cann't upload right now try again later")
  }

  console.log("New video upload on cloudinary " , newVideo)

  // 5)

  if(video.videoFile){
    await destroyOnCloudinary(video.videoFile)
  }

  console.log("Old video destroy " , video.videoFile)

  // 6) 
  const videoUpdate =  await Video.updateOne({_id : videoId} , {$set : {videoFile : newVideo.url }})

  
  if(!videoUpdate){
    throw new APIError(200 , "Video does not update successfully")
  }

  console.log("Video updated succesfully " , videoUpdate)
  
  // 7)
  return res.status(200).json(new ApiResponse(400 , {video} , "Video Updated Successfully"))


})

const deleteVideo = asyncHandler(async(req , res)=> {
  // Todo
  // 1)  Get video id from params
  // 2) Find video
  // 3) delete the video object
  // 4) return response

  // 1)
  const {videoId} = req.params

  console.log(videoId)

  if(!videoId){
    throw new APIError(400 , "Invalid URL")
  }
// 2)
  const video = await Video.findById(videoId)

  if(!video){
    throw new APIError(400 , "Video not found")
  }

  // 3)

  if(video.videoFile){
    await destroyVideoOnCloudinary(video.videoFile)
  }

  
  if(video.thumbnail){
    await destroyImageOnCloudinary((video.thumbnail))
  }

  const deleteVideo = await Video.deleteOne({_id : videoId})

// 4)

  return res.status(200).json(new ApiResponse(200 , deleteVideo , "Video Deleted Successfully"))

})

const togglePublishStatus = asyncHandler(async (req , res) => {
  // todo
  // 1) Get videoId from Params
  // 2) Find the video by videoID
  // 3) Update publish status
  // 4) Send response

  // 1)
  const {videoId} = req.params
  
  if(!videoId){
    throw new APIError(400, "Params not provided")
  }

  // 2)

  const video = await Video.findById(videoId)

  if(!video){
    throw new APIError(404 , "Video not found")
  }

  // 3)

  video.isPublished = !video.isPublished
  const response = await video.save()

  return res.status(200).json(new ApiResponse(200 , {isPublished : response.isPublished }, "Publish Toggle Successfully"))
})


export { publishVideo, getVideoById  , updateVideo , deleteVideo , togglePublishStatus};
