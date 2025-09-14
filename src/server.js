const express = require("express");
const handlebars = require("express-handlebars");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const { PORT, paths } = require("./config/config");
const viewsRouter = require("./routes/views/views.router");
const productsApiRouter = require("./routes/api/products.router");
const ProductManager = require("./managers/product.manager");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(paths.public));

app.engine(
  "hbs",
  handlebars.engine({
    extname: ".hbs",
    defaultLayout: "main",
    layoutsDir: path.join(paths.views, "layouts"),
    partialsDir: path.join(paths.views, "partials")
  })
);
app.set("view engine", "hbs");
app.set("views", paths.views);

app.use("/", viewsRouter);
app.use("/api/products", productsApiRouter);

app.set("io", io);

const productManager = new ProductManager();

io.on("connection", async (socket) => {
  console.log("Cliente conectado:", socket.id);

  const lista = await productManager.getAll();
  socket.emit("productos:actualizados", lista);

  socket.on("producto:create", async (datosProducto) => {
    try {
      await productManager.createOne(datosProducto);
      const listaNueva = await productManager.getAll();
      io.emit("productos:actualizados", listaNueva);
    } catch (error) {
      console.error("Error al crear por WS:", error.message);
    }
  });

  socket.on("producto:delete", async ({ idProducto }) => {
    try {
      await productManager.deleteOne(idProducto);
      const listaNueva = await productManager.getAll();
      io.emit("productos:actualizados", listaNueva);
    } catch (error) {
      console.error("Error al eliminar por WS:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado:", socket.id);
  });
});

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((error, req, res, _next) => {
  const estado = error.statusCode || 500;
  res.status(estado).json({ error: error.message || "Error interno del servidor" });
});

module.exports = { app, server, PORT };
