# Solo Sparks Backend

## Overview
Solo Sparks is an emotional intelligence and self-growth application designed to help users improve their mental well-being through personalized quests, reflections, and rewards. This backend is built using Node.js, Express, MongoDB, and various other technologies to provide a robust API for the application.

## Features
- **Authentication**: Secure user registration and login using JWT.
- **User Management**: Manage user profiles, moods, and completed quests.
- **Quests**: Personalized quests based on user mood and personality.
- **Reflections**: Users can submit reflections with media uploads.
- **Spark Points System**: Users earn points for submitting reflections and can redeem them for rewards.
- **Rewards**: Users can view and redeem rewards based on their points.

## Tech Stack
- **Node.js**: JavaScript runtime for building the backend.
- **Express.js**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing user data, quests, reflections, and rewards.
- **Mongoose**: ODM for MongoDB to manage data models.
- **Cloudinary**: Media upload service for handling images and audio.
- **JWT**: For secure authentication.
- **Multer**: Middleware for handling file uploads.

## Project Structure
```
src
├── config
│   ├── cloudinary.js
│   └── db.js
├── controllers
│   ├── authController.js
│   ├── questController.js
│   ├── reflectionController.js
│   ├── rewardController.js
│   └── userController.js
├── middleware
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   └── uploadMiddleware.js
├── models
│   ├── Quest.js
│   ├── Reflection.js
│   ├── Reward.js
│   └── User.js
├── routes
│   ├── authRoutes.js
│   ├── questRoutes.js
│   ├── reflectionRoutes.js
│   ├── rewardRoutes.js
│   └── userRoutes.js
├── utils
│   ├── generateToken.js
│   └── validators.js
├── seeders
│   ├── questSeeder.js
│   └── rewardSeeder.js
├── app.js
└── server.js
```

## Setup Instructions
1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd solo-sparks-backend
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env` and fill in the required values.

4. **Run the application**:
   ```
   npm start
   ```

5. **Access the API**:
   The API will be available at `http://localhost:5000/api`.

## API Documentation
Refer to the individual route files in the `src/routes` directory for detailed API endpoints and usage.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.