import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

async function ensureFile(filePath, defaultValue) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try { await fs.access(filePath); }
  catch { await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2)); }
}

export class ProductManager {
  constructor(filePath = PRODUCTS_FILE) {
    this.filePath = filePath;
  }

  async init() {
    await ensureFile(this.filePath, []);
  }

  async readAll() {
    const raw = await fs.readFile(this.filePath, 'utf-8');
    return raw ? JSON.parse(raw) : [];
  }

  async writeAll(productos) {
    await fs.writeFile(this.filePath, JSON.stringify(productos, null, 2), 'utf-8');
  }

  async getAll({ limit = 10, page = 1, sort, query } = {}) {
    const productos = await this.readAll();

    let filtrados = productos;
    if (query) {
      const q = String(query).toLowerCase();
      filtrados = productos.filter(p =>
        String(p.category).toLowerCase() === q ||
        String(p.status).toLowerCase() === q
      );
    }

    if (sort === 'asc' || sort === 'desc') {
      filtrados.sort((a, b) => sort === 'asc' ? a.price - b.price : b.price - a.price);
    }

    const total = filtrados.length;
    const totalPages = Math.max(1, Math.ceil(total / Number(limit)));
    const currentPage = Math.min(Math.max(1, Number(page)), totalPages);
    const start = (currentPage - 1) * Number(limit);
    const end = start + Number(limit);
    const payload = filtrados.slice(start, end);

    return {
      payload,
      totalPages,
      prevPage: currentPage > 1 ? currentPage - 1 : null,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      page: currentPage,
      hasPrevPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
  }

  async getById(productId) {
    const productos = await this.readAll();
    return productos.find(p => String(p.id) === String(productId)) || null;
  }

  async create(data) {
    const requeridos = ['title', 'description', 'code', 'price', 'stock', 'category'];
    const faltantes = requeridos.filter(k => data[k] === undefined);
    if (faltantes.length) {
      const error = new Error(`Faltan campos requeridos: ${faltantes.join(', ')}`);
      error.statusCode = 400;
      throw error;
    }

    const productos = await this.readAll();
    const nextId = productos.length ? Math.max(...productos.map(p => Number(p.id))) + 1 : 1;

    const nuevo = {
      id: nextId,
      title: String(data.title),
      description: String(data.description),
      code: String(data.code),
      price: Number(data.price),
      status: data.status === undefined ? true : Boolean(data.status),
      stock: Number(data.stock),
      category: String(data.category),
      thumbnails: Array.isArray(data.thumbnails) ? data.thumbnails.map(String) : []
    };

    productos.push(nuevo);
    await this.writeAll(productos);
    return nuevo;
  }

  async update(productId, parciales) {
    const productos = await this.readAll();
    const index = productos.findIndex(p => String(p.id) === String(productId));
    if (index === -1) return null;

    const safe = { ...parciales };
    delete safe.id;
    if ('price' in safe) safe.price = Number(safe.price);
    if ('stock' in safe) safe.stock = Number(safe.stock);
    if ('status' in safe) safe.status = Boolean(safe.status);
    if ('thumbnails' in safe && !Array.isArray(safe.thumbnails)) safe.thumbnails = [];

    productos[index] = { ...productos[index], ...safe };
    await this.writeAll(productos);
    return productos[index];
  }

  async delete(productId) {
    const productos = await this.readAll();
    const index = productos.findIndex(p => String(p.id) === String(productId));
    if (index === -1) return false;
    productos.splice(index, 1);
    await this.writeAll(productos);
    return true;
  }
}
