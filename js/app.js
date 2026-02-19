// =============================================
// MEWADA STORE — Showcase-Level Engine v2
// Lenis + GSAP ScrollTrigger + Barba.js
// =============================================

(function () {
    'use strict';

    // =========================================
    // LENIS SMOOTH SCROLL
    // =========================================
    // =========================================
    // LENIS SMOOTH SCROLL
    // =========================================
    // DETECTION
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isLowPerf = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

    let lenis;

    function initLenis() {
        if (typeof Lenis === 'undefined') return;

        lenis = new Lenis({
            duration: isTouch ? 1.0 : 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: isTouch ? 1.0 : 1.1,
            touchMultiplier: isTouch ? 1.2 : 1.5,
            lerp: isTouch ? 0.15 : 0.1, // Faster lerp on touch if enabled
        });

        // Sync ScrollTrigger with Lenis
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    // =========================================
    // SCROLL PROGRESS BAR
    // =========================================
    const scrollProgress = document.getElementById('scrollProgress');

    function updateScrollProgress() {
        if (!scrollProgress) return;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        scrollProgress.style.width = progress + '%';
    }

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    // =========================================
    // CUSTOM CURSOR — Enhanced with label text
    // =========================================
    const cursor = document.getElementById('cursor');
    const cursorLabel = cursor ? cursor.querySelector('.cursor-label') : null;
    const cursorEmoji = document.getElementById('cursorEmoji');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        if (isTouch) return;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        if (isTouch || !cursor) return;
        cursorX += (mouseX - cursorX) * 0.12;
        cursorY += (mouseY - cursorY) * 0.12;

        if (cursor) {
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    function initCursorInteractions() {
        if (!cursor || isTouch) {
            if (cursor) cursor.style.display = 'none';
            document.body.style.cursor = 'default';
            return;
        }

        // Reset cursor on any mouseenter/leave
        document.querySelectorAll('a, button').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.classList.add('active');
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('active');
                cursor.classList.remove('text-mode');
                cursor.classList.remove('emoji-mode');
                if (cursorLabel) cursorLabel.textContent = '';
                if (cursorEmoji) cursorEmoji.textContent = '';
            });
        });

        // Text cursor for elements with data-cursor-text
        document.querySelectorAll('[data-cursor-text]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                const text = el.getAttribute('data-cursor-text');
                cursor.classList.add('text-mode');
                cursor.classList.remove('active');
                cursor.classList.remove('emoji-mode');
                if (cursorLabel) cursorLabel.textContent = text;
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('text-mode');
                if (cursorLabel) cursorLabel.textContent = '';
            });
        });

        // Emoji cursor for sections with data-cursor-emoji
        document.querySelectorAll('[data-cursor-emoji]').forEach(el => {
            el.addEventListener('mouseenter', () => {
                const emoji = el.getAttribute('data-cursor-emoji');
                if (emoji && cursorEmoji) {
                    cursorEmoji.textContent = emoji;
                    cursor.classList.add('emoji-mode');
                    cursor.classList.remove('active');
                    cursor.classList.remove('text-mode');

                    // Elastic Entrance (iOS Style)
                    gsap.fromTo(cursorEmoji,
                        { scale: 0, rotate: -30 },
                        { scale: 1, rotate: 0, duration: 0.8, ease: "elastic.out(1, 0.6)" }
                    );
                }
            });
            el.addEventListener('mouseleave', () => {
                cursor.classList.remove('emoji-mode');
                if (cursorEmoji) cursorEmoji.textContent = '';
            });
        });
    }

    // =========================================
    // MAGNETIC BUTTONS — with strength control
    // =========================================
    function initMagnetic() {
        if (typeof gsap === 'undefined' || isTouch) return;

        document.querySelectorAll('[data-magnetic]').forEach(el => {
            const strength = parseFloat(el.dataset.magneticStrength) || 0.3;

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                gsap.to(el, {
                    x: x * strength,
                    y: y * strength,
                    duration: 0.4,
                    ease: 'power2.out'
                });

                // Also move inner text slightly more
                const inner = el.querySelector('span, .btn-text');
                if (inner) {
                    gsap.to(inner, {
                        x: x * strength * 0.5,
                        y: y * strength * 0.5,
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                }
            });

            el.addEventListener('mouseleave', () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
                const inner = el.querySelector('span, .btn-text');
                if (inner) {
                    gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
                }
            });
        });
    }

    // =========================================
    // PRELOADER — Animated counter + reveal
    // =========================================
    const preloader = document.getElementById('preloader');
    const preloaderNum = document.getElementById('preloaderNum');
    const preloaderFill = document.getElementById('preloaderFill');

    function runPreloader() {
        return new Promise((resolve) => {
            if (!preloader || typeof gsap === 'undefined') {
                if (preloader) preloader.style.display = 'none';
                resolve();
                return;
            }

            const counter = { val: 0 };
            const tl = gsap.timeline();

            // Animate logo letters
            tl.fromTo('.preloader-logo',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
                0
            );

            // Counter animation - Snappier
            tl.to(counter, {
                val: 100,
                duration: 1.8,
                ease: 'power2.inOut',
                onUpdate: () => {
                    const v = Math.round(counter.val);
                    if (preloaderNum) preloaderNum.textContent = v;
                    if (preloaderFill) preloaderFill.style.width = v + '%';
                }
            }, 0.2);

            // At 100%, slide up fast
            tl.to(preloader, {
                yPercent: -100,
                duration: 0.8,
                ease: 'power4.inOut',
                delay: 0.2,
                onComplete: () => {
                    preloader.classList.add('done');
                    preloader.style.display = 'none';
                    resolve();
                }
            });
        });
    }

    // =========================================
    // HERO ENTRANCE — Cinematic timeline
    // =========================================
    function animateHeroEntrance() {
        if (typeof gsap === 'undefined') return;

        const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

        // Navbar drops in
        tl.fromTo('.navbar',
            { yPercent: -100, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 0.6 },
            0.1
        );

        // Badge
        tl.fromTo('.hero-badge',
            { opacity: 0, y: 25, scale: 0.85 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5 },
            0.15
        );

        // Title words — clip-path reveal with robust visibility handling
        const titleLines = document.querySelectorAll('.hero-title .title-line');
        if (titleLines.length > 0) {
            titleLines.forEach((line, i) => {
                const words = line.querySelectorAll('.title-word');
                // Set initial state via GSAP (Progressive Enhancement)
                gsap.set(words, { clipPath: 'inset(100% 0 0 0)', yPercent: 105, opacity: 0 });

                tl.fromTo(words,
                    { clipPath: 'inset(100% 0 0 0)', yPercent: 105, opacity: 0 },
                    { clipPath: 'inset(0% 0 0 0)', yPercent: 0, opacity: 1, duration: 1.2, stagger: 0.08 },
                    0.15 + (i * 0.1)
                );
            });
        } else {
            // Fallback if structure is simple
            gsap.set('.hero-title', { opacity: 0, y: 30 });
            tl.to('.hero-title', { opacity: 1, y: 0, duration: 1 }, 0.3);
        }

        // Description
        tl.fromTo('.hero-desc',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5 },
            '-=0.8'
        );

        // CTA buttons
        tl.fromTo('.hero-cta',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5 },
            '-=0.3'
        );

        // Scroll indicator
        tl.fromTo('.hero-scroll-wrap',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.3'
        );

        return tl;
    }

    // =========================================
    // GSAP SCROLL ANIMATIONS — The big one
    // =========================================
    function initScrollAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // ---- Reveal-up elements ----
        document.querySelectorAll('.reveal-up, .reveal-clip').forEach(el => {
            if (el.closest('.hero')) return;

            const isClip = el.classList.contains('reveal-clip');
            const target = el.closest('.section-head, .footer-top, .image-reveal-content') || el;

            gsap.fromTo(el,
                isClip ? { clipPath: 'inset(100% 0 0 0)', yPercent: 100 } : { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, yPercent: 0, clipPath: 'inset(0% 0 0 0)',
                    duration: isClip ? 0.8 : 0.7,
                    ease: isClip ? 'power3.out' : 'power2.out',
                    scrollTrigger: { trigger: target, start: 'top 92%', once: true }
                }
            );
        });

        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, y: 60, scale: 0.98 },
                {
                    opacity: 1, y: 0, scale: 1, duration: 0.7,
                    delay: (i % 3) * 0.08,
                    ease: 'power2.out',
                    scrollTrigger: { trigger: card, start: 'top 95%', once: true }
                }
            );
        });

        // ---- Product image parallax ----
        cards.forEach(card => {
            const img = card.querySelector('.card-img-inner img');
            if (!img) return;
            gsap.fromTo(img,
                { yPercent: -10 },
                {
                    yPercent: 10, ease: 'none',
                    scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 1.5 }
                }
            );
        });

        // ---- Horizontal scroll showcase ----
        initHorizontalScroll();

        // ---- Image reveal section ----
        initImageReveal();

        // ---- Testimonial word-by-word ----
        initTestimonialReveal();

        // ---- Footer title words ----
        document.querySelectorAll('.footer-heading .title-word').forEach((word, i) => {
            gsap.fromTo(word,
                { clipPath: 'inset(100% 0 0 0)', yPercent: 100 },
                {
                    clipPath: 'inset(0% 0 0 0)', yPercent: 0, duration: 0.8, ease: 'power3.out',
                    delay: i * 0.05,
                    scrollTrigger: { trigger: '.footer-top', start: 'top 85%', once: true }
                }
            );
        });

        // ---- Marquee Seamless Loop ----
        initMarquee();

        // ---- Marquee speed change on scroll ----
        const marqueeTrack = document.querySelector('.marquee-track');
        if (marqueeTrack) {
            gsap.to(marqueeTrack, {
                xPercent: -20, // Subtle extra shift on scroll
                ease: 'none',
                scrollTrigger: { trigger: '.marquee-section', start: 'top bottom', end: 'bottom top', scrub: 2 }
            });
        }
    }

    // =========================================
    // MARQUEE — Dynamic Clone for Seamless Loop
    // =========================================
    function initMarquee() {
        const track = document.querySelector('.marquee-track');
        if (!track) return;

        const content = track.querySelector('.marquee-content');
        if (!content) return;

        // Clone once for the seamless effect (CSS handles the animation)
        const clone = content.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
    }

    // =========================================
    // HORIZONTAL SCROLL — Scroll-driven
    // =========================================
    function initHorizontalScroll() {
        const wrapper = document.getElementById('hscrollWrapper');
        const track = document.getElementById('hscrollTrack');
        if (!wrapper || !track) return;

        // Calculate how much to scroll
        const getScrollDistance = () => {
            return track.scrollWidth - wrapper.offsetWidth;
        };

        gsap.to(track, {
            x: () => -getScrollDistance(),
            ease: 'none',
            scrollTrigger: {
                trigger: wrapper,
                start: 'top 60%',
                end: () => `+=${getScrollDistance()}`,
                scrub: 1.5,
                invalidateOnRefresh: true,
            }
        });

        // Individual card reveal as they come in
        document.querySelectorAll('.hscroll-card').forEach((card, i) => {
            gsap.fromTo(card,
                { opacity: 0, scale: 0.9, rotationY: 5 },
                {
                    opacity: 1, scale: 1, rotationY: 0,
                    duration: 0.8, delay: i * 0.1, ease: 'power3.out',
                    scrollTrigger: { trigger: wrapper, start: 'top 70%', once: true }
                }
            );
        });
    }

    // =========================================
    // IMAGE REVEAL — Clip-path scroll reveal
    // =========================================
    function initImageReveal() {
        const wrapper = document.getElementById('imageReveal');
        if (!wrapper) return;

        const bg = wrapper.querySelector('.image-reveal-bg');
        const img = wrapper.querySelector('.image-reveal-bg img');

        // Clip-path reveal
        gsap.fromTo(wrapper,
            { clipPath: 'inset(15% 15% 15% 15% round 24px)' },
            {
                clipPath: 'inset(0% 0% 0% 0% round 24px)',
                ease: 'none',
                scrollTrigger: {
                    trigger: wrapper,
                    start: 'top 80%',
                    end: 'top 30%',
                    scrub: 1,
                    onEnter: () => wrapper.classList.add('revealed'),
                }
            }
        );

        // Parallax on the inner image
        if (img) {
            gsap.fromTo(img,
                { scale: 1.3 },
                {
                    scale: 1, ease: 'none',
                    scrollTrigger: { trigger: wrapper, start: 'top bottom', end: 'bottom top', scrub: 2 }
                }
            );
        }

        // Text reveal inside
        const titleWords = wrapper.querySelectorAll('.title-word');
        titleWords.forEach((word, i) => {
            gsap.fromTo(word,
                { clipPath: 'inset(100% 0 0 0)', yPercent: 100 },
                {
                    clipPath: 'inset(0% 0 0 0)', yPercent: 0, duration: 1, ease: 'power4.out',
                    delay: i * 0.12,
                    scrollTrigger: { trigger: wrapper, start: 'top 50%', once: true }
                }
            );
        });

        const descP = wrapper.querySelector('.image-reveal-content p');
        if (descP) {
            gsap.fromTo(descP,
                { opacity: 0, y: 20 },
                {
                    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
                    scrollTrigger: { trigger: wrapper, start: 'top 40%', once: true }
                }
            );
        }
    }

    // =========================================
    // TESTIMONIAL — Word-by-word color reveal
    // =========================================
    function initTestimonialReveal() {
        const words = document.querySelectorAll('.t-word');
        if (words.length === 0) return;

        const container = document.getElementById('testimonialText');
        if (!container) return;

        // Each word activates as you scroll through the section
        words.forEach((word, i) => {
            ScrollTrigger.create({
                trigger: container,
                start: () => `top+=${(i / words.length) * 60}% 60%`,
                end: () => `top+=${((i + 1) / words.length) * 60}% 60%`,
                onEnter: () => word.classList.add('active'),
                onLeaveBack: () => word.classList.remove('active'),
            });
        });
    }

    // =========================================
    // PRODUCT RENDERING & INTERACTIONS
    // =========================================
    function renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return;

        // Use DataManager (from js/data.js)
        const products = DataManager.getProducts();

        grid.innerHTML = products.map(p => `
            <article class="product-card" data-cursor-text="View" data-product-id="${p.id}">
                <div class="card-img">
                    <div class="card-img-inner">
                        <img src="${p.image}" alt="${p.name}" loading="lazy">
                    </div>
                    ${p.tag ? `<div class="card-tag">${p.tag}</div>` : ''}
                </div>
                <div class="card-body">
                    <div class="card-meta">
                        <h3 class="card-name">${p.name}</h3>
                        <p class="card-desc">${p.desc}</p>
                    </div>
                    <div class="card-actions">
                        <span class="card-price">₹${p.price.toLocaleString()}</span>
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
            </article>
        `).join('');
    }

    function initProductInteractions() {
        if (typeof gsap === 'undefined') return;

        // Add to Bag buttons
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();

                const card = this.closest('.product-card');
                const name = card.querySelector('.card-name').textContent;
                const priceText = card.querySelector('.card-price').textContent;
                const price = parseInt(priceText.replace(/[₹,]/g, ''));
                const productId = this.dataset.productId;

                // Feedback animation
                const textSpan = this.querySelector('.btn-text');
                const emojiSpan = this.querySelector('.btn-emoji');
                const originalText = textSpan.textContent;

                textSpan.textContent = 'Added ✓';
                if (emojiSpan) emojiSpan.style.display = 'none';
                this.classList.add('added');

                // iOS Haptic-style feedback
                gsap.to(this, {
                    scale: 0.9,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut"
                });

                gsap.fromTo(this,
                    { scale: 0.88 },
                    {
                        scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.4)', onComplete: () => {
                            addToCart(productId, name, price);
                        }
                    }
                );

                // Floating +1 animation
                const floater = document.createElement('span');
                floater.textContent = '+1';
                floater.style.cssText = 'position:absolute;font-size:.75rem;font-weight:700;color:var(--blue);pointer-events:none;z-index:10;left:50%;';
                this.appendChild(floater);

                gsap.fromTo(floater,
                    { opacity: 1, y: 0, scale: 0.5 },
                    { opacity: 0, y: -40, scale: 1.5, duration: 0.8, ease: 'power2.out', onComplete: () => floater.remove() }
                );

                setTimeout(() => {
                    textSpan.textContent = originalText;
                    if (emojiSpan) emojiSpan.style.display = '';
                    this.classList.remove('added');
                }, 1500);
            });
        });

        // 3D Tilt & Navigation on product cards
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.btn-add')) return;
                const id = card.dataset.productId;
                if (id) {
                    window.location.href = `product.html?id=${id}`;
                }
            });

            if (isTouch) return;

            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(card, {
                    rotateY: x * 8,
                    rotateX: -y * 8,
                    transformPerspective: 1000,
                    duration: 0.4,
                    ease: 'power2.out'
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotateY: 0, rotateX: 0,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.5)'
                });
            });
        });

        // Horizontal scroll card interactions
        document.querySelectorAll('.hscroll-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;
                const img = card.querySelector('img');
                if (img) {
                    gsap.to(img, {
                        x: x * 15, y: y * 15,
                        duration: 0.6, ease: 'power2.out'
                    });
                }
            });
            card.addEventListener('mouseleave', () => {
                const img = card.querySelector('img');
                if (img) {
                    gsap.to(img, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)' });
                }
            });
        });
    }

    // =========================================
    // NAVBAR BEHAVIOR
    // =========================================
    const navbar = document.getElementById('navbar');
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });

    menuBtn.addEventListener('click', () => {
        menuBtn.classList.toggle('active');
        mobileMenu.classList.toggle('active');
    });

    function initNavLinks() {
        document.querySelectorAll('.nav-link, .mobile-menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        if (lenis) {
                            lenis.scrollTo(target, { offset: -56 });
                        } else {
                            window.scrollTo({ top: target.offsetTop - 56, behavior: 'smooth' });
                        }
                    }
                    menuBtn.classList.remove('active');
                    mobileMenu.classList.remove('active');
                }
            });
        });
    }

    // =========================================
    // SECRET ADMIN ACCESS — Long press logo
    // =========================================
    function initSecretAccess() {
        const logo = document.getElementById('secretTrigger');
        if (!logo) return;

        let pressTimer;
        const duration = 2000; // 2 seconds

        const startPress = (e) => {
            // e.preventDefault(); // Optional: prevent default selection
            pressTimer = setTimeout(() => {
                // Success feedback
                gsap.to(logo, { scale: 0.9, duration: 0.2, yoyo: true, repeat: 1 });
                setTimeout(() => {
                    window.location.href = 'admin.html';
                }, 500);
            }, duration);
        };

        const cancelPress = () => {
            clearTimeout(pressTimer);
        };

        // Mouse events
        logo.addEventListener('mousedown', startPress);
        logo.addEventListener('mouseup', cancelPress);
        logo.addEventListener('mouseleave', cancelPress);

        // Touch events
        logo.addEventListener('touchstart', startPress, { passive: true });
        logo.addEventListener('touchend', cancelPress);
    }

    // =========================================
    // BARBA.JS — 5-panel slide transition
    // =========================================
    function initBarba() {
        if (typeof barba === 'undefined' || typeof gsap === 'undefined') return;

        const slides = document.querySelectorAll('.transition-slide');

        barba.init({
            preventRunning: true,
            transitions: [{
                name: 'premium-transition',

                leave(data) {
                    const tl = gsap.timeline();

                    // Cover screen with overlapping panels (Awwwards Style)
                    tl.to(slides, {
                        scaleY: 1,
                        transformOrigin: 'bottom',
                        duration: 0.6,
                        stagger: {
                            each: 0.05,
                            from: 'start'
                        },
                        ease: 'power4.inOut'
                    });

                    tl.to(data.current.container, {
                        opacity: 0,
                        scale: 0.98,
                        filter: 'blur(10px)',
                        duration: 0.4,
                    }, '<0.2');

                    return tl;
                },

                enter(data) {
                    const tl = gsap.timeline();
                    window.scrollTo(0, 0);
                    if (lenis) lenis.scrollTo(0, { immediate: true });

                    gsap.set(data.next.container, { opacity: 0, y: 30, scale: 1.02 });

                    // Uncover panels with delay
                    tl.to(slides, {
                        scaleY: 0,
                        transformOrigin: 'top',
                        duration: 0.6,
                        stagger: {
                            each: 0.05,
                            from: 'end'
                        },
                        ease: 'power4.inOut',
                        delay: 0.1
                    });

                    tl.to(data.next.container, {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        duration: 0.8,
                        ease: 'power3.out'
                    }, '-=0.4');

                    return tl;
                },

                afterEnter(data) {
                    // Re-initialize for new page
                    initLenis();
                    initScrollAnimations();
                    initCursorInteractions();
                    initMagnetic();
                    initNavLinks();
                    initSecretAccess();
                    initProductInteractions();
                    initCartButtons();

                    if (data.next.namespace === 'home') {
                        renderProducts();
                        animateHeroEntrance();
                    }

                    if (typeof ScrollTrigger !== 'undefined') {
                        ScrollTrigger.refresh();
                        // Small delay for dynamic layouts
                        setTimeout(() => ScrollTrigger.refresh(), 200);
                    }
                }
            }]
        });
    }

    // =========================================
    // SHOPPING CART
    // =========================================
    const cartPanel = document.getElementById('cartPanel');
    const cartBackdrop = document.getElementById('cartBackdrop');
    const cartPanelClose = document.getElementById('cartPanelClose');
    const cartPanelBody = document.getElementById('cartPanelBody');
    const cartCount = document.getElementById('cartCount');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');

    let cart = [];

    function openCart() {
        cartPanel.classList.add('active');
        cartBackdrop.classList.add('active');
        document.body.style.overflow = 'hidden';
        if (lenis) lenis.stop();
    }

    function closeCart() {
        cartPanel.classList.remove('active');
        cartBackdrop.classList.remove('active');
        document.body.style.overflow = '';
        if (lenis) lenis.start();
    }

    function initCartButtons() {
        const cartBtn = document.getElementById('cartBtn');
        if (cartBtn) cartBtn.addEventListener('click', openCart);
    }

    cartPanelClose.addEventListener('click', closeCart);
    cartBackdrop.addEventListener('click', closeCart);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
            menuBtn.classList.remove('active');
            mobileMenu.classList.remove('active');
        }
    });

    function addToCart(productId, name, price) {
        const existing = cart.find(item => item.id === productId);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ id: productId, name, price, qty: 1 });
        }
        renderCart();
        openCart();
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        renderCart();
    }

    function updateQty(productId, delta) {
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.qty += delta;
            if (item.qty <= 0) { removeFromCart(productId); return; }
        }
        renderCart();
    }

    // Expose functions globally for product.js
    window.__addToCart = addToCart;
    window.__removeFromCart = removeFromCart;
    window.__updateQty = updateQty;
    window.__openCart = openCart;

    function renderCart() {
        const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
        cartCount.textContent = totalItems;

        // Badge visibility
        if (totalItems > 0) {
            cartCount.classList.add('visible');
        } else {
            cartCount.classList.remove('visible');
        }

        // Pop animation
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(cartCount,
                { scale: 1.5 },
                { scale: 1, duration: 0.35, ease: 'back.out(2)' }
            );
        }

        if (cart.length === 0) {
            cartPanelBody.innerHTML = `
                <div class="cart-empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/></svg>
                    <p>Your bag is empty</p>
                </div>
            `;
            cartTotalPrice.textContent = '₹0';
            return;
        }

        let total = 0;
        let html = '';
        cart.forEach((item, idx) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            html += `
                <div class="cart-item" style="animation-delay:${idx * 0.06}s">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
                    </div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="window.__updateQty('${item.id}', -1)">−</button>
                        <span class="qty-val">${item.qty}</span>
                        <button class="qty-btn" onclick="window.__updateQty('${item.id}', 1)">+</button>
                    </div>
                    <button class="cart-item-remove" onclick="window.__removeFromCart('${item.id}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                </div>
            `;
        });

        cartPanelBody.innerHTML = html;
        cartTotalPrice.textContent = `₹${total.toLocaleString()}`;
    }

    window.__updateQty = updateQty;
    window.__removeFromCart = removeFromCart;

    // =========================================
    // EXPOSE CART FUNCTIONS
    // =========================================
    window.__addToCart = addToCart;
    window.__openCart = openCart;

    // =========================================
    // WHATSAPP CHECKOUT
    // =========================================
    // WHATSAPP_NUMBER is now in APP_CONFIG from data.js

    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) return;

        let message = '🛍️ *New Order from Mewada Store*\n\n';
        let total = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            message += `• ${item.name} × ${item.qty} = ₹${itemTotal.toLocaleString()}\n`;
        });

        message += `\n*Total: ₹${total.toLocaleString()}*`;
        message += '\n\nPlease confirm my order. Thank you!';

        window.open(`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    });

    const footerWhatsapp = document.getElementById('footerWhatsapp');
    if (footerWhatsapp) {
        footerWhatsapp.addEventListener('click', (e) => {
            e.preventDefault();
            cart.length > 0 ? openCart() : window.open(`https://wa.me/${APP_CONFIG.WHATSAPP_NUMBER}`, '_blank');
        });
    }

    // =========================================
    // THEME SWITCHER (Light / Dark / Auto)
    // =========================================
    function initTheme() {
        const themeToggle = document.getElementById('themeToggle');
        if (!themeToggle) return;

        const themeIcon = themeToggle.querySelector('i');
        const themes = ['auto', 'light', 'dark'];

        // Get initial theme
        let currentTheme = localStorage.getItem('mewada-theme') || 'auto';

        function applyTheme(theme) {
            if (theme === 'auto') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', theme);
            }

            // Update Icon
            if (themeIcon) {
                if (theme === 'light') themeIcon.className = 'ri-sun-line';
                else if (theme === 'dark') themeIcon.className = 'ri-moon-line';
                else themeIcon.className = 'ri-computer-line';
            }

            localStorage.setItem('mewada-theme', theme);
        }

        // Apply saved theme immediately
        applyTheme(currentTheme);

        themeToggle.addEventListener('click', () => {
            let nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
            currentTheme = themes[nextIndex];
            applyTheme(currentTheme);

            // Subtle feedback animation using GSAP
            if (typeof gsap !== 'undefined') {
                gsap.fromTo(themeIcon,
                    { scale: 0.5, rotate: -30, opacity: 0 },
                    { scale: 1, rotate: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)' }
                );
            }
        });
    }

    // =========================================
    // MASTER INIT
    // =========================================
    async function masterInit() {
        await runPreloader();
        renderProducts(); // Render before animations
        animateHeroEntrance();
        initLenis();
        initScrollAnimations();
        initCursorInteractions();
        initMagnetic();
        initNavLinks();
        initSecretAccess();
        initProductInteractions();
        initCartButtons();
        initTheme();
        initBarba();

        console.log('%c🛍️ Mewada Store', 'font-size:20px;font-weight:bold;color:#0071e3');
        console.log('%cShowcase Engine v2 — Lenis + GSAP + Barba.js', 'font-size:11px;color:#86868b');
    }

    // Expose for product.js
    window.__initProductInteractions = initProductInteractions;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', masterInit);
    } else {
        masterInit();
    }

})();
