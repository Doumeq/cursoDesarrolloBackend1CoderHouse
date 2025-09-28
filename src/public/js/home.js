(async function () {
    async function ensureCart() {
        let cid = localStorage.getItem('cartId');
        if (!cid) {
            const resp = await fetch('/api/carts', { method: 'POST' });
            const data = await resp.json();
            cid = data.id || data._id;
            localStorage.setItem('cartId', cid);
        }
        return cid;
    }

    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', async () => {
            const pid = btn.dataset.pid;
            const cid = await ensureCart();
            await fetch(`/api/carts/${cid}/product/${pid}`, { method: 'POST' });
            alert('Producto agregado al carrito');
        });
    });
})();
