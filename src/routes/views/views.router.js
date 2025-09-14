const { Router } = require("express");
const ProductManager = require("../../managers/product.manager");

const router = Router();
const productManager = new ProductManager();

//GET / 
router.get("/", async (req, res, next) => {
  try {
    const listaProductos = await productManager.getAll();
    res.render("home", { productos: listaProductos });
  } catch (error) {
    next(error);
  }
});

//GET /realtimeproducts
router.get("/realtimeproducts", async (req, res, next) => {
  try {
    const listaProductos = await productManager.getAll();
    res.render("realTimeProducts", { productos: listaProductos });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
