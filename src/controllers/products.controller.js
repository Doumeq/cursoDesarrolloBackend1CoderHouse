import { ProductoModel } from '../models/product.model.js';

function construirFiltro(queryParam) {
    if (!queryParam) return {};
    if (queryParam.includes(':')) {
        const [campo, valor] = queryParam.split(':');
        if (campo === 'status') return { status: valor === 'true' };
        if (campo === 'category') return { category: valor };
        return {};
    }
    return { category: queryParam };
}

export async function getProductos(req, res, next) {
    try {
        const { limit = 10, page = 1, sort, query } = req.query;

        const filtro = construirFiltro(String(query ?? ''));
        const orden = sort === 'asc' ? { price: 1 } : sort === 'desc' ? { price: -1 } : {};

        const opciones = {
            limit: Number(limit) || 10,
            page: Number(page) || 1,
            sort: orden,
            lean: true
        };

        const resultado = await ProductoModel.paginate(filtro, opciones);

        const base = `${req.protocol}://${req.get('host')}${req.baseUrl}${req.path}`;
        const qs = (p) => `?limit=${opciones.limit}&page=${p}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`;

        res.json({
            status: 'success',
            payload: resultado.docs,
            totalPages: resultado.totalPages,
            prevPage: resultado.prevPage,
            nextPage: resultado.nextPage,
            page: resultado.page,
            hasPrevPage: resultado.hasPrevPage,
            hasNextPage: resultado.hasNextPage,
            prevLink: resultado.hasPrevPage ? `${base}${qs(resultado.prevPage)}` : null,
            nextLink: resultado.hasNextPage ? `${base}${qs(resultado.nextPage)}` : null
        });
    } catch (error) { 
        next(error); 
    }
}

export async function getProductoPorId(req, res, next) {
    try {
        const producto = await ProductoModel.findById(req.params.pid).lean();
        if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
        res.json(producto);
    } catch (error) { 
        next(error); 
    }
}

export async function crearProducto(req, res, next) {
    try {
        const creado = await ProductoModel.create(req.body);
        req.app.get('io')?.emit('productosActualizados');
        res.status(201).json(creado);
    } catch (error) { 
        next(error); 
    }
}

export async function actualizarProducto(req, res, next) {
    try {
        const actualizado = await ProductoModel.findByIdAndUpdate(
            req.params.pid,
            { $set: req.body },
            { new: true, runValidators: true, lean: true }
        );
        if (!actualizado) return res.status(404).json({ error: 'Producto no encontrado' });
        req.app.get('io')?.emit('productosActualizados');
        res.json(actualizado);
    } catch (error) { 
        next(error); 
    }
}

export async function eliminarProducto(req, res, next) {
    try {
        const eliminado = await ProductoModel.findByIdAndDelete(req.params.pid).lean();
        if (!eliminado) return res.status(404).json({ error: 'Producto no encontrado' });
        req.app.get('io')?.emit('productosActualizados');
        res.status(204).send();
    } catch (error) { 
        next(error); 
    }
}
