import { Router } from "express";
import {
  crearCarrito,
  obtenerCarrito,
  agregarProductoAlCarrito,
  eliminarProductoDelCarrito,
  reemplazarProductosDelCarrito,
  actualizarCantidad,
  vaciarCarrito,
} from "../controllers/carts.controller.js";

const router = Router();

router.post("/", crearCarrito);
router.get("/:cid", obtenerCarrito);
router.post("/:cid/product/:pid", agregarProductoAlCarrito);

router.delete("/:cid/products/:pid", eliminarProductoDelCarrito);
router.put("/:cid", reemplazarProductosDelCarrito);
router.put("/:cid/products/:pid", actualizarCantidad);
router.delete("/:cid", vaciarCarrito);

export default router;
