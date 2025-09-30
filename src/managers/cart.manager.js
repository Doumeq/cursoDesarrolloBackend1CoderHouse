import fs from 'fs/promises';
import path from 'path';

export default class CartManager {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async #ensureFile() {
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.mkdir(path.dirname(this.filePath), { recursive: true });
      await fs.writeFile(this.filePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  async #read() {
    await this.#ensureFile();
    const raw = await fs.readFile(this.filePath, 'utf-8');
    return raw ? JSON.parse(raw) : [];
  }

  async #write(data) {
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async create() {
    const carts = await this.#read();
    const nextId = carts.length ? Math.max(...carts.map((c) => Number(c.id))) + 1 : 1;
    const cart = { id: nextId, products: [] };
    carts.push(cart);
    await this.#write(carts);
    return cart;
  }

  async getById(cid) {
    const carts = await this.#read();
    return carts.find((c) => String(c.id) === String(cid)) || null;
  }

  async addProduct(cid, pid, quantity = 1) {
    const carts = await this.#read();
    const idx = carts.findIndex((c) => String(c.id) === String(cid));
    if (idx === -1) return null;

    const existing = carts[idx].products.find((p) => String(p.product) === String(pid));
    if (existing) existing.quantity += Number(quantity) || 1;
    else carts[idx].products.push({ product: Number(pid), quantity: Number(quantity) || 1 });

    await this.#write(carts);
    return carts[idx];
  }

  async updateAllProducts(cid, productsArray) {
    const carts = await this.#read();
    const idx = carts.findIndex((c) => String(c.id) === String(cid));
    if (idx === -1) return null;
    carts[idx].products = Array.isArray(productsArray) ? productsArray : [];
    await this.#write(carts);
    return carts[idx];
  }

  async updateProductQuantity(cid, pid, quantity) {
    const carts = await this.#read();
    const idx = carts.findIndex((c) => String(c.id) === String(cid));
    if (idx === -1) return null;

    const item = carts[idx].products.find((p) => String(p.product) === String(pid));
    if (!item) return null;

    item.quantity = Number(quantity);
    await this.#write(carts);
    return carts[idx];
  }

  async removeProduct(cid, pid) {
    const carts = await this.#read();
    const idx = carts.findIndex((c) => String(c.id) === String(cid));
    if (idx === -1) return null;
    carts[idx].products = carts[idx].products.filter((p) => String(p.product) !== String(pid));
    await this.#write(carts);
    return carts[idx];
  }

  async clearCart(cid) {
    const carts = await this.#read();
    const idx = carts.findIndex((c) => String(c.id) === String(cid));
    if (idx === -1) return null;
    carts[idx].products = [];
    await this.#write(carts);
    return carts[idx];
  }
}
