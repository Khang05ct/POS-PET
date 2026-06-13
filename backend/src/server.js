require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const createApp = require('./app');
const socketHandler = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;

const io = new Server({
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

const app = createApp(io);
const server = http.createServer(app);

io.attach(server);

// Socket.IO handler
socketHandler(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
