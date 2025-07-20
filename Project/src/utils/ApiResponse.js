// Defining a standard API response structure
class ApiResponse {
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode      // HTTP status code (e.g., 200, 201, 400, etc.)
        this.data = data                  // Actual data to send in the response (e.g., user info, list, etc.)
        this.message = message            // Optional message (defaults to "Success" if not provided)
        this.success = statusCode < 400   // Automatically sets success to true if statusCode is less than 400                                   // i.e., status codes < 400 are considered successful responses
    }
}

export {ApiResponse}
