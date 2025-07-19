// Creating a custom error class named APIError that extends the built-in JavaScript Error class
class APIError extends Error {
  constructor(
    statusCode,                           // HTTP status code (e.g., 404, 500)
    message = "Something went wrong",     // Default error message if not provided
    errors = [],                          // Optional array of detailed error messages
    stack = ""                            // Optional stack trace (usually for debugging)
  ) {
    super(message)                        // Call the parent (Error) constructor with the message

    this.statusCode = statusCode          // Attach HTTP status code to the error
    this.data = null                      // Optional placeholder for any extra data 
    //                                       (can be used   if  needed)
    this.errors = errors                  // List of specific errors (e.g., validation errors)
    this.message = message                // Set error message
    this.success = false                  // Used to indicate the operation failed (consistent with API response format)

    // Set the error stack trace for debugging
    if (stack) {
      this.stack = stack                  // If custom stack trace is provided, use it
    } else {
      Error.captureStackTrace(this, this.constructor) 
      // Captures the current stack trace and attaches it to `this.stack`
      // Helps identify where the error occurred in the code
    }
  }
}

// Export the APIError class so it can be imported and used in other files
export { APIError }
