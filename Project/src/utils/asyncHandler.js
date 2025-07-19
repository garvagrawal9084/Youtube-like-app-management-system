// A utility function to handle errors in async route handlers or middleware
const asyncHandler = (fn) => 
  // Returning a new async function that Express can use as middleware
  async (req, res, next) => {
    try {
      // Execute the passed async function (usually a controller)
      // If it succeeds, everything works as expected
      await fn(req, res, next)
    } catch (error) {
      // If the async function throws an error, catch it here
      // Send a standardized error response
      res.status(error.code || 500).json({
        success: false,             // Indicates failure in response
        message: error.message      // Error message to send back to client
      })
    }
  }

// Export the asyncHandler function so it can be reused in routes/controllers
export { asyncHandler }
