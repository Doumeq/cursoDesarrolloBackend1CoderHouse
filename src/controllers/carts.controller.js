import CartManager from "../managers/cart.manager.js";
const cm = new CartManager();

export const getCart = async (req, res, next) => {
  try {
    const cart = await cm.getByIdPopulated(req.params.cid);
    if (!cart)
      return res.status(404).json({ status: "error", error: "Cart not found" });
    res.json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const cart = await cm.removeProduct(req.params.cid, req.params.pid);
    res.json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
};

export const replaceCart = async (req, res, next) => {
  try {
    const { products } = req.body;
    const cart = await cm.replaceAllProducts(req.params.cid, products || []);
    res.json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
};

export const updateItemQty = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await cm.updateQuantity(
      req.params.cid,
      req.params.pid,
      quantity
    );
    res.json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await cm.clear(req.params.cid);
    res.json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
};

export const createCart = async (req, res, next) => {
  try {
    const cart = await cm.createCart();
    res.status(201).json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cart = await cm.addProduct(req.params.cid, req.params.pid, quantity);
    res.status(201).json({ status: "success", payload: cart });
  } catch (e) {
    next(e);
  }
};

export const renderCartView = async (req, res, next) => {
  try {
    const cart = await cm.getByIdPopulated(req.params.cid);
    if (!cart) return res.status(404).render('404', { message: 'Carrito no encontrado' });
    res.render('cart', { cart });
  } catch (e) { next(e); }
};
