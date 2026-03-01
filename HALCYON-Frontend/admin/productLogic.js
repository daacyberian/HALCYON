// productLogic.js

// Load categories from backend (no auth)
async function loadCategories() {
    const res = await fetch('https://ecom-backend-alpha-rust.vercel.app/category');
    const categories = await res.json();
    const select = document.getElementById('productCategory');
    if (categories && categories.length > 0) {
        select.innerHTML = categories.map(cat =>
            `<option value="${cat.CategoryID}">${cat.Name}</option>`
        ).join('');
    } else {
        select.innerHTML = '<option value="">No categories found</option>';
    }
}

export async function setupProductForm() {
    await loadCategories();

    document.getElementById('addProductForm').onsubmit = async function(e) {
        e.preventDefault();
        const name = document.getElementById('productName').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const categoryId = parseInt(document.getElementById('productCategory').value);
        const description = document.getElementById('productDescription').value;
        const msg = document.getElementById('msg');
        msg.textContent = '';
        msg.className = 'msg';

        try {
            const res = await fetch('https://ecom-backend-alpha-rust.vercel.app/product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, price, categoryId, description })
            });
            if (res.ok) {
                msg.textContent = 'Product added successfully!';
                msg.classList.add('success');
                e.target.reset();
            } else {
                const data = await res.json();
                msg.textContent = data.error || 'Failed to add product';
                msg.classList.add('error');
            }
        } catch (err) {
            msg.textContent = 'Failed to add product (server error)';
            msg.classList.add('error');
        }
    };
} 