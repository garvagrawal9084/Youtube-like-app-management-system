# 🎬 YouTube-like App Management System

A YouTube-style video platform backend built with **Node.js, Express and MongoDB**. It covers user accounts with JWT authentication, video upload and management through Cloudinary, comments, likes, channel subscriptions and playlists. The repo also keeps the earlier learning stages (a basic Express server and a small React + Express full-stack starter) alongside the main project.

![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-media_storage-3448C5?logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)

## Features

- **User accounts:** register with avatar and cover image, log in, log out, change password, update profile details
- **JWT authentication:** access and refresh tokens, cookie-based sessions, protected routes via middleware
- **Channel profiles:** view any user's channel by username
- **Watch history:** track and fetch a user's watched videos
- **Video management:** publish (video + thumbnail), fetch by ID, list all videos, update, delete, and toggle publish status
- **Media storage:** uploads are handled with Multer and stored on Cloudinary, with cleanup of local temp files
- **Social features:** comments, likes, channel subscriptions and playlists
- **Pagination-ready queries:** uses `mongoose-aggregate-paginate-v2`
- **Security basics:** bcrypt password hashing, configurable CORS with credentials, request body size limits

## Tech Stack

| Area | Technology |
| --- | --- |
| Runtime and framework | Node.js (ES modules), Express 5 |
| Database | MongoDB with Mongoose, `mongoose-aggregate-paginate-v2` |
| Authentication | JSON Web Tokens, bcrypt, cookie-parser |
| File uploads | Multer + Cloudinary |
| Tooling | nodemon, dotenv, Prettier |

## Repository Structure

```
Youtube-like-app-management-system/
├── Basic/          # Learning stage: minimal Express server
├── FullStack/      # Learning stage: small Express backend + React (Vite) frontend with Axios
└── Project/        # Main project: the YouTube-like backend API
    ├── src/
    │   ├── index.js        # Entry point: connects to MongoDB, starts the server
    │   ├── app.js          # Express app, middleware and route mounting
    │   ├── db/             # MongoDB connection
    │   ├── models/         # Mongoose models
    │   ├── controllers/    # Request handlers (user, videos, ...)
    │   ├── routes/         # user, video, comment, like, subscription, playlist
    │   ├── middlewares/    # auth (verifyJWT) and multer upload
    │   └── utils/          # Cloudinary helpers
    └── package.json
```

## API Overview

Base URL: `http://localhost:<PORT>/api/v1`

### Users: `/users`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/register` | No | Register (multipart: `avatar`, `coverImage`) |
| `POST` | `/login` | No | Log in |
| `POST` | `/logout` | Yes | Log out |
| `POST` | `/refreshAccessToken` | No | Get a new access token |
| `POST` | `/change-password` | Yes | Change password |
| `GET` | `/get-user-info` | Yes | Current user info |
| `PATCH` | `/update-account-detail` | Yes | Update account details |
| `PATCH` | `/update-avatar` | Yes | Update avatar |
| `PATCH` | `/update-coverImage` | Yes | Update cover image |
| `GET` | `/c/:username` | Yes | Channel profile |
| `GET` | `/watch-history` | Yes | Watch history |

### Videos: `/videos`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | List all videos |
| `POST` | `/publish-video` | Yes | Publish a video (multipart: `video`, `thumbnail`) |
| `GET` | `/c/:videoId` | Yes | Get a video by ID |
| `PATCH` | `/update-video/c/:videoId` | Yes | Update a video |
| `DELETE` | `/delete-video/c/:videoId` | Yes | Delete a video |
| `PATCH` | `/toggle-publish/c/:videoId` | Yes | Toggle publish status |

### Other resources

| Prefix | Description |
| --- | --- |
| `/comment` | Video comments |
| `/like` | Likes |
| `/subscribe` | Channel subscriptions |
| `/playlist` | Playlists (see Known Issues) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- A MongoDB instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A free [Cloudinary](https://cloudinary.com/) account

### 1. Clone the repository

```bash
git clone https://github.com/garvagrawal9084/Youtube-like-app-management-system.git
cd Youtube-like-app-management-system/Project
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `Project/.env`:

```env
PORT=8000
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017

# Cloudinary
CLOUDINARY_NAME=your-cloud-name
API_KEY_CLOUDINARY=your-api-key
API_SECRET_CLOUDINARY=your-api-secret

# JWT (variable names are illustrative; match the names used in the code)
ACCESS_TOKEN_SECRET=replace-with-a-long-random-string
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=replace-with-another-long-random-string
REFRESH_TOKEN_EXPIRY=10d
```

`MONGODB_URI` is the base connection string. The database name is appended automatically from the project's constants.

### 4. Run the server

```bash
npm run dev
```

The API is now available at `http://localhost:8000/api/v1` (the server falls back to port 5000 if `PORT` is not set). Try it:

```
POST http://localhost:8000/api/v1/users/register
```

## Environment Variables

| Variable | Description |
| --- | --- |
| `PORT` | Server port (defaults to 5000) |
| `CORS_ORIGIN` | Allowed frontend origin for CORS |
| `MONGODB_URI` | MongoDB base connection string |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `API_KEY_CLOUDINARY` | Cloudinary API key |
| `API_SECRET_CLOUDINARY` | Cloudinary API secret |
| JWT secrets and expiries | Access and refresh token configuration |

## The Learning Stages

- **`Basic/`** is a minimal Express server (`npm start`) with dotenv, the starting point for the backend.
- **`FullStack/`** pairs a small Express backend with a React 19 + Vite frontend using Axios, showing how a client talks to an API.

## Known Issues and Roadmap

- [ ] The playlist router is mounted without a leading slash (`"api/v1/playlit"`), so playlist routes are not reachable at `/api/v1/playlist`. Fixing the path in `app.js` resolves this.
- [ ] No frontend for the main project yet (the `FullStack` frontend is a starter)
- [ ] Add a dashboard for channel stats and a tweets/community post module
- [ ] Add automated tests and API documentation (Postman collection or OpenAPI)
- [ ] Add Docker support

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes and push the branch
4. Open a pull request

## License

No license has been specified yet. Add a `LICENSE` file to define how others may use this project.
