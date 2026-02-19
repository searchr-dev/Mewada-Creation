document.addEventListener('DOMContentLoaded', () => {
    // Get Product ID
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const container = document.getElementById('productDetailContainer');
    const moreGrid = document.getElementById('moreProductsGrid');

    if (!id) {
        window.location.href = 'index.html';
        return;
    }

    const product = DataManager.getProductById(id);

    if (!product) {
        container.innerHTML = `
            <div style="text-align:center; padding: 4rem;">
                <h2>Product not found</h2>
                <a href="index.html" class="btn-outline" style="margin-top:1rem; display:inline-block;">Back to Home</a>
            </div>
        `;
        return;
    }

    // Render Main Product
    document.title = `${product.name} - Mewada Store`;
    const hasSale = product.salePrice && product.salePrice < product.price;
    const currentPrice = hasSale ? product.salePrice : product.price;

    const waMessage = `Hi, I'm interested in buying your *${product.name}* (₹${currentPrice.toLocaleString()}). Is it available?`;
    const waLink = `https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

    container.innerHTML = `
        <div class="pd-image-col">
            <div class="pd-image-wrapper reveal-up">
                <img src="${product.image}" alt="${product.name}" id="mainCImage">
            </div>
        </div>
        <div class="pd-info-col">
            <div class="pd-breadcrumbs reveal-up">
                <a href="index.html">Home</a> / <a href="index.html#products">Products</a> / <span>${product.name}</span>
            </div>
            
            <h1 class="pd-title reveal-up">${product.name}</h1>
            
            <div class="pd-price-row reveal-up">
                <div style="display:flex; flex-direction:column;">
                    ${hasSale ? `<span style="font-size:1rem; text-decoration:line-through; opacity:0.5; margin-bottom:4px;">₹${product.price.toLocaleString()}</span>` : ''}
                    <span class="pd-price" style="${hasSale ? 'color:#30d158;' : ''}">₹${currentPrice.toLocaleString()}</span>
                </div>
                ${hasSale ? `<span class="pd-tag" style="background:#30d158">SALE</span>` : (product.tag ? `<span class="pd-tag">${product.tag}</span>` : '')}
            </div>

            <p class="pd-desc reveal-up">${product.desc}</p>

            <div class="pd-actions reveal-up">
                <button class="btn-add-large magnetic" data-magnetic id="pdAddBtn">
                    <span class="emoji-btn-inner">
                        <span class="btn-text">Add to Bag</span>
                        <span class="btn-emoji">✨</span>
                    </span>
                </button>
                <a href="${waLink}" target="_blank" class="btn-buy-now magnetic" data-magnetic>
                    <span class="emoji-btn-inner">
                        <span class="btn-text">Buy Now</span>
                        <span class="btn-emoji">🛍️</span>
                    </span>
                    <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                </a>
            </div>

            <div class="pd-extra">
                <div class="pd-feature"><span>🚚</span> Free Delivery</div>
                <div class="pd-feature"><span>🛡️</span> Genuine Product</div>
            </div>
        </div>
    `;

    // Render More Products Grid
    function renderMoreProducts() {
        if (!moreGrid) return;
        const allProducts = DataManager.getProducts();
        const otherProducts = allProducts.filter(p => p.id !== id);

        moreGrid.innerHTML = '';
        otherProducts.forEach(p => {
            const hasSale = p.salePrice && p.salePrice < p.price;
            const card = document.createElement('article');
            card.className = 'product-card reveal-up';
            card.dataset.cursorText = 'View';
            card.dataset.productId = p.id;
            card.innerHTML = `
                <div class="card-img">
                    <div class="card-img-inner">
                        <img src="${p.image}" alt="${p.name}" loading="lazy">
                    </div>
                    ${hasSale ? `<div class="card-tag" style="background:#30d158">Sale</div>` : (p.tag ? `<div class="card-tag">${p.tag}</div>` : '')}
                </div>
                <div class="card-body">
                    <div class="card-meta">
                        <h3 class="card-name">${p.name}</h3>
                        <p class="card-desc">${p.desc}</p>
                    </div>
                    <div class="card-actions">
                        <div class="card-price-wrap">
                            ${hasSale ? `<span class="card-price-original" style="font-size:0.8rem; text-decoration:line-through; opacity:0.5; display:block; margin-bottom:-2px;">₹${p.price.toLocaleString()}</span>` : ''}
                            <span class="card-price" style="${hasSale ? 'color:#30d158;' : ''}">₹${(hasSale ? p.salePrice : p.price).toLocaleString()}</span>
                        </div>
                        <button class="btn-add magnetic" data-product-id="${p.id}" data-magnetic>
                            <span class="emoji-btn-inner">
                                <span class="btn-text">Add</span>
                                <span class="btn-emoji">🛍️</span>
                            </span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            moreGrid.appendChild(card);
        });
    }
    renderMoreProducts();

    // Re-initialize interactions for the new cards
    if (window.__initProductInteractions) {
        window.__initProductInteractions();
    }

    const addBtn = document.getElementById('pdAddBtn');
    addBtn.addEventListener('click', () => {
        if (window.__addToCart) {
            window.__addToCart(product.id, product.name, product.price);
            const span = addBtn.querySelector('span');
            const originalText = span.textContent;
            span.textContent = 'Added to Bag ✓';
            addBtn.style.background = 'var(--g6)';
            addBtn.style.color = 'var(--white)';
            setTimeout(() => {
                span.textContent = originalText;
                addBtn.style.background = '';
                addBtn.style.color = '';
            }, 2000);
        }
    });

    if (typeof gsap !== 'undefined') {
        gsap.fromTo('.reveal-up',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
        );
    }
});
