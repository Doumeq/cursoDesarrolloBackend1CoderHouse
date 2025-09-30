import { Router } from 'express';
import { renderHomeView, renderRealTimeView } from '../controllers/products.controller.js';
import { renderCartView } from '../controllers/carts.controller.js';

const router = Router();

router.get('/', (req, res) => res.redirect('/products'));
router.get('/products', renderHomeView);
router.get('/realtimeproducts', renderRealTimeView);
router.get('/carts/:cid', renderCartView);

export default router;
