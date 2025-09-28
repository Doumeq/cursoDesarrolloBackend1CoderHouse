import { Router } from 'express';
import {
  getProductos, getProductoPorId, crearProducto,
  actualizarProducto, eliminarProducto
} from '../../controllers/products.controller.js';

export const productsRouter = Router();

productsRouter.get('/', getProductos);
productsRouter.get('/:pid', getProductoPorId);
productsRouter.post('/', crearProducto);
productsRouter.put('/:pid', actualizarProducto);
productsRouter.delete('/:pid', eliminarProducto);
