# Physics Lab Chatbot Project

A chatbot application for the GMU Physics Lab that provides information and resources to students and faculty. The chatbot uses Google's Gemini AI model for natural language processing and includes authentication to protect access.

## Features

- Interactive chatbot interface
- JWT-based authentication
- Resource recommendation system
- Markdown formatting support
- URL database integration
- Error handling and user feedback

## Project Structure

```
Lab_db/
├── js/
│   ├── server.js            # Main server file
│   ├── chatbot-widget.js    # Chatbot UI and functionality
│   ├── auth-routes.js       # Authentication routes
│   ├── middleware/
│   │   └── auth.js         # Authentication middleware
│   └── file_urls.txt       # Database of resource URLs
├── login.html              # Login page
├── register.html           # Registration page
└── index.html             # Main application page
```

## Setup

1. Install dependencies:
```bash
npm install express cors dotenv @google/generative-ai jsonwebtoken bcryptjs
```

2. Create a `.env` file with the following variables:
```env
GEMINI_API_KEY=your_gemini_api_key
JWT_SECRET=your_jwt_secret
NODE_ENV=development
DEBUG=true
```

3. Start the server:
```bash
node js/server.js
```

## Authentication

The application uses JWT (JSON Web Token) for authentication. The authentication flow is as follows:

1. User logs in with username/password
2. Server validates credentials and returns a JWT
3. Client stores the JWT in localStorage
4. JWT is sent with each API request in the Authorization header
5. Server validates the JWT before processing requests

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Verify JWT token

### Chat
- `POST /api/chat` - Send message to chatbot

## Chatbot Features

1. **Resource Recommendation**
   - Analyzes user queries
   - Matches relevant URLs from database
   - Groups resources by course and type
   - Provides formatted links with icons

2. **Response Formatting**
   - Markdown support
   - Icons for different file types (🖼️ for images, 📄 for PDFs)
   - Clickable links
   - Line breaks support

3. **Error Handling**
   - Authentication errors
   - API errors
   - Network issues
   - Invalid responses

## Security Features

1. **JWT Authentication**
   - Token-based authentication
   - Secure password hashing with bcrypt
   - Token expiration
   - Protected routes

2. **Input Validation**
   - Username/password validation
   - Request body validation
   - URL validation and sanitization

3. **Error Handling**
   - Proper error messages
   - Secure error responses
   - Logging for debugging

## Development

1. **Debug Mode**
   - Set `DEBUG=true` in `.env`
   - Detailed logging
   - Error stack traces

2. **CORS Configuration**
   - Configured for development and production
   - Specific origin allowlist
   - Proper headers

## Production Deployment

1. Update CORS settings in `server.js`
2. Set proper environment variables
3. Use a production-ready database instead of in-memory storage
4. Enable HTTPS
5. Set proper security headers

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
