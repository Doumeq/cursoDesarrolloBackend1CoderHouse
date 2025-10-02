import 'dotenv/config';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './src/app.js';
import connectMongo from './src/db/mongo.js';

const PORT = process.env.PORT || 8080;

await connectMongo();

const httpServer = http.createServer(app);
const io = new SocketIOServer(httpServer, {
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('Socket conectado:', socket.id);
});

httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});





//Fuentes de guia
//como conectar Socket.IO con Express y un servidor HTTP "https://socket.io/docs/v4/server-initialization/"
//como integre Handlebars y use res.render "https://expressjs.com/en/guide/using-template-engines.html"
