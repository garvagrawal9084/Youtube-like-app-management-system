// Importing required modules
import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"; // For generating JWT tokens
import bcrypt from "bcrypt";     // For hashing and comparing passwords

// Defining the user schema structure
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,     // Ensures no two users have the same username
      lowercase: true,  // Saves the username in lowercase
      trim: true,       // Removes leading/trailing whitespace
      index: true,      // Adds an index to improve search speed
    },
    email: {
      type: String,
      required: true,
      unique: true,     // Email must be unique
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,      // Indexed for fast searching by name
    },
    avatar: {
      type: String,      // URL of the user's avatar (hosted on Cloudinary)
      required: true,
    },
    coverImage: {
      type: String,      // Optional cover image URL (Cloudinary)
    },

    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",    // Reference to the `Video` model
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"], // Custom error message
    },
    refreshToken: {
      type: String,     // Stores the refresh token for session management
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// Middleware that runs before saving a user to the database
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // If password is modified, hash it before saving
    this.password = await bcrypt.hash(this.password, 10); // Hash with saltRounds = 10
  }
  next(); // Move to the next middleware or save process
});

// Custom method to compare plain password with hashed one
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Custom method to generate a short-lived access token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullname: this.fullname,
    },
    process.env.ACCESS_TOKEN_SECRET, // Secret key for signing
    {
      expiresIn: process.env.ACESS_TOKEN_EXPIRY, // Token expiry time from .env
    }
  );
};

// Custom method to generate a long-lived refresh token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET, // Separate secret for refresh token
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

// Export the User model based on the schema
export const User = mongoose.model("User", userSchema);
