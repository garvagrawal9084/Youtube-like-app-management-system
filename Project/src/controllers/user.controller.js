import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation :- not empty
  // check uf user already exist : username , email
  // check for image ,  check for avatar available
  // upload them to cloudinary , avatar
  // create user object :- create entry in db
  // remove password and refreshtoken field from response
  // check for user creation
  // return response

  const { fullname, email, username, password } = req.body;
  console.log("req body", req.body);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new APIError(400, "All field are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  console.log("existed User :- ", existedUser);

  if (existedUser) {
    throw new APIError(409, "User already exist");
  }

  console.log("req.files:- ", req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  console.log("req.files?.avatar :- ", req.files?.avatar);
  console.log("req.files?.avatar[0] :- ", req.files?.avatar[0]);

  console.log("avatar local path :- ", avatarLocalPath);

  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    return new APIError(400, "Avatar file is required");
  }

  const avatarURL = await uploadOnCloudinary(avatarLocalPath);

  const coverImageURL = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarURL) {
    throw new APIError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullname,
    avatar: avatarURL.url,
    username: username.toLowerCase(),
    coverImage: coverImageURL?.url || "",
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if(!createdUser){
    throw new APIError(500 , "Something went wrong while registering a user")
  }

  return res.status(201).json(
    new ApiResponse(200 , createdUser , "User registered Successfully")
  )

});

export { registerUser };
