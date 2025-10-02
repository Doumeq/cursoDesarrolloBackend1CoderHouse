import { Router } from 'express';
import { renderHomeView, renderRealTimeView, renderProductDetail } from '../controllers/products.controller.js';
import { renderCartView } from '../controllers/carts.controller.js';

const router = Router();

router.get('/products/:pid', renderProductDetail);
router.get('/products', renderHomeView);
router.get('/realtimeproducts', renderRealTimeView);
router.get('/carts/:cid', renderCartView);

router.get('/', (req, res) => res.redirect('/products'));

export default router;
