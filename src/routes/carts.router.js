import { Router } from 'express';
import {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  updateAllCartProducts,
  updateCartProductQuantity,
  clearCart,
} from '../controllers/carts.controller.js';

const router = Router();

router.post('/', createCart);
router.get('/:cid', getCartById);
router.post('/:cid/product/:pid', addProductToCart);

router.delete('/:cid/products/:pid', removeProductFromCart);
router.put('/:cid', updateAllCartProducts);
router.put('/:cid/products/:pid', updateCartProductQuantity);
router.delete('/:cid', clearCart);

export default router;
