import { ProductoModel } from '../models/product.model.js';
import { CarritoModel } from '../models/cart.model.js';

export async function vistaHome(req, res, next) {
    try {
        const productos = await ProductoModel.find().sort({ createdAt: -1 }).limit(12).lean();
        res.render('home', { titulo: 'Home', productos });
    } catch (error) { 
        next(error); 
    }
}

export async function vistaProductos(req, res, next) {
    try {
        req.baseUrl = '/products';
        const { limit = 10, page = 1, sort, query } = req.query;

        const urlApi = `${req.protocol}://${req.get('host')}/api/products?limit=${limit}&page=${page}${sort ? `&sort=${sort}` : ''}${query ? `&query=${query}` : ''}`;
        const respuesta = await fetch(urlApi).then(r => r.json());

        res.render('products', { titulo: 'Productos', ...respuesta });
    } catch (error) { 
        next(error); 
    }
}

export async function vistaProductoDetalle(req, res, next) {
    try {
        const producto = await ProductoModel.findById(req.params.pid).lean();
        if (!producto) return res.status(404).render('productDetail', { error: 'Producto no encontrado' });
        res.render('productDetail', { producto, titulo: producto.title });
    } catch (error) { 
        next(error); 
    }
}

export async function vistaCarrito(req, res, next) {
    try {
        const carrito = await CarritoModel.findById(req.params.cid).populate('products.product').lean();
        if (!carrito) return res.status(404).render('cart', { error: 'Carrito no encontrado' });
        res.render('cart', { carrito, titulo: `Carrito ${req.params.cid}` });
    } catch (error) { 
        next(error); 
    }
}

export async function vistaRealTime(req, res) {
    const productos = await ProductoModel.find().lean();
    res.render('realTimeProducts', { titulo: 'RealTimeProducts', productos });
}
