(async function () {
    const cid = localStorage.getItem('cartId');
    if (!cid) return;

    document.querySelectorAll('.btn-actualizar').forEach(b => {
        b.addEventListener('click', async () => {
            const pid = b.dataset.pid;
            const qtyInput = document.querySelector(`.qty[data-pid="${pid}"]`);
            const quantity = parseInt(qtyInput.value, 10) || 1;

            await fetch(`/api/carts/${cid}/products/${pid}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
            location.reload();
        });
    });

    document.querySelectorAll('.btn-eliminar').forEach(b => {
        b.addEventListener('click', async () => {
            const pid = b.dataset.pid;
            await fetch(`/api/carts/${cid}/products/${pid}`, { method: 'DELETE' });
            location.reload();
        });
    });

    document.getElementById('btnVaciar')?.addEventListener('click', async () => {
        if (!confirm('¿Vaciar carrito completo?')) return;
        await fetch(`/api/carts/${cid}`, { method: 'DELETE' });
        location.reload();
    });
})();
