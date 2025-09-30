import { httpServer, PORT } from './src/app.js';
import 'dotenv/config';
import { conectarMongo } from './src/db/mongo.js';
import { server, PORT } from './src/server.js';

await conectarMongo();
server.listen(PORT, () => console.log(`HTTP listo en :${PORT}`));

httpServer.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


//Fuentes de guia
//como conectar Socket.IO con Express y un servidor HTTP "https://socket.io/docs/v4/server-initialization/"
//como integre Handlebars y use res.render "https://expressjs.com/en/guide/using-template-engines.html"
