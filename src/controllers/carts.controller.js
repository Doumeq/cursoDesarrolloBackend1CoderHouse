import { CartManager } from '../managers/cart.manager.js';

const cartManager = new CartManager();
await cartManager.init();

export async function renderCartView(req, res, next) {
  try {
    const carrito = await cartManager.getById(req.params.cid);
    if (!carrito) return res.status(404).render('error', { message: 'Carrito no encontrado' });
    res.render('cart', { title: `Carrito #${carrito.id}`, carrito });
  } catch (error) { next(error); }
}

export async function createCart(req, res, next) {
  try {
    const carrito = await cartManager.createCart();
    res.status(201).json(carrito);
  } catch (error) { next(error); }
}

export async function getCartById(req, res, next) {
  try {
    const carrito = await cartManager.getById(req.params.cid);
    if (!carrito) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.json(carrito);
  } catch (error) { next(error); }
}

export async function addProductToCart(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const result = await cartManager.addProduct(cid, pid, 1);

    if (result?.error === 'CART_NOT_FOUND') return res.status(404).json({ error: 'Carrito no encontrado' });
    if (result?.error === 'PRODUCT_NOT_FOUND') return res.status(404).json({ error: 'Producto no encontrado' });

    res.status(201).json(result);
  } catch (error) { next(error); }
}

export async function removeProductFromCart(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const result = await cartManager.removeProduct(cid, pid);

    if (result?.error === 'CART_NOT_FOUND') return res.status(404).json({ error: 'Carrito no encontrado' });
    if (result?.error === 'PRODUCT_NOT_IN_CART') return res.status(404).json({ error: 'Producto no está en el carrito' });

    res.json(result);
  } catch (error) { next(error); }
}

export async function updateAllCartProducts(req, res, next) {
  try {
    const { cid } = req.params;
    const result = await cartManager.updateAllProducts(cid, req.body?.products || []);

    if (result?.error === 'CART_NOT_FOUND') return res.status(404).json({ error: 'Carrito no encontrado' });

    res.json(result);
  } catch (error) { next(error); }
}

export async function updateCartProductQuantity(req, res, next) {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    const result = await cartManager.updateProductQuantity(cid, pid, quantity);

    if (result?.error === 'CART_NOT_FOUND') return res.status(404).json({ error: 'Carrito no encontrado' });
    if (result?.error === 'PRODUCT_NOT_IN_CART') return res.status(404).json({ error: 'Producto no está en el carrito' });

    res.json(result);
  } catch (error) { next(error); }
}

export async function clearCart(req, res, next) {
  try {
    const { cid } = req.params;
    const result = await cartManager.clear(cid);

    if (result?.error === 'CART_NOT_FOUND') return res.status(404).json({ error: 'Carrito no encontrado' });

    res.json(result);
  } catch (error) { next(error); }
}
