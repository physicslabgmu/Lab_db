const config = {
    development: {
        apiUrl: 'http://localhost:10000/api/chat', // Updated port
        host: 'localhost',
        cors: {
            origin: ['http://localhost:10000'],
            methods: ['GET', 'POST', 'OPTIONS']
        }
    },
    production: {
        apiUrl: 'https://lab-db-dt81.onrender.com/api/chat',
        host: '0.0.0.0',
        cors: {
            origin: [
                'https://lab-db-dt81.onrender.com',
                'https://physicslabgmu.github.io'
            ],
            methods: ['GET', 'POST', 'OPTIONS']
        }
    }
};

const environment = process.env.NODE_ENV || 'development';
module.exports = config[environment];
