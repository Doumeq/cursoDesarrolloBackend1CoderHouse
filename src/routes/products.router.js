import { Router } from 'express';
import ProductManager from '../managers/product.manager.js';

const router = Router();
const manager = new ProductManager();


async function emitProductsUpdate(req) {
  const io = req.app.get('io'); 
  if (!io) return;
  
  const data = await manager.getAll({ limit: 50, page: 1 });
  const payload = data.payload || data; 
  io.emit('products:updated', payload);
}

router.get('/', async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const data = await manager.getAll({
      limit: Number(limit) || 10,
      page: Number(page) || 1,
      sort,
      query
    });

    if (data && data.payload) return res.json({ status: 'success', ...data });

    return res.json({
      status: 'success',
      payload: Array.isArray(data) ? data : [],
      totalPages: 1,
      prevPage: null,
      nextPage: null,
      page: Number(page) || 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevLink: null,
      nextLink: null
    });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const created = await manager.create(req.body);
    await emitProductsUpdate(req);
    res.status(201).json({ status: 'success', payload: created });
  } catch (e) { next(e); }
});

router.put('/:pid', async (req, res, next) => {
  try {
    const updated = await manager.update(req.params.pid, req.body);
    await emitProductsUpdate(req);
    res.json({ status: 'success', payload: updated });
  } catch (e) { next(e); }
});

router.delete('/:pid', async (req, res, next) => {
  try {
    await manager.delete(req.params.pid);
    await emitProductsUpdate(req);
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;
