// ✅ Multer is a middleware for handling multipart/form-data, mainly used for uploading files in Node.js
// ✅ It works with Express and saves uploaded files to your server or memory before further processing

import multer from "multer";

// ✅ We use multer.diskStorage to define where and how the uploaded files should be stored on the server
const storage = multer.diskStorage({
  
  // ✅ destination: sets the directory where uploaded files will be stored temporarily
  // req = request object
  // file = uploaded file object
  // cb = callback to signal completion
  destination: function (req, file, cb) {
    cb(null, "./public/temp"); // save files in 'public/temp' folder
  },

  // ✅ filename: sets the filename used to save the uploaded file
  // You can customize this to avoid file name conflicts or include timestamps
  filename: function (req, file, cb) {
    cb(null, file.originalname); // save file with its original name
  },
});

// ✅ Creating the multer middleware using the defined disk storage
// This 'upload' can now be used in your routes to handle file uploads
export const upload = multer({ storage: storage });
