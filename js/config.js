const config = {
    development: {
        apiUrl: 'http://localhost:3000/api/chat',
        host: 'localhost',
        cors: {
            origin: ['http://localhost:3000', 'http://localhost:5500', 'http://127.0.0.1:5500'],
            methods: ['GET', 'POST', 'OPTIONS']
        }
    },
    production: {
        apiUrl: 'https://physicslabgmu.onrender.com/api/chat',
        host: '0.0.0.0',
        cors: {
            origin: [
                'https://physicslabgmu.onrender.com',
                'https://physicslabgmu.github.io/Lab_db'
            ],
            methods: ['GET', 'POST', 'OPTIONS']
        }
    }
};

const environment = process.env.NODE_ENV || 'development';
module.exports = config[environment];
