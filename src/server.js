import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';

const PORT = process.env.PORT || 8080;

const servidorHttp = http.createServer(app);

const io = new SocketIOServer(servidorHttp, {
  cors: { origin: '*' } 
});

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

});

app.set('io', io);

export { servidorHttp, io, PORT };
