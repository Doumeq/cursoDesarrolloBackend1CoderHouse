import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';

import ProductManager from './managers/product.manager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PORT = process.env.PORT || 8080;

const app = express();
const httpServer = createServer(app);
export { httpServer };

export const io = new SocketIOServer(httpServer);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.engine('hbs', engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const productManager = new ProductManager(
  path.join(__dirname, 'data', 'products.json')
);

io.on('connection', (socket) => {
  productManager.getAll().then((products) => {
    socket.emit('products:list', products);
  });

  socket.on('product:create', async (payload) => {
    try {
      const created = await productManager.create(payload);
      const list = await productManager.getAll();
      io.emit('products:list', list);
      socket.emit('product:created', created);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });

  socket.on('product:delete', async (id) => {
    try {
      await productManager.removeById(id);
      const list = await productManager.getAll();
      io.emit('products:list', list);
    } catch (err) {
      socket.emit('error', { message: err.message });
    }
  });
});

export default app;
