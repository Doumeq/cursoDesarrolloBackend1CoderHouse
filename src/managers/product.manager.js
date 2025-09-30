import fs from 'fs/promises';
import path from 'path';

export default class ProductManager {
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

  async getAll() {
    return this.#read();
  }

  async getById(id) {
    const list = await this.#read();
    return list.find((p) => String(p.id) === String(id)) || null;
  }

  async create(input) {
    const required = ['title', 'description', 'code', 'price', 'stock', 'category'];
    const missing = required.filter((k) => input[k] === undefined);
    if (missing.length) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    const list = await this.#read();
    const nextId = list.length ? Math.max(...list.map((x) => Number(x.id))) + 1 : 1;

    const product = {
      id: nextId,
      title: String(input.title),
      description: String(input.description),
      code: String(input.code),
      price: Number(input.price),
      stock: Number(input.stock),
      category: String(input.category),
      status: input.status === undefined ? true : Boolean(input.status),
      thumbnails: Array.isArray(input.thumbnails) ? input.thumbnails.map(String) : []
    };

    list.push(product);
    await this.#write(list);
    return product;
  }

  async updateById(id, partial) {
    const list = await this.#read();
    const idx = list.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) return null;

    const safe = { ...partial };
    delete safe.id;
    if ('price' in safe) safe.price = Number(safe.price);
    if ('stock' in safe) safe.stock = Number(safe.stock);
    if ('status' in safe) safe.status = Boolean(safe.status);
    if ('thumbnails' in safe && !Array.isArray(safe.thumbnails)) safe.thumbnails = [];

    list[idx] = { ...list[idx], ...safe };
    await this.#write(list);
    return list[idx];
  }

  async removeById(id) {
    const list = await this.#read();
    const idx = list.findIndex((p) => String(p.id) === String(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    await this.#write(list);
    return true;
  }
}
