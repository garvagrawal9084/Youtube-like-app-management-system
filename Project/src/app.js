// Importing required modules
import express from "express"            // Core Express framework for creating server
import cors from "cors"                  // Enables Cross-Origin Resource Sharing (CORS)
import cookieParser from "cookie-parser" // Parses cookies attached to incoming client requests

// Creating an instance of the Express application
const app = express()

/*
    What is Middleware?
    -------------------
    Middleware functions are functions that have access to the request (req), response (res), 
    and the next middleware function in the application’s request-response cycle.
    They are used to modify the request or response objects, end the request-response cycle, 
    or call the next middleware in the stack.
*/

/*
    What is CORS?
    -------------
    CORS (Cross-Origin Resource Sharing) is a mechanism that allows a web application running 
    on one domain (origin) to access resources from a server on a different domain (origin).

    Why we use CORS?
    ----------------
    By default, browsers restrict cross-origin HTTP requests initiated from scripts for security.
    Using CORS allows us to explicitly allow certain origins to communicate with our backend server.
*/

// Enable CORS for the specified origin and allow credentials (like cookies and auth headers)
app.use(cors({
    origin: process.env.CORS_ORIGIN,    // Allowed origin, e.g., http://localhost:3000
    credentials: true                   // Allows cookies and headers to be sent with requests
}))

// Middleware to parse incoming JSON requests with a payload limit of 16kb
app.use(express.json({
    limit: "16kb"
}))

// Middleware to parse URL-encoded data (e.g., form submissions), with extended option and size limit
app.use(express.urlencoded({
    extended: true,     // Allows parsing of nested objects
    limit: "16kb"
}))

// Middleware to serve static files from the "public" folder
// Example: public/images/logo.png -> accessible at http://yourdomain.com/images/logo.png
app.use(express.static("public"))

// Middleware to parse cookies from the request headers
// Makes cookies accessible via req.cookies in route handlers
app.use(cookieParser())

// Exporting the Express app instance to be used in the main server file



// Routes import
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import commentRouter from "./routes/comment.routes.js"

// Routes declaration
app.use("/api/v1/users" , userRouter)
app.use("/api/v1/videos" , videoRouter)
app.use("/api/v1/comment" , commentRouter )
// http://localhost:8000/api/v1/users/register

export { app }
