const fs = require("fs/promises");
const path = require("path");
const { paths } = require("../config/config");

class ProductManager {
  constructor(rutaArchivoProductos) {
    this.rutaArchivoProductos = rutaArchivoProductos || paths.productsFile;
  }

  async #ensureFile() {
    await fs.mkdir(path.dirname(this.rutaArchivoProductos), { recursive: true });
    try {
      await fs.access(this.rutaArchivoProductos);
    } catch {
      await fs.writeFile(this.rutaArchivoProductos, "[]", "utf-8");
    }
  }

  async #readJSON() {
    await this.#ensureFile();
    const contenido = await fs.readFile(this.rutaArchivoProductos, "utf-8");
    return contenido ? JSON.parse(contenido) : [];
  }

  async #writeJSON(lista) {
    await fs.writeFile(
      this.rutaArchivoProductos,
      JSON.stringify(lista, null, 2),
      "utf-8"
    );
  }

  async getAll() {
    return this.#readJSON();
  }

  async getById(idProducto) {
    const lista = await this.getAll();
    return lista.find((producto) => String(producto.id) === String(idProducto)) || null;
  }

  async createOne(datosProducto) {
    const requeridos = ["title", "description", "code", "price", "stock", "category"];
    const faltantes = requeridos.filter((campo) => datosProducto[campo] === undefined);
    if (faltantes.length) {
      const error = new Error(`Faltan campos: ${faltantes.join(", ")}`);
      error.statusCode = 400;
      throw error;
    }

    const lista = await this.getAll();
    const siguienteId = lista.length
      ? Math.max(...lista.map((p) => Number(p.id))) + 1
      : 1;

    const nuevoProducto = {
      id: siguienteId,
      title: String(datosProducto.title),
      description: String(datosProducto.description),
      code: String(datosProducto.code),
      price: Number(datosProducto.price),
      stock: Number(datosProducto.stock),
      category: String(datosProducto.category),
      thumbnails: Array.isArray(datosProducto.thumbnails)
        ? datosProducto.thumbnails.map(String)
        : []
    };

    lista.push(nuevoProducto);
    await this.#writeJSON(lista);
    return nuevoProducto;
  }

  async updateOne(idProducto, cambiosParciales) {
    const lista = await this.getAll();
    const indice = lista.findIndex((p) => String(p.id) === String(idProducto));
    if (indice === -1) return null;

    if ("id" in cambiosParciales) delete cambiosParciales.id;

    const seguro = { ...cambiosParciales };
    if ("price" in seguro) seguro.price = Number(seguro.price);
    if ("stock" in seguro) seguro.stock = Number(seguro.stock);
    if ("status" in seguro) seguro.status = Boolean(seguro.status);
    if ("thumbnails" in seguro && !Array.isArray(seguro.thumbnails)) {
      seguro.thumbnails = [];
    }

    lista[indice] = { ...lista[indice], ...seguro };
    await this.#writeJSON(lista);
    return lista[indice];
  }

  async deleteOne(idProducto) {
    const lista = await this.getAll();
    const indice = lista.findIndex((p) => String(p.id) === String(idProducto));
    if (indice === -1) return false;
    lista.splice(indice, 1);
    await this.#writeJSON(lista);
    return true;
  }
}

module.exports = ProductManager;