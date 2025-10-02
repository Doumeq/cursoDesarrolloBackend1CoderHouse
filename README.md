# Nicolas Domeq – Entrega Final

Proyecto con Node.js + Express + MongoDB (a traves de Mongoose). 
Cuenta con Productos, Carritos, vistas con Handlebars y realtime con Socket.IO.

## Requisitos
- Node 18+
- MongoDB Atlas 

## Configuración
Se necesita crear `.env` en la raíz que contenga:
- PORT=8080
- MONGO_URL=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net (conexion con driver)
- DB_NAME=CoderHouse (nombre de DB)

## Instalación y ejecución
```bash
npm install / npm i
npm run dev   
# o
npm start  
```  
## Vistas
/products – listado con paginación + “Agregar al carrito”

/products/:pid – detalle de producto

/carts/:cid – ver carrito (con populate)

/realtimeproducts – listado en tiempo real

## API (resumen)
Productos

GET /api/products?limit=&page=&sort=asc|desc&query=category:<cat>|status:true|false

POST /api/products

PUT /api/products/:pid

DELETE /api/products/:pid

## Carritos

POST /api/carts → crea carrito

GET /api/carts/:cid → carrito con productos (populate)

POST /api/carts/:cid/products/:pid → agrega/incrementa

PUT /api/carts/:cid/products/:pid → actualiza cantidad { "quantity": N }

PUT /api/carts/:cid → reemplaza arreglo { "products": [{ "product": "<pid>", "quantity": N }] }

DELETE /api/carts/:cid/products/:pid → elimina un ítem

DELETE /api/carts/:cid → vacía carrito

## Ejemplo de respuesta – GET /api/products

(formato como se pidio en la consigna)

```bash
{
  "status": "success",
  "payload": [ /* productos */ ],
  "totalPages": 3,
  "prevPage": 1,
  "nextPage": 3,
  "page": 2,
  "hasPrevPage": true,
  "hasNextPage": true,
  "prevLink": "/api/products?limit=10&page=1",
  "nextLink": "/api/products?limit=10&page=3"
}
```

## Notas
Si no llega a conectar a Mongo, revisar MONGO_URL, DB_NAME o dar acceso a todos los IP en MongoDB Atlas.
