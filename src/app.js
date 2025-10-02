import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { create } from "express-handlebars";

import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

const hbs = create({
  extname: ".hbs",
  defaultLayout: "main",
  partialsDir: path.join(__dirname, "views", "partials"),
});
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

export default app;
