require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Authenticate with DB
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');

        // Sync models
        await sequelize.sync();
        console.log('Database synced successfully.');

        // Create HTTP server
        const server = http.createServer(app);

        // Setup Socket.IO
        const io = new Server(server, {
            cors: {
                origin: 'http://localhost:5173',
                methods: ['GET', 'POST']
            }
        });

        // Store io in app to use in controllers
        app.set('socketio', io);

        io.on('connection', (socket) => {
            console.log('A user connected:', socket.id);
            
            // Lắng nghe event join room (room id là userID)
            socket.on('join', (userId) => {
                socket.join(userId);
                console.log(`User ${userId} joined room`);
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
            });
        });

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

startServer();