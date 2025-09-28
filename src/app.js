import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import { engine } from 'express-handlebars';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());               
app.use(express.urlencoded({ extended: true })); 

app.use('/public', express.static(path.join(__dirname, '../public'))); 

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));


app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  res.status(status).json({ error: error.message || 'Error interno del servidor' });
});

export default app;
