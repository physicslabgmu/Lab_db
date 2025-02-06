const config = {
    development: {
        apiUrl: 'http://localhost:3000/api/chat',
        host: 'localhost'
    },
    production: {
        apiUrl: 'https://lab-db-dt81.onrender.com/api/chat', // Updated Render URL
        host: '0.0.0.0'
    }
};

const environment = process.env.NODE_ENV || 'development';
module.exports = config[environment];
