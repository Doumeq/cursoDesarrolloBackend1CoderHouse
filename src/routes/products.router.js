import { Router } from "express";
import {
  listarProductos,
  crearProducto,
  obtenerProducto,
  actualizarProducto,
  eliminarProducto,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", listarProductos);
router.get("/:pid", obtenerProducto);
router.post("/", crearProducto);
router.put("/:pid", actualizarProducto);
router.delete("/:pid", eliminarProducto);

export default router;
