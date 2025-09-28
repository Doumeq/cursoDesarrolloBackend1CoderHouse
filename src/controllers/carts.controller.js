import { CarritoModel } from '../models/cart.model.js';
import { ProductoModel } from '../models/product.model.js';

export async function crearCarrito(req, res, next) {
    try {
        const carrito = await CarritoModel.create({ products: [] });
        res.status(201).json(carrito);
    } catch (error) { 
        next(error); 
    }
}

export async function getCarrito(req, res, next) {
    try {
        const carrito = await CarritoModel
            .findById(req.params.cid)
            .populate('products.product')
            .lean();
        if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });
        res.json(carrito);
    } catch (error) { 
        next(error); 
    }
}

export async function agregarProductoAlCarrito(req, res, next) {
    try {
        const { cid, pid } = req.params;
        const productoExiste = await ProductoModel.exists({ _id: pid });
        if (!productoExiste) return res.status(404).json({ error: 'Producto no encontrado' });

        const carrito = await CarritoModel.findById(cid);
        if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });

        const item = carrito.products.find(p => String(p.product) === pid);
        if (item) item.quantity += 1;
        else carrito.products.push({ product: pid, quantity: 1 });

        await carrito.save();
        const poblado = await carrito.populate('products.product');
        res.status(201).json(poblado);
    } catch (error) { 
        next(error); 
    }
}

// DELETE api/carts/:cid/products/:pid 
export async function eliminarProductoDelCarrito(req, res, next) {
    try {
        const { cid, pid } = req.params;
        const carrito = await CarritoModel.findById(cid);
        if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });

        carrito.products = carrito.products.filter(p => String(p.product) !== pid);
        await carrito.save();
        res.status(204).send();
    } catch (error) { 
        next(error); 
    }
}

// PUT api/carts/:cid 
export async function reemplazarProductosDelCarrito(req, res, next) {
    try {
        const { cid } = req.params;
        const { products } = req.body;
        if (!Array.isArray(products)) {
            return res.status(400).json({ error: 'Se espera un arreglo "products"' });
        }
        const carrito = await CarritoModel.findByIdAndUpdate(
            cid,
            { $set: { products } },
            { new: true }
        ).populate('products.product');
        if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });
        res.json(carrito);
    } catch (error) { 
        next(error); 
    }
}

// PUT api/carts/:cid/products/:pid  
export async function actualizarCantidadProducto(req, res, next) {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        const carrito = await CarritoModel.findById(cid);
        if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });

        const item = carrito.products.find(p => String(p.product) === pid);
        if (!item) return res.status(404).json({ error: 'Producto no existe en el carrito' });

        item.quantity = Number(quantity) || item.quantity;
        await carrito.save();

        const poblado = await carrito.populate('products.product');
        res.json(poblado);
    } catch (error) { 
        next(error); 
    }
}

// DELETE api/carts/:cid  
export async function vaciarCarrito(req, res, next) {
    try {
        const carrito = await CarritoModel.findByIdAndUpdate(
            req.params.cid,
            { $set: { products: [] } },
            { new: true }
        );
        if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });
        res.status(204).send();
    } catch (error) { 
        next(error); 
    }
}
