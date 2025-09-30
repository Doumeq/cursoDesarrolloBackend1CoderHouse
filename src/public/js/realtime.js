const socket = io();

const $list = document.getElementById('product-list');
const $form = document.getElementById('form-create');

function renderList(products) {
  $list.innerHTML = products
    .map(
      (p) => `
      <li>
        <strong>#${p.id}</strong> - ${p.title} ($${p.price})
        <button data-id="${p.id}" class="btn-delete">Eliminar</button>
      </li>`
    )
    .join('');
}

socket.on('products:list', renderList);

$list?.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.btn-delete');
  if (btn) {
    socket.emit('product:delete', btn.dataset.id);
  }
});

$form?.addEventListener('submit', (ev) => {
  ev.preventDefault();
  const formData = new FormData($form);
  const payload = Object.fromEntries(formData.entries());
  payload.price = Number(payload.price);
  payload.stock = Number(payload.stock);
  payload.status = payload.status === 'true';
  socket.emit('product:create', payload);
  $form.reset();
});
