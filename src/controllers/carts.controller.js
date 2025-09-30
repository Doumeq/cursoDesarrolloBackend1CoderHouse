import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";

export async function crearCarrito(req, res, next) {
  try {
    const carrito = await Cart.create({ products: [] });
    res.status(201).json(carrito);
  } catch (error) {
    next(error);
  }
}

export async function obtenerCarrito(req, res, next) {
  try {
    const carrito = await Cart.findById(req.params.cid)
      .populate("products.product")
      .lean();
    if (!carrito)
      return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(carrito);
  } catch (error) {
    next(error);
  }
}

export async function agregarProductoAlCarrito(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const producto = await Product.findById(pid).lean();
    if (!producto)
      return res.status(404).json({ error: "Producto no encontrado" });

    const carrito = await Cart.findById(cid);
    if (!carrito)
      return res.status(404).json({ error: "Carrito no encontrado" });

    const item = carrito.products.find((i) => i.product.toString() === pid);
    if (item) item.quantity += 1;
    else carrito.products.push({ product: pid, quantity: 1 });

    await carrito.save();
    const resultado = await carrito.populate("products.product");
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
}

export async function eliminarProductoDelCarrito(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const carrito = await Cart.findById(cid);
    if (!carrito)
      return res.status(404).json({ error: "Carrito no encontrado" });

    carrito.products = carrito.products.filter(
      (i) => i.product.toString() !== pid
    );
    await carrito.save();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function reemplazarProductosDelCarrito(req, res, next) {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    const carrito = await Cart.findByIdAndUpdate(
      cid,
      { products: products ?? [] },
      { new: true, runValidators: true }
    )
      .populate("products.product")
      .lean();

    if (!carrito)
      return res.status(404).json({ error: "Carrito no encontrado" });
    res.json(carrito);
  } catch (error) {
    next(error);
  }
}

export async function actualizarCantidad(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const carrito = await Cart.findById(cid);
    if (!carrito)
      return res.status(404).json({ error: "Carrito no encontrado" });

    const item = carrito.products.find((i) => i.product.toString() === pid);
    if (!item)
      return res.status(404).json({ error: "Producto no está en el carrito" });

    item.quantity = Math.max(1, Number(quantity) || 1);
    await carrito.save();
    const resultado = await carrito.populate("products.product");
    res.json(resultado);
  } catch (error) {
    next(error);
  }
}

export async function vaciarCarrito(req, res, next) {
  try {
    const { cid } = req.params;
    const carrito = await Cart.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    ).lean();
    if (!carrito)
      return res.status(404).json({ error: "Carrito no encontrado" });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
