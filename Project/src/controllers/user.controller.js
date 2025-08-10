import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import {
  destroyOnCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// We create a function to generate access token and refresh token
const generateAccessAndRefreshToken = async function (userId) {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken(); // Generate access token
    const refreshToken = user.generateRefreshToken(); // Generate refresh token

    user.refreshToken = refreshToken; // Add refersh token into user refresh token database
    await user.save({ validateBeforeSave: false }); // Save it (we use validateBeforeSave because when we try to save a field in database it also kick other and it can show error because require field is not provided that why we use validateBeforeSave: false as it make all the validate turn off)

    return { accessToken, refreshToken };
  } catch (error) {
    throw new APIError(
      500,
      "Something went wrong while generating refresh and access token"
    );
  }
};

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
  // console.log("req body", req.body);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new APIError(400, "All field are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  // console.log("existed User :- ", existedUser);

  if (existedUser) {
    throw new APIError(409, "User already exist");
  }

  // console.log("req.files:- ", req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  // console.log("req.files?.avatar :- ", req.files?.avatar);
  // console.log("req.files?.avatar[0] :- ", req.files?.avatar[0]);

  // console.log("avatar local path :- ", avatarLocalPath);

  // console.log(req.files?.coverImage?.[0]?.path || "")

  const coverImageLocalPath = req.files?.coverImage?.[0]?.path || "";

  // console.log("coverImage local path :- ", coverImageLocalPath)
  if (!avatarLocalPath) {
    return new APIError(400, "Avatar file is required");
  }

  const avatarURL = await uploadOnCloudinary(avatarLocalPath);

  // console.log("Avatar URL " , avatarURL)

  let coverImageURL;

  if (coverImageLocalPath !== "") {
    coverImageURL = await uploadOnCloudinary(coverImageLocalPath);
  }

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

  if (!createdUser) {
    throw new APIError(500, "Something went wrong while registering a user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // Todo :-

  // get data from req body
  // if email / username exist in the data base
  // if user exist or the user is a new user
  // check if email / username and password in database
  // generate a access token and generate a refresh token
  // send cookie (to send token)
  // respond succesfully login

  // Solution

  // get enail , usernane , password from user
  const { email, username, password } = req?.body;
  console.log(req.body);

  // Check if username or email is provided
  if (!(username || email)) {
    throw new APIError(400, "Username or email is required");
  }

  // Check if user already exist
  const userExist = await User.findOne({
    $or: [{ email }, { username }],
  });

  // If user does not exist return error to create account
  if (!userExist) {
    throw new APIError(404, "User does not exist create a account");
  }

  // if user exist check password match the password from database
  const isPasswordValid = await userExist.isPasswordCorrect(password);

  // If passwor is not correct
  if (!isPasswordValid) {
    throw new APIError(404, "Incorrect Password");
  }

  // Get access token and refresh token return from generateAccessAndRefreshToken()
  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    userExist._id
  );

  // get updated loggedInUser (we can also update the existing userExist)
  const loggedInUser = await User.findById(userExist._id).select(
    "-password -refreshToken"
  );

  //  Send Cookies by doing httpOnly and secure http frontend can't update the cookies
  const option = {
    httpOnly: true,
    secure: true,
  };

  // Send response with status code , cookie and json data
  return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "User logged In succesfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // todo :-

  // Clear cookie
  // Reset refresh token

  const id = req.user._id; // we get by the help of verifyJwt middleware

  await User.findByIdAndUpdate(
    id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", option)
    .clearCookie("accessToken", option)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  // I should get user refresh token from req.cookie
  // Verify it with the refresh token store in the database
  // if is match generate a new access token
  // Send that token to user

  // Check for incoming token
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body?.refreshToken;

  // check if we get token or not
  if (!incomingRefreshToken) {
    throw new APIError(401, "Unauthorized Request");
  }

  // Decode the token
  try {
    const decordedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    console.log("DEcoded token ", decordedToken);

    // Get user from DB with the id in decodedToken
    const user = await User.findById(decordedToken?._id).select("-password");

    // Check if user exist with id receive from decorded Token
    if (!user) {
      throw new APIError(401, "Invalid Refresh Token");
    }

    // Verify if the incoming token and refresh token in database are same
    if (incomingRefreshToken !== user.refreshToken) {
      throw new APIError(401, "Refresh Token is expired or used");
    }

    // Generate new refresh Token and Access Token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    // Send response
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          201,
          {
            user: user,
            accessToken: accessToken,
            refreshToken: refreshToken,
          },
          "Access Token refresh"
        )
      );
  } catch (error) {
    throw new APIError(401, error?.message || "Invaid Refresh Token");
  }
});

const changeCurrectPassword = asyncHandler(async (req, res) => {
  // Get oldPassword , newPassword from body
  const { oldPassword, newPassword } = req.body;

  if (!(oldPassword || newPassword)) {
    throw new APIError(401, "Both Old and New Password is required");
  }

  // Get user id info from req.user that we get from verifyJWT middleware
  const id = req.user._id;

  // Find user
  const user = await User.findById(id);

  // check if old password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new APIError(400, "Invalid Password");
  }

  // Update with new Password
  user.password = newPassword;

  // Save
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(201, {}, "Password succesfully updated"));
});

const getCurrentUserInfo = asyncHandler(async (req, res) => { 
  return res.status(200).json(new ApiResponse(200, req.user, "currect user info"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  // Get information from req.body
  const { fullname, email } = req.body;

  if (!fullname || !email) {
    throw new APIError(400, "All field are required");
  }

  const id = req.user?._id;

  const user = await User.findByIdAndUpdate(
    id,
    {
      $set: {
        fullname: fullname,
        email: email,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  // Todo
  // Get avatar localStorage
  // Update the avatar with cloudinary avatar
  // Get new avatar url
  // Update it in the database

  // Get avatar local path from req.file(multer)
  const avatarLocalPath = req.file?.path;

  // Check of we local path or not
  if (!avatarLocalPath) {
    throw new APIError(400, "Avatar file is missing");
  }

  // Upload the avatar to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);

  // Check if we get url or not
  if (!avatar.url) {
    throw new APIError(500, "Error while uploading on avatar");
  }

  //  Get id from req.user from verifyJWT middleware
  const id = req.user._id;

  // Get user 
  const user = await User.findById(id).select("-password -refreshToken")

  // Delete the file from cloudinary

  if(user.avatar){
     await destroyOnCloudinary(user.avatar);
  }

  // update the old url with new url in database
  user.avatar = avatar.url
  await user.save()  

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar updated successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  // Todo
  // Get coverImage localStorage
  // Update the coverImage with cloudinary avatar
  // Get new coverImage url
  // Update it in the database

  // Get avatar local path from req.file(multer)
  const coverImageLocalPath = req.file?.path;

  // Check of we local path or not
  if (!coverImageLocalPath) {
    throw new APIError(400, "Cover Image file is missing");
  }

  // Upload the avatar to cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // Check if we get url or not
  if (!coverImage.url) {
    throw new APIError(500, "Error while uploading on Cover Image");
  }

  //  Get id from req.user from verifyJWT middleware
  const id = req.user._id;

  // Get user 
  const user = await User.findById(id).select("-password -refreshToken")

  // Delete the file from cloudinary

  if(user.coverImage){
     await destroyOnCloudinary(user.coverImage);
  }

  user.coverImage = coverImage.url
  await user.save()  

  // return response
  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated successfully"));
});

const getUserChannelProfile = asyncHandler(async (req , res) =>{

  // Find username from URL params
  const {username} = req.params

  // Check if we get username or not
  if(!username?.trim()){
    throw new APIError(400 , "Username is missing")
  }

  // Using aggreagate function to get subsctiber count , the channel subscribe to and if the user has subscribe to the channel or not
  const channel = await User.aggregate([
    {
      $match : {
        username : username.toLowerCase()
      } 
    } , 
    {
      $lookup : {
        from : "subscriptions",
        localField:"_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup : {
        from : "subscriptions",
        localField:"_id",
        foreignField: "subscribers",
        as: "subscribedTo"
      }
    },
    {
      $addFields : {
        subscibersCount : {
          $size : "$subscribers"
        },
        channelSubscribedToCount : {
          $size : "$subscribedTo"
        },
        isSubscribed:{
          $cond : {
            if : {$in: [req.user?._id , "$subscribers.subscriber"]} , 
            then : true ,
            else : false
          }
        }
      }
    },
    {
      $project : {
        fullname : 1 ,
        username : 1 ,
        subscibersCount : 1 ,
        channelSubscribedToCount : 1 , 
        isSubscribed : 1 ,
        avatar : 1 ,
        coverImage : 1 ,
        email : 1
      }
    }
  ])

  console.log("channel value" , channel)

  // Check if we get channel or not
  if(!channel?.length){
    new APIError(400 , "Channel does not exist")
  } 

  // Channel return an array of object as we use match we only get one object so we send channel[0]
  return res.status(200).json(new ApiResponse(200 , channel[0] , "User channel fetch successfully"))

})

const getUserWatchHistory = asyncHandler(async(req , res) => {
  const user = await User.aggregate([
    {
      $match : {
        _id : new mongoose.Types.ObjectId(req.user?._id)
      }
    },
    {
      $lookup : {
        from : "videos" ,
        localField : "watchHistory",
        foreignField : "_id",
        as : "watchHistory",
        pipeline : [
          {
             $lookup : {
              from : "User",
              localField : "owner" ,
              foreignField : "_id",
              as : "owner",
              pipeline : [
                {
                  $project : {
                    fullname : 1 ,
                    username : 1 ,
                    avatar : 1 
                  }
                }
              ]
             }
          },
          {
             $addFields : {
              owner : {
                $first : "$owner"
              }
             }
          }
        ]  
      }
    }
  ])   
  
  return res.status(200).json(new ApiResponse(200 , user[0].watchHistory ,  "Watch History fetch successfully"))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrectPassword,
  getCurrentUserInfo,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getUserWatchHistory
};
