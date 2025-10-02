import { Router } from 'express';
import {
  getCart, removeFromCart, replaceCart, updateItemQty, clearCart,
  createCart, addToCart
} from '../controllers/carts.controller.js';

const router = Router();

router.post('/', createCart);

router.get('/:cid', getCart);

router.delete('/:cid/products/:pid', removeFromCart);

router.put('/:cid', replaceCart);

router.put('/:cid/products/:pid', updateItemQty);

router.delete('/:cid', clearCart);

router.post('/:cid/products/:pid', addToCart);

export default router;
