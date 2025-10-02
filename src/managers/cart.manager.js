import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import ProductManager from "./product.manager.js";

class CartManager {
  constructor() {
    this.productManager = new ProductManager();
  }

  async createCart() {
    const cart = await Cart.create({ products: [] });
    return cart.toObject();
  }

  async getByIdPopulated(cid) {
    const cart = await Cart.findById(cid).populate("products.product").lean();
    return cart;
  }

  async replaceAllProducts(cid, items = []) {
    for (const it of items) {
      await Product.exists({ _id: it.product });
    }
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { $set: { products: items } },
      { new: true }
    )
      .populate("products.product")
      .lean();
    return cart;
  }

  async updateQuantity(cid, pid, quantity) {
    const q = Math.max(1, Number(quantity || 1));
    const cart = await Cart.findOneAndUpdate(
      { _id: cid, "products.product": pid },
      { $set: { "products.$.quantity": q } },
      { new: true }
    )
      .populate("products.product")
      .lean();
    return cart;
  }

  async removeProduct(cid, pid) {
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { $pull: { products: { product: pid } } },
      { new: true }
    )
      .populate("products.product")
      .lean();
    return cart;
  }

  async clear(cid) {
    const cart = await Cart.findByIdAndUpdate(
      cid,
      { $set: { products: [] } },
      { new: true }
    )
      .populate("products.product")
      .lean();
    return cart;
  }

  async addProduct(cid, pid, quantity = 1) {
    const q = Math.max(1, Number(quantity || 1));
    const cart = await Cart.findById(cid);
    const idx = cart.products.findIndex((p) => p.product.toString() === pid);
    if (idx === -1) cart.products.push({ product: pid, quantity: q });
    else cart.products[idx].quantity += q;
    await cart.save();
    return Cart.findById(cid).populate("products.product").lean();
  }
}

export default CartManager;
export { CartManager };
