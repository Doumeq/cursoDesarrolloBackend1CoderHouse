import ProductManager from "../managers/product.manager.js";

const manager = new ProductManager();

async function emitProductsUpdate(req) {
  const io = req.app.get("io");
  if (!io) return;
  const data = await manager.getAll({ limit: 50, page: 1 });
  io.emit("products:updated", data.payload || data);
}

export const listProducts = async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const data = await manager.getAll({ limit, page, sort, query });
    if (data && data.status) return res.json(data);
    return res.json({ status: "success", payload: data });
  } catch (e) {
    next(e);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const created = await manager.create(req.body);
    await emitProductsUpdate(req);
    res.status(201).json({ status: "success", payload: created });
  } catch (e) {
    next(e);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const updated = await manager.update(req.params.pid, req.body);
    await emitProductsUpdate(req);
    res.json({ status: "success", payload: updated });
  } catch (e) {
    next(e);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    await manager.delete(req.params.pid);
    await emitProductsUpdate(req);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
};

export const renderHomeView = async (req, res, next) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;
    const data = await manager.getAll({ limit, page, sort, query });

    res.render("products", {
      products: data.payload || data,
      pagination: {
        totalPages: data.totalPages ?? 1,
        page: Number(data.page ?? page),
        prevLink: data.prevLink ?? null,
        nextLink: data.nextLink ?? null,
        hasPrevPage: data.hasPrevPage ?? false,
        hasNextPage: data.hasNextPage ?? false,
      },
      query,
      sort,
      limit,
    });
  } catch (e) {
    next(e);
  }
};

export const renderRealTimeView = async (req, res, next) => {
  try {
    res.render("realTimeProducts");
  } catch (e) {
    next(e);
  }
};

export const renderProductDetail = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const product = await manager.getById(pid);
    if (!product)
      return res
        .status(404)
        .render("404", { message: "Producto no encontrado" });
    res.render("product-detail", { title: product.title, product });
  } catch (e) {
    next(e);
  }
};
