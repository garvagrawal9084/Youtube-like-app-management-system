// This middleware  is to verify if there is any user or not

import { APIError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  // Get token from cookies or from header
 try {
     const token =
       req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1];
   
     //    Check if we get token or not
     if (!token) {
       throw new APIError(401, "Unauthorized request");
     }
   
   //   Decode token to get the data store in it
    const decordedToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
   
   //  Find the user
    const user = await User.findById(decordedToken._id).select("-password -refreshToken")
   
   //  Check the user
    if(!user){
       throw new APIError(401 , "Invalid access token")
    }
   
    // Add user information inside req
    req.user = user
    next()
 } catch (error) {
    throw new APIError(401 , error?.message || "Invalid access token")
 }

});

