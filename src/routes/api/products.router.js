const { Router } = require("express");
const ProductManager = require("../../managers/product.manager");

const router = Router();
const productManager = new ProductManager();

//GET /api/products
router.get("/", async (req, res, next) => {
  try {
    const listaProductos = await productManager.getAll();
    res.json(listaProductos);
  } catch (error) {
    next(error);
  }
});

//GET /api/products/:pid
router.get("/:pid", async (req, res, next) => {
  try {
    const { pid } = req.params;
    const producto = await productManager.getById(pid);
    if (!producto) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(producto);
  } catch (error) {
    next(error);
  }
});

//POST /api/products
router.post("/", async (req, res, next) => {
  try {
    const nuevoProducto = await productManager.createOne(req.body);
    res.status(201).json(nuevoProducto);

    const io = req.app.get("io");
    if (io) {
      const lista = await productManager.getAll();
      io.emit("productos:actualizados", lista);
    }
  } catch (error) {
    next(error);
  }
});

//PUT /api/products/:pid
router.put("/:pid", async (req, res, next) => {
  try {
    const { pid } = req.params;
    const actualizado = await productManager.updateOne(pid, req.body);
    if (!actualizado) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(actualizado);

    const io = req.app.get("io");
    if (io) {
      const lista = await productManager.getAll();
      io.emit("productos:actualizados", lista);
    }
  } catch (error) {
    next(error);
  }
});

//DELETE /api/products/:pid
router.delete("/:pid", async (req, res, next) => {
  try {
    const { pid } = req.params;
    const ok = await productManager.deleteOne(pid);
    if (!ok) return res.status(404).json({ error: "Producto no encontrado" });
    res.status(204).send();

    const io = req.app.get("io");
    if (io) {
      const lista = await productManager.getAll();
      io.emit("productos:actualizados", lista);
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
