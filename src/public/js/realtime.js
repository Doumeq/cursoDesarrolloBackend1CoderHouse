console.log("cliente socket preparad");

const formularioCrear = document.querySelector("#form-crear");
const listaUl = document.querySelector("#lista-productos");
const botonEliminarSelector = ".btn-eliminar";

const socket = io();

function renderLista(productos) {
  listaUl.innerHTML = productos
    .map(
      (producto) => `
      <li>
        <strong>#${producto.id}</strong> - ${producto.title} ($${producto.price})
        <button class="btn-eliminar" data-id="${producto.id}">Eliminar</button>
      </li>`
    )
    .join("");
}

socket.on("productos:actualizados", (productos) => {
  renderLista(productos);
});

formularioCrear?.addEventListener("submit", (evento) => {
  evento.preventDefault();
  const datos = Object.fromEntries(new FormData(formularioCrear).entries());

  if (datos.price) datos.price = Number(datos.price);
  if (datos.stock) datos.stock = Number(datos.stock);
  if (datos.status !== undefined) datos.status = Boolean(datos.status);

  socket.emit("producto:create", datos);
  formularioCrear.reset();
});

listaUl?.addEventListener("click", (evento) => {
  if (evento.target.matches(botonEliminarSelector)) {
    const idProducto = evento.target.dataset.id;
    socket.emit("producto:delete", { idProducto });
  }
});
