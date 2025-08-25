import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIRECTORIO_DATOS = path.join(__dirname, "data");
const ARCHIVO_PRODUCTOS = path.join(DIRECTORIO_DATOS, "products.json");
const ARCHIVO_CARRITOS = path.join(DIRECTORIO_DATOS, "carts.json");

class GestorTienda {
  constructor(archivoProductos, archivoCarritos) {
    this.archivoProductos = archivoProductos;
    this.archivoCarritos = archivoCarritos;
  }

  static proximoId(lista) {
    return lista.length
      ? Math.max(...lista.map((item) => Number(item.id))) + 1
      : 1;
  }

  async iniciar() {
    await fs.mkdir(DIRECTORIO_DATOS, { recursive: true });
    await this.#asegurarArchivo(this.archivoProductos, []);
    await this.#asegurarArchivo(this.archivoCarritos, []);
  }

  async #asegurarArchivo(rutaArchivo, valorPorDefecto) {
    try {
      await fs.access(rutaArchivo);
    } catch {
      await fs.writeFile(
        rutaArchivo,
        JSON.stringify(valorPorDefecto, null, 2),
        "utf-8"
      );
    }
  }

  async #leerJSON(rutaArchivo) {
    const crudo = await fs.readFile(rutaArchivo, "utf-8");
    return crudo ? JSON.parse(crudo) : [];
  }

  async #escribirJSON(rutaArchivo, datos) {
    await fs.writeFile(rutaArchivo, JSON.stringify(datos, null, 2), "utf-8");
  }

  async obtenerTodosLosProductos() {
    return this.#leerJSON(this.archivoProductos);
  }

  async obtenerProductoPorId(pid) {
    const productos = await this.obtenerTodosLosProductos();
    return (
      productos.find((producto) => String(producto.id) === String(pid)) || null
    );
  }

  async crearProducto(datos) {
    const requeridos = [
      "title",
      "description",
      "code",
      "price",
      "stock",
      "category",
    ];
    const faltantes = requeridos.filter((clave) => datos[clave] === undefined);
    if (faltantes.length) {
      const error = new Error(
        `Faltan campos requeridos: ${faltantes.join(", ")}`
      );
      error.statusCode = 400;
      throw error;
    }

    const productos = await this.obtenerTodosLosProductos();
    const idNuevo = GestorTienda.proximoId(productos);

    const nuevoProducto = {
      id: idNuevo,
      title: String(datos.title),
      description: String(datos.description),
      code: String(datos.code),
      price: Number(datos.price),
      status: datos.status === undefined ? true : Boolean(datos.status),
      stock: Number(datos.stock),
      category: String(datos.category),
      thumbnails: Array.isArray(datos.thumbnails)
        ? datos.thumbnails.map(String)
        : [],
    };

    productos.push(nuevoProducto);
    await this.#escribirJSON(this.archivoProductos, productos);
    return nuevoProducto;
  }

  async actualizarProducto(pid, datosParciales) {
    const productos = await this.obtenerTodosLosProductos();
    const indice = productos.findIndex(
      (producto) => String(producto.id) === String(pid)
    );
    if (indice === -1) return null;

    if ("id" in datosParciales) delete datosParciales.id;

    const datosSeguros = { ...datosParciales };
    if ("price" in datosSeguros)
      datosSeguros.price = Number(datosSeguros.price);
    if ("stock" in datosSeguros)
      datosSeguros.stock = Number(datosSeguros.stock);
    if ("status" in datosSeguros)
      datosSeguros.status = Boolean(datosSeguros.status);
    if (
      "thumbnails" in datosSeguros &&
      !Array.isArray(datosSeguros.thumbnails)
    ) {
      datosSeguros.thumbnails = [];
    }

    productos[indice] = { ...productos[indice], ...datosSeguros };
    await this.#escribirJSON(this.archivoProductos, productos);
    return productos[indice];
  }

  async eliminarProducto(pid) {
    const productos = await this.obtenerTodosLosProductos();
    const indice = productos.findIndex(
      (producto) => String(producto.id) === String(pid)
    );
    if (indice === -1) return false;
    productos.splice(indice, 1);
    await this.#escribirJSON(this.archivoProductos, productos);
    return true;
  }

  async obtenerTodosLosCarritos() {
    return this.#leerJSON(this.archivoCarritos);
  }

  async crearCarrito() {
    const carritos = await this.obtenerTodosLosCarritos();
    const idNuevo = GestorTienda.proximoId(carritos);
    const nuevoCarrito = { id: idNuevo, products: [] };
    carritos.push(nuevoCarrito);
    await this.#escribirJSON(this.archivoCarritos, carritos);
    return nuevoCarrito;
  }

  async obtenerCarritoPorId(cid) {
    const carritos = await this.obtenerTodosLosCarritos();
    return (
      carritos.find((carrito) => String(carrito.id) === String(cid)) || null
    );
  }

  async agregarProductoAlCarrito(cid, pid, cantidad = 1) {
    const [carrito, producto] = await Promise.all([
      this.obtenerCarritoPorId(cid),
      this.obtenerProductoPorId(pid),
    ]);

    if (!carrito) return { error: "CART_NOT_FOUND" };
    if (!producto) return { error: "PRODUCT_NOT_FOUND" };

    const existente = carrito.products.find(
      (item) => String(item.product) === String(pid)
    );
    if (existente) {
      existente.quantity += Number(cantidad) || 1;
    } else {
      carrito.products.push({
        product: producto.id,
        quantity: Number(cantidad) || 1,
      });
    }

    const carritos = await this.obtenerTodosLosCarritos();
    const indice = carritos.findIndex((c) => String(c.id) === String(cid));
    carritos[indice] = carrito;
    await this.#escribirJSON(this.archivoCarritos, carritos);
    return carrito;
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

const gestor = new GestorTienda(ARCHIVO_PRODUCTOS, ARCHIVO_CARRITOS);
await gestor.iniciar();

const productosRouter = express.Router();

productosRouter.get("/", async (req, res, next) => {
  try {
    const productos = await gestor.obtenerTodosLosProductos();
    res.json(productos);
  } catch (error) {
    next(error);
  }
});

productosRouter.get("/:pid", async (req, res, next) => {
  try {
    const producto = await gestor.obtenerProductoPorId(req.params.pid);
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (error) {
    next(error);
  }
});

productosRouter.post("/", async (req, res, next) => {
  try {
    const creado = await gestor.crearProducto(req.body);
    res.status(201).json(creado);
  } catch (error) {
    next(error);
  }
});

productosRouter.put("/:pid", async (req, res, next) => {
  try {
    const actualizado = await gestor.actualizarProducto(
      req.params.pid,
      req.body
    );
    if (!actualizado)
      return res.status(404).json({ error: "Producto no encontrado" });
    res.json(actualizado);
  } catch (error) {
    next(error);
  }
});

productosRouter.delete("/:pid", async (req, res, next) => {
  try {
    const ok = await gestor.eliminarProducto(req.params.pid);
    if (!ok) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.use("/api/products", productosRouter);

const carritosRouter = express.Router();

carritosRouter.post("/", async (_req, res, next) => {
  try {
    const carrito = await gestor.crearCarrito();
    res.status(201).json(carrito);
  } catch (error) {
    next(error);
  }
});

carritosRouter.get("/:cid", async (req, res, next) => {
  try {
    const carrito = await gestor.obtenerCarritoPorId(req.params.cid);
    if (!carrito)
      return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(carrito.products);
  } catch (error) {
    next(error);
  }
});

carritosRouter.post("/:cid/product/:pid", async (req, res, next) => {
  try {
    const { cid, pid } = req.params;
    const cantidad = 1;
    const resultado = await gestor.agregarProductoAlCarrito(cid, pid, cantidad);

    if (resultado?.error === "CART_NOT_FOUND") {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }
    if (resultado?.error === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
});

app.use("/api/carts", carritosRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use((error, _req, res, _next) => {
  const status = error.statusCode || 500;
  res.status(status).json({
    error: error.message || "Error interno del servidor",
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
