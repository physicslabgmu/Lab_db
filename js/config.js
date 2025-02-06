const config = {
    development: {
        apiUrl: 'http://localhost:3000/api/chat'
    },
    production: {
        apiUrl: 'https://your-deployed-api.com/api/chat'
    }
};

// Use this in chatbot.html instead of hardcoding the URL
const API_URL = config[environment].apiUrl;
