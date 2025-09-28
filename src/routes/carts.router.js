import { Router } from 'express';
import {
    crearCarrito, getCarrito, agregarProductoAlCarrito,
    eliminarProductoDelCarrito, reemplazarProductosDelCarrito,
    actualizarCantidadProducto, vaciarCarrito
} from '../../controllers/carts.controller.js';

export const cartsRouter = Router();

cartsRouter.post('/', crearCarrito);
cartsRouter.get('/:cid', getCarrito);
cartsRouter.post('/:cid/product/:pid', agregarProductoAlCarrito);

cartsRouter.delete('/:cid/products/:pid', eliminarProductoDelCarrito);
cartsRouter.put('/:cid', reemplazarProductosDelCarrito);
cartsRouter.put('/:cid/products/:pid', actualizarCantidadProducto);
cartsRouter.delete('/:cid', vaciarCarrito);
