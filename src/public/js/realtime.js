(() => {
  const socket = io();
  socket.on('connect', () => console.log('socket conectado:', socket.id));

  const form = document.getElementById('form-crear');
  const list = document.getElementById('lista-tiempo-real');
  const inputs = {
    title: document.getElementById('title'),
    description: document.getElementById('description'),
    code: document.getElementById('code'),
    price: document.getElementById('price'),
    stock: document.getElementById('stock'),
    category: document.getElementById('category'),
    status: document.getElementById('status'),
  };

  function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[s]));
  }

  function render(products) {
    if (!list || !Array.isArray(products)) return;
    list.innerHTML = products.map(p => `
      <li data-id="${p._id}">
        <strong>${escapeHtml(p.title)}</strong> — $${p.price ?? 0}
        <small> | cat: ${escapeHtml(p.category ?? '-')} | stock: ${p.stock ?? 0}</small>
      </li>
    `).join('');
  }

  fetch('/api/products?limit=50')
    .then(async r => {
      if (!r.ok) throw new Error(`GET /api/products -> ${r.status}`);
      return r.json();
    })
    .then(d => render(d.payload || d))
    .catch(console.error);

  socket.on('products:updated', render);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      for (const [k, el] of Object.entries(inputs)) {
        if (!el) { alert(`Falta el elemento con id="${k}" en el HTML`); return; }
      }

      const data = {
        title: inputs.title.value.trim(),
        description: inputs.description.value.trim(),
        code: inputs.code.value.trim(),
        category: inputs.category.value.trim(),
        price: Number(inputs.price.value),
        stock: Number(inputs.stock.value),
        status: (() => {
          const v = String(inputs.status.value).toLowerCase();
          return v === 'true' || v === 'verdadero' || v === '1';
        })()
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const msg = await res.text();
        alert('Error creando producto: ' + msg);
        return;
      }
      form.reset(); 
    });
  }
})();
