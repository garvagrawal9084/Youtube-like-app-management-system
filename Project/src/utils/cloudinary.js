// Importing Cloudinary SDK (v2) and Node.js 'fs' module
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuring Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: `${process.env.CLOUDINARY_NAME}`, // Cloudinary cloud name
  api_key: `${process.env.API_KEY_CLOUDINARY}`, // API key
  api_secret: `${process.env.API_SECRET_CLOUDINARY}`, // API secret
});

// Function to upload a local file to Cloudinary
const uploadOnCloudinary = async function (localFilePath) {
  console.log("INSIDE UPLOAD CLOUDINARY");
  try {
    // If no file path is provided, return immediately
    if (!localFilePath) {
      return;
    }

    // Uploading the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Auto-detect the file type (image, video, etc.)
    });

    // File uploaded successfully
    console.log(`✅ File uploaded on Cloudinary: ${response.url}`);
    return response; // Return the Cloudinary response object (contains URL, public_id, etc.)
  } catch (error) {
    // If upload fails, delete the file from local storage

    return null; // Return null to indicate failure
  } finally {
    fs.unlinkSync(localFilePath); // Cleanup: remove the temporary file
  }
};



const destroyImageOnCloudinary = async function(url){
  try {
    if(!url) return 

    const part = url.split("/")
    const fileNameWithExtension = part[part.length -1]
    const publicId = fileNameWithExtension.split(".")[0]

     const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image", // since it's a image
    });

    console.log("File Deleted On Cloudinary", response);
    return response;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
}
const destroyVideoOnCloudinary = async function(url){
  try {
    if(!url) return 

    const part = url.split("/")
    const fileNameWithExtension = part[part.length -1]
    const publicId = fileNameWithExtension.split(".")[0]

     const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video", // since it's a image
    });

    console.log("File Deleted On Cloudinary", response);
    return response;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return null;
  }
}


// Exporting the upload function for use in other files/modules
export { uploadOnCloudinary  , destroyImageOnCloudinary ,destroyVideoOnCloudinary };
