import { ProductManager } from '../managers/product.manager.js';

const productManager = new ProductManager();
await productManager.init();

export async function renderHomeView(req, res, next) {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const result = await productManager.getAll({ limit, page, sort, query });
    res.render('home', {
      title: 'Productos',
      productos: result.payload,
      paginacion: {
        page: result.page,
        totalPages: result.totalPages,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevPage: result.prevPage,
        nextPage: result.nextPage
      }
    });
  } catch (error) { next(error); }
}

export async function renderRealTimeView(req, res, next) {
  try {
    const { payload } = await productManager.getAll({ limit: 100, page: 1 });
    res.render('realTimeProducts', { title: 'Tiempo real', productos: payload });
  } catch (error) { next(error); }
}

export async function listProducts(req, res, next) {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const result = await productManager.getAll({ limit, page, sort, query });

    const base = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
    const mkLink = (p) => p ? `${base}?limit=${limit}&page=${p}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}` : null;

    res.json({
      status: 'success',
      payload: result.payload,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: mkLink(result.prevPage),
      nextLink: mkLink(result.nextPage),
    });
  } catch (error) { next(error); }
}

export async function getProductById(req, res, next) {
  try {
    const producto = await productManager.getById(req.params.pid);
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) { next(error); }
}

export async function createProduct(req, res, next) {
  try {
    const creado = await productManager.create(req.body);
    res.status(201).json(creado);
  } catch (error) { next(error); }
}

export async function updateProduct(req, res, next) {
  try {
    const actualizado = await productManager.update(req.params.pid, req.body);
    if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(actualizado);
  } catch (error) { next(error); }
}

export async function deleteProduct(req, res, next) {
  try {
    const ok = await productManager.delete(req.params.pid);
    if (!ok) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).send();
  } catch (error) { next(error); }
}
