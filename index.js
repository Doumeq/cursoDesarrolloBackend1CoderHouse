import 'dotenv/config.js';          
import { servidorHttp, PORT } from './src/server.js';

servidorHttp.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`);
});


//Fuentes de guia
//como conectar Socket.IO con Express y un servidor HTTP "https://socket.io/docs/v4/server-initialization/"
//como integre Handlebars y use res.render "https://expressjs.com/en/guide/using-template-engines.html"
