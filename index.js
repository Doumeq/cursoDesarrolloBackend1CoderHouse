const { server, PORT } = require("./src/server");

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});

//Fuentes de guia
//como conectar Socket.IO con Express y un servidor HTTP "https://socket.io/docs/v4/server-initialization/"
//como integre Handlebars y use res.render "https://expressjs.com/en/guide/using-template-engines.html"
