import Product from "../models/product.model.js";
import mongoose from 'mongoose';

class ProductManager {
  async create(data) {
    const doc = await Product.create({
      title: String(data.title ?? "").trim(),
      description: String(data.description ?? "").trim(),
      code: String(data.code ?? "").trim(),
      price: Number(data.price ?? 0),
      stock: Number(data.stock ?? 0),
      category: String(data.category ?? "").trim(),
      status: Boolean(
        String(data.status).toLowerCase() === "true" ||
          String(data.status).toLowerCase() === "verdadero" ||
          data.status === true
      ),
    });
    return doc.toObject();
  }

  async getAll({ limit = 10, page = 1, sort, query } = {}) {
    limit = Number(limit) > 0 ? Number(limit) : 10;
    page = Number(page) > 0 ? Number(page) : 1;

    const filter = {};
    if (query) {
      const [k, v] = String(query).split(":");
      if (k === "category" && v) filter.category = v;
      if (k === "status" && v !== undefined)
        filter.status = String(v).toLowerCase() === "true";
    }

    const sortObj = {};
    if (sort === "asc") sortObj.price = 1;
    if (sort === "desc") sortObj.price = -1;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));
    const hasPrevPage = page > 1;
    const hasNextPage = page < totalPages;
    const prevPage = hasPrevPage ? page - 1 : null;
    const nextPage = hasNextPage ? page + 1 : null;

    const link = (p) =>
      p
        ? `/api/products?limit=${limit}&page=${p}` +
          (sort ? `&sort=${sort}` : "") +
          (query ? `&query=${encodeURIComponent(query)}` : "")
        : null;

    return {
      status: "success",
      payload: items,
      totalPages,
      prevPage,
      nextPage,
      page,
      hasPrevPage,
      hasNextPage,
      prevLink: link(prevPage),
      nextLink: link(nextPage),
    };
  }

  async update(id, data) {
    const updated = await Product.findByIdAndUpdate(id, data, {
      new: true,
    }).lean();
    return updated;
  }

  async delete(id) {
    await Product.findByIdAndDelete(id);
  }

  async getById(id) {
    if (!mongoose.isValidObjectId(id)) return null;
    return await Product.findById(id).lean();
  }
}

export default ProductManager;
export { ProductManager };
