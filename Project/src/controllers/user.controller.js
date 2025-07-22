import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
  const { email, username, password } = req.body;

  // Check if username or email is provided
  if (!username || !email) {
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
      new : true
    }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  return res
  .status(200)
  .clearCookie("refreshToken" , option)
  .clearCookie("accessToken" , option)
  .json(
     new ApiResponse(200 , {} , "User Logged Out" )
  )
});

export { registerUser, loginUser, logoutUser };
