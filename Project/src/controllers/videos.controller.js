import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";

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
const id = req.user._id

console.log(req.files)


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
  const videoURL = await uploadOnCloudinary(videoLocalPath)

  if(!videoURL){
    throw new APIError(500 , "Server side error file cannot upload right now")
  }

//   8 
const thumbnailURL = await uploadOnCloudinary(thumbnailLocalPath)

if(!thumbnailURL){
    throw new APIError(500 , "Server side error file cannot upload right now")
}

const video = await Video.create({
    owner : id ,
    videoFile : videoURL.url ,
    thumbnail : thumbnailURL.url ,
    title ,
    description ,
    duration : videoURL.duration
})

const videopublished = await Video.findById(video._id)

if(!videopublished){
    throw new APIError(400 , "File not uploaded")
}

return res.status(200).json(new ApiResponse(200 , videopublished , "Video Upload Succesfully"))

});

const getVideoById = asyncHandler(async (req , res) => {
    const {videoId} = req.params
})

export {publishVideo}
