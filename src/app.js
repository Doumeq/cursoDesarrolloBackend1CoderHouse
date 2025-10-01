import express from 'express';
import { engine } from 'express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

import productsRouter from './routes/products.router.js';
import cartsRouter from './routes/carts.router.js';
import viewsRouter from './routes/views.router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine('hbs', engine({
  extname: '.hbs',                                 
  defaultLayout: 'main',                           
  layoutsDir:   path.join(__dirname, 'views', 'layouts'),
  partialsDir:  path.join(__dirname, 'views', 'partials'),
}));
app.set('view engine', 'hbs');                     
app.set('views', path.join(__dirname, 'views'));   

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
app.use((error, req, res, next) => res.status(error.statusCode || 500).json({ error: error.message || 'Error interno' }));

export default app;
