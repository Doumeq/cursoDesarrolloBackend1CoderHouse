import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ProductManager } from './product.manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const CARTS_FILE = path.join(DATA_DIR, 'carts.json');

async function ensureFile(filePath, defaultValue) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(filePath); }
  catch { await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2)); }
}

export class CartManager {
  constructor(filePath = CARTS_FILE) {
    this.filePath = filePath;
    this.productManager = new ProductManager(); 
  }

  async init() {
    await ensureFile(this.filePath, []);
    await this.productManager.init();
  }

  async readAll() {
    const raw = await fs.readFile(this.filePath, 'utf-8');
    return raw ? JSON.parse(raw) : [];
  }

  async writeAll(carritos) {
    await fs.writeFile(this.filePath, JSON.stringify(carritos, null, 2), 'utf-8');
  }

  async createCart() {
    const carritos = await this.readAll();
    const nextId = carritos.length ? Math.max(...carritos.map(c => Number(c.id))) + 1 : 1;
    const nuevo = { id: nextId, products: [] };
    carritos.push(nuevo);
    await this.writeAll(carritos);
    return nuevo;
  }

  async getById(cartId) {
    const carritos = await this.readAll();
    return carritos.find(c => String(c.id) === String(cartId)) || null;
  }

  async addProduct(cartId, productId, quantity = 1) {
    const carrito = await this.getById(cartId);
    if (!carrito) return { error: 'CART_NOT_FOUND' };

    const producto = await this.productManager.getById(productId);
    if (!producto) return { error: 'PRODUCT_NOT_FOUND' };

    const existente = carrito.products.find(i => String(i.product) === String(productId));
    if (existente) existente.quantity += Number(quantity) || 1;
    else carrito.products.push({ product: producto.id, quantity: Number(quantity) || 1 });

    const carritos = await this.readAll();
    const idx = carritos.findIndex(c => String(c.id) === String(cartId));
    carritos[idx] = carrito;
    await this.writeAll(carritos);
    return carrito;
  }

  async removeProduct(cartId, productId) {
    const carrito = await this.getById(cartId);
    if (!carrito) return { error: 'CART_NOT_FOUND' };

    const lenBefore = carrito.products.length;
    carrito.products = carrito.products.filter(i => String(i.product) !== String(productId));

    if (carrito.products.length === lenBefore) return { error: 'PRODUCT_NOT_IN_CART' };

    const carritos = await this.readAll();
    const idx = carritos.findIndex(c => String(c.id) === String(cartId));
    carritos[idx] = carrito;
    await this.writeAll(carritos);
    return carrito;
  }

  async updateAllProducts(cartId, itemsArray) {
    const carrito = await this.getById(cartId);
    if (!carrito) return { error: 'CART_NOT_FOUND' };

    const normalizados = [];
    for (const item of itemsArray || []) {
      const producto = await this.productManager.getById(item.product);
      if (producto) {
        normalizados.push({
          product: producto.id,
          quantity: Number(item.quantity) || 1
        });
      }
    }
    carrito.products = normalizados;

    const carritos = await this.readAll();
    const idx = carritos.findIndex(c => String(c.id) === String(cartId));
    carritos[idx] = carrito;
    await this.writeAll(carritos);
    return carrito;
  }

  async updateProductQuantity(cartId, productId, quantity) {
    const carrito = await this.getById(cartId);
    if (!carrito) return { error: 'CART_NOT_FOUND' };

    const item = carrito.products.find(i => String(i.product) === String(productId));
    if (!item) return { error: 'PRODUCT_NOT_IN_CART' };

    item.quantity = Number(quantity);
    if (Number.isNaN(item.quantity) || item.quantity < 1) item.quantity = 1;

    const carritos = await this.readAll();
    const idx = carritos.findIndex(c => String(c.id) === String(cartId));
    carritos[idx] = carrito;
    await this.writeAll(carritos);
    return carrito;
  }

  async clear(cartId) {
    const carrito = await this.getById(cartId);
    if (!carrito) return { error: 'CART_NOT_FOUND' };

    carrito.products = [];

    const carritos = await this.readAll();
    const idx = carritos.findIndex(c => String(c.id) === String(cartId));
    carritos[idx] = carrito;
    await this.writeAll(carritos);
    return carrito;
  }
}
