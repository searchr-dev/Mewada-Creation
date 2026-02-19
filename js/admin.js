document.addEventListener('DOMContentLoaded', () => {

    // =========================================
    // CUSTOM CURSOR
    // =========================================
    const cursor = document.getElementById('cursor');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.12;
        cursorY += (mouseY - cursorY) * 0.12;
        if (cursor) {
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Cursor hover effects
    if (cursor) {
        document.querySelectorAll('a, button, input').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('active'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
        });
    }

    // =========================================
    // CONFIGURATION
    // =========================================
    const SECRET_PASSWORD = btoa('admin123'); // "admin123" in Base64: YWRtaW4xMjM=

    // DOM Elements
    const loginCard = document.getElementById('loginCard');
    const dashboard = document.getElementById('dashboard');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const loginError = document.getElementById('loginError');
    const logoutBtn = document.getElementById('logoutBtn');

    // Dashboard Elements
    const productGrid = document.getElementById('productGrid');
    const addProductBtn = document.getElementById('addProductBtn');
    const modalOverlay = document.getElementById('productModal');
    const closeModal = document.getElementById('closeModal');
    const saveProductBtn = document.getElementById('saveProduct');

    // Inputs
    const pName = document.getElementById('pName');
    const pPrice = document.getElementById('pPrice');
    const pDesc = document.getElementById('pDesc');
    const pImageUpload = document.getElementById('pImageUpload');
    const pImgBase64 = document.getElementById('pImgBase64');
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = imagePreview.querySelector('img');
    const modalTitle = document.getElementById('modalTitle');
    const editProductId = document.getElementById('editProductId');
    const pSalePrice = document.getElementById('pSalePrice');
    const festivalToggle = document.getElementById('festivalToggle');

    // =========================================
    // AUTHENTICATION
    // =========================================
    function checkSession() {
        if (sessionStorage.getItem(APP_CONFIG.ADMIN_SESSION_KEY) === 'true') {
            showDashboard();
        } else {
            showLogin();
        }
    }

    function showLogin() {
        loginCard.style.display = 'block';
        dashboard.style.display = 'none';
        gsap.to(loginCard, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 });
    }

    function showDashboard() {
        loginCard.style.display = 'none';
        dashboard.style.display = 'block';

        // Init Festival Toggle
        if (festivalToggle) {
            festivalToggle.checked = DataManager.isFestivalMode();
            festivalToggle.addEventListener('change', (e) => {
                DataManager.setFestivalMode(e.target.checked);
            });
        }

        renderAdminProducts();

        gsap.fromTo('.db-header',
            { opacity: 0, y: -20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }
        );
        gsap.fromTo('.db-grid',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
        );
    }

    function handleLogin() {
        const input = passwordInput.value;
        const encoded = btoa(input); // Simple Base64 encoding

        if (encoded === SECRET_PASSWORD) {
            sessionStorage.setItem(APP_CONFIG.ADMIN_SESSION_KEY, 'true');
            gsap.to(loginCard, {
                scale: 0.95, opacity: 0, duration: 0.5, ease: 'power2.in',
                onComplete: showDashboard
            });
        } else {
            loginError.style.opacity = 1;
            gsap.fromTo(loginCard, { x: -10 }, { x: 10, duration: 0.1, repeat: 5, yoyo: true });
        }
    }

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem(APP_CONFIG.ADMIN_SESSION_KEY);
        window.location.href = 'index.html';
    });

    loginBtn.addEventListener('click', handleLogin);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    // Removed SHA-256 function - using simple Base64 encoding only

    // =========================================
    // PRODUCT MANAGEMENT
    // =========================================

    function renderAdminProducts() {
        const products = DataManager.getProducts();

        // Remove old product cards, keep add button
        const oldCards = productGrid.querySelectorAll('.db-product-card');
        oldCards.forEach(c => c.remove());

        products.forEach(p => {
            const el = document.createElement('div');
            el.className = 'db-product-card';
            el.innerHTML = `
                <div class="db-product-info">
                    <div>
                        <h3 style="font-size:1.05rem; font-weight:600; margin-bottom:0.25rem;">${p.name}</h3>
                        <div style="display:flex; gap:0.5rem; align-items:baseline;">
                            ${p.salePrice ? `<span style="color:#30d158; font-weight:700; font-size:1rem;">₹${p.salePrice}</span>` : ''}
                            <span style="color:rgba(255,255,255,0.5); font-size:0.85rem; ${p.salePrice ? 'text-decoration:line-through;' : 'font-weight:600; color:#fff'}">₹${p.price}</span>
                        </div>
                    </div>
                </div>
                <div class="db-product-img" style="background-image:url(${p.image})"></div>
                <div class="db-product-actions">
                    <button class="btn-logout" style="background:rgba(0,113,227,0.15); color:#0071e3; border:none; padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.editProduct('${p.id}')">Edit</button>
                    <button class="btn-logout" style="background:rgba(255,50,50,0.15); color:#ff6b6b; border:none; padding:0.4rem 0.8rem; font-size:0.75rem;" onclick="window.deleteProduct('${p.id}')">Delete</button>
                </div>
            `;
            productGrid.appendChild(el);
        });
    }

    window.editProduct = (id) => {
        const product = DataManager.getProductById(id);
        if (!product) return;

        modalTitle.textContent = 'Edit Product';
        editProductId.value = product.id;
        pName.value = product.name;
        pPrice.value = product.price;
        pSalePrice.value = product.salePrice || '';
        pDesc.value = product.desc;
        pImgBase64.value = product.image;

        previewImg.src = product.image;
        imagePreview.style.display = 'block';

        modalOverlay.classList.add('active');
    };

    window.deleteProduct = (id) => {
        if (!confirm('Delete this product?')) return;
        const products = DataManager.getProducts();
        const newProducts = products.filter(p => p.id !== String(id));
        DataManager.saveProducts(newProducts);
        renderAdminProducts(); // Refresh UI
    }

    // Modal Logic
    addProductBtn.addEventListener('click', () => {
        modalTitle.textContent = 'New Product';
        editProductId.value = '';
        modalOverlay.classList.add('active');
        pName.value = '';
        pPrice.value = '';
        pSalePrice.value = '';
        pDesc.value = '';
        pImgBase64.value = '';
        imagePreview.style.display = 'none';
        pImageUpload.value = '';
    });

    // Image Upload Handler
    pImageUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            pImgBase64.value = base64;
            previewImg.src = base64;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });

    closeModal.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });

    saveProductBtn.addEventListener('click', () => {
        const name = pName.value;
        const price = parseInt(pPrice.value);
        const salePrice = parseInt(pSalePrice.value) || null;
        const desc = pDesc.value;
        const img = pImgBase64.value || 'https://via.placeholder.com/400';
        const id = editProductId.value;

        if (!name || isNaN(price)) {
            alert('Please enter valid details');
            return;
        }

        const products = DataManager.getProducts();

        if (id) {
            // Edit existing
            const index = products.findIndex(p => p.id === String(id));
            if (index !== -1) {
                products[index] = { ...products[index], name, price, salePrice, desc, image: img };
            }
        } else {
            // Add new
            const ids = products.map(p => parseInt(p.id) || 0);
            const newId = (ids.length > 0 ? Math.max(...ids) + 1 : 1).toString();

            products.push({
                id: newId,
                name,
                price,
                salePrice,
                desc,
                image: img,
                tag: 'New'
            });
        }

        DataManager.saveProducts(products);
        renderAdminProducts(); // Refresh UI
        modalOverlay.classList.remove('active');
    });

    checkSession();
});
