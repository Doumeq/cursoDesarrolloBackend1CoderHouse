import { Router } from 'express';
import {
  vistaHome, vistaProductos, vistaProductoDetalle,
  vistaCarrito, vistaRealTime
} from '../controllers/views.controller.js';

export const viewsRouter = Router();

viewsRouter.get('/', vistaHome);
viewsRouter.get('/products', vistaProductos);
viewsRouter.get('/products/:pid', vistaProductoDetalle);
viewsRouter.get('/carts/:cid', vistaCarrito);
viewsRouter.get('/realtimeproducts', vistaRealTime);
