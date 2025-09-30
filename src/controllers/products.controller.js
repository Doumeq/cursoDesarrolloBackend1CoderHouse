import { Product } from '../models/product.model.js';

export async function listarProductos(req, res, next) {
  try {
    const limiteNum = Math.max(1, parseInt(req.query.limit ?? 10));
    const paginaNum = Math.max(1, parseInt(req.query.page ?? 1));
    const ordenar   = req.query.sort;  
    const query     = req.query.query; 

    const filtro = {};
    if (query) {
      if (query === 'true' || query === 'false') filtro.status = (query === 'true');
      else filtro.category = query;
    }

    const sortOpt = {};
    if (ordenar === 'asc') sortOpt.price = 1;
    if (ordenar === 'desc') sortOpt.price = -1;

    const total = await Product.countDocuments(filtro);
    const totalPages = Math.max(1, Math.ceil(total / limiteNum));
    const skip = (paginaNum - 1) * limiteNum;

    const productos = await Product.find(filtro)
      .sort(sortOpt)       
      .skip(skip)          
      .limit(limiteNum)    
      .lean();

    const hasPrevPage = paginaNum > 1;
    const hasNextPage = paginaNum < totalPages;

    const buildLink = (page) => {
      const params = new URLSearchParams({ ...req.query, page, limit: limiteNum });
      return `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}?${params.toString()}`;
    };

    res.json({
      status: total ? 'success' : 'error',
      payload: productos,
      totalPages,
      prevPage: hasPrevPage ? paginaNum - 1 : null,
      nextPage: hasNextPage ? paginaNum + 1 : null,
      page: paginaNum,
      hasPrevPage,
      hasNextPage,
      prevLink: hasPrevPage ? buildLink(paginaNum - 1) : null,
      nextLink: hasNextPage ? buildLink(paginaNum + 1) : null
    });
  } catch (error) { next(error); }
}

export async function crearProducto(req, res, next) {
  try {
    const producto = await Product.create(req.body);
    res.status(201).json(producto);
  } catch (error) { next(error); }
}

export async function obtenerProducto(req, res, next) {
  try {
    const producto = await Product.findById(req.params.pid).lean();
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) { next(error); }
}

export async function actualizarProducto(req, res, next) {
  try {
    const producto = await Product.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) { next(error); }
}

export async function eliminarProducto(req, res, next) {
  try {
    const eliminado = await Product.findByIdAndDelete(req.params.pid).lean();
    if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).send();
  } catch (error) { next(error); }
}
