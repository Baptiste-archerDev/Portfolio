/* ==========================================================================
   PORTFOLIO SCRIPTS — BAPTISTE LAFFOND (SWISS DESIGN DISCIPLINE)
   Curseur dynamique, Révélations asymétriques, Table d'archive & Lightbox
   ========================================================================== */

(function () {
    'use strict';

    // 1. Initialisation du curseur sur mesure suisse
    const cursor = document.createElement('div');
    cursor.className = 'swiss-cursor';
    document.body.appendChild(cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!isMoving) {
            cursor.classList.add('is-active');
            isMoving = true;
        }
    }, { passive: true });

    function renderCursor() {
        // Interpolation fluide (lerp) pour un retard maîtrisé
        cursorX += (mouseX - cursorX) * 0.22;
        cursorY += (mouseY - cursorY) * 0.22;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Expansion du curseur sur éléments interactifs
    const hoverTargets = 'a, button, [role="button"], tr.project-row, .work-spread-visual, .mascot-hero-wrap, .illustration-card-feature, .illustration-mini-card, .cartoon-sticker, .swatch-card[data-copy-hex]';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverTargets)) {
            cursor.classList.add('on-hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverTargets)) {
            cursor.classList.remove('on-hover');
        }
    });

    // Interaction ludique : Clic sur la mascotte Burger d'effigie
    const mascotHero = document.querySelector('.mascot-hero-img');
    const speechBubble = document.querySelector('.mascot-speech-bubble');
    if (mascotHero && speechBubble) {
        const quotes = [
            "Yo ! C'est Baptiste !",
            "Street cartoon & grille suisse !",
            "Skate, flèches & typographie !",
            "Archer Barebow & Graphiste !"
        ];
        let quoteIdx = 0;
        mascotHero.addEventListener('click', () => {
            quoteIdx = (quoteIdx + 1) % quotes.length;
            speechBubble.textContent = quotes[quoteIdx];
            mascotHero.style.transform = 'scale(1.22) rotate(' + (quoteIdx % 2 === 0 ? '8deg' : '-8deg') + ')';
            setTimeout(() => {
                mascotHero.style.transform = '';
            }, 300);
        });
    }

    // 2. Révélations progressives au défilement (IntersectionObserver)
    const revealEls = document.querySelectorAll('.reveal-swiss, .reveal-on-scroll, .work-spread, .stat-box');
    if ('IntersectionObserver' in window && revealEls.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        revealEls.forEach(el => observer.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    // 2B. Animations vivantes des éléments manuscrits (Scroll-trigger & Tactile)
    if ('IntersectionObserver' in window) {
        const drawObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-drawn');
                    const paths = entry.target.querySelectorAll('path');
                    paths.forEach(p => {
                        p.style.animation = 'none';
                        void p.offsetHeight; // force reflow
                        p.style.animation = '';
                    });
                    drawObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        document.querySelectorAll('.draw-underline-wrap, .draw-annotation, .draw-note, .handwritten-tag').forEach(el => {
            drawObserver.observe(el);
        });
    }

    // 3. Filtrage du Répertoire / Archive des 11 projets
    const filterChips = document.querySelectorAll('.filter-chip');
    const tableRows = document.querySelectorAll('.project-row');

    if (filterChips.length && tableRows.length) {
        filterChips.forEach(chip => {
            chip.addEventListener('click', () => {
                filterChips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const cat = chip.getAttribute('data-filter');

                tableRows.forEach(row => {
                    const rowCat = row.getAttribute('data-category');
                    if (cat === 'all' || rowCat === cat) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        });
    }

    // Clic direct sur une ligne du tableau pour ouvrir le projet
    tableRows.forEach(row => {
        row.addEventListener('click', () => {
            const href = row.getAttribute('data-href');
            if (href) window.location.href = href;
        });
    });

    // 4. Lightbox plein écran pour examen des documents et planches
    const zoomableImages = document.querySelectorAll('.zoomable-img, .work-spread-visual img');
    if (zoomableImages.length) {
        const backdrop = document.createElement('div');
        backdrop.className = 'lightbox-backdrop';
        backdrop.setAttribute('role', 'dialog');
        backdrop.setAttribute('aria-label', "Agrandissement du document");
        const fullImg = document.createElement('img');
        backdrop.appendChild(fullImg);
        document.body.appendChild(backdrop);

        zoomableImages.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener('click', (e) => {
                e.stopPropagation();
                fullImg.src = img.src;
                fullImg.alt = img.alt || 'Agrandissement';
                backdrop.classList.add('open');
            });
        });

        backdrop.addEventListener('click', () => {
            backdrop.classList.remove('open');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') backdrop.classList.remove('open');
        });
    }

    // 5. Menu Burger Mobile Responsive (Swiss Style)
    function initMobileMenu() {
        const topbar = document.querySelector('.topbar');
        if (!topbar) return;
        const topbarInner = document.querySelector('.topbar-inner') || topbar;

        // Si le bouton burger n'existe pas dans le DOM, on l'injecte
        let burgerBtn = document.querySelector('.burger-btn');
        if (!burgerBtn) {
            burgerBtn = document.createElement('button');
            burgerBtn.className = 'burger-btn';
            burgerBtn.type = 'button';
            burgerBtn.setAttribute('aria-label', 'Ouvrir le menu de navigation');
            burgerBtn.setAttribute('aria-expanded', 'false');
            burgerBtn.setAttribute('aria-controls', 'mobile-drawer');
            burgerBtn.innerHTML = `
                <span class="burger-box">
                    <span class="burger-line line-1"></span>
                    <span class="burger-line line-2"></span>
                    <span class="burger-line line-3"></span>
                </span>
            `;
            topbarInner.appendChild(burgerBtn);
        }

        // Si le tiroir mobile n'existe pas, on l'injecte
        let mobileDrawer = document.getElementById('mobile-drawer');
        if (!mobileDrawer) {
            mobileDrawer = document.createElement('div');
            mobileDrawer.className = 'mobile-drawer';
            mobileDrawer.id = 'mobile-drawer';
            mobileDrawer.setAttribute('aria-hidden', 'true');

            // Récupération des liens existants dans le header
            const desktopLinks = topbar.querySelectorAll('.nav-links .nav-link, .nav-pills .nav-pill');
            let linksHtml = '';
            let idx = 1;
            desktopLinks.forEach(link => {
                const href = link.getAttribute('href');
                const text = link.textContent.replace('←', '').trim();
                const isActive = link.classList.contains('active') ? ' active' : '';
                const target = link.getAttribute('target') ? ` target="${link.getAttribute('target')}"` : '';
                const padIdx = idx < 10 ? '0' + idx : idx;
                linksHtml += `
                    <a href="${href}" class="mobile-nav-link${isActive}"${target}>
                        <span>${text}</span>
                        <span class="mobile-nav-num">${padIdx}</span>
                    </a>
                `;
                idx++;
            });

            // Si aucun lien n'a pu être extrait, fallback sur liens principaux
            if (!linksHtml) {
                linksHtml = `
                    <a href="index.html#selection" class="mobile-nav-link"><span>Sélection</span><span class="mobile-nav-num">01</span></a>
                    <a href="index.html#repertoire" class="mobile-nav-link"><span>Répertoire (11)</span><span class="mobile-nav-num">02</span></a>
                    <a href="index.html#illustration" class="mobile-nav-link"><span>Illustration &amp; Cartoon</span><span class="mobile-nav-num">03</span></a>
                    <a href="index.html#atelier" class="mobile-nav-link"><span>Atelier &amp; Parcours</span><span class="mobile-nav-num">04</span></a>
                    <a href="projets.html" class="mobile-nav-link"><span>Catalogue</span><span class="mobile-nav-num">05</span></a>
                    <a href="cv-print.html" target="_blank" class="mobile-nav-link"><span>CV A4 Imprimable</span><span class="mobile-nav-num">06</span></a>
                `;
            }

            mobileDrawer.innerHTML = `
                <div class="mobile-drawer-inner">
                    <div class="mobile-drawer-head">
                        <span class="eyebrow eyebrow-accent">Navigation mobile</span>
                        <span class="draw-note rotate-right" style="color:var(--accent-lime); font-size:1.15rem;">« Studio d'atelier »</span>
                    </div>
                    <nav class="mobile-nav-links" aria-label="Navigation mobile">
                        ${linksHtml}
                    </nav>
                    <div class="mobile-drawer-footer">
                        <a href="mailto:laffondbaptiste47@gmail.com" class="mobile-drawer-contact">
                            <span>laffondbaptiste47@gmail.com</span>
                            <span style="color:var(--accent);">Écrire un e-mail ↗</span>
                        </a>
                        <div class="mobile-drawer-meta">
                            <span>Baptiste Laffond, BUT MMI</span>
                            <span>Millau / Le Puy-en-Velay</span>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(mobileDrawer);
        }

        function toggleMenu(open) {
            const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains('is-open');
            if (isOpen) {
                mobileDrawer.classList.add('is-open');
                mobileDrawer.setAttribute('aria-hidden', 'false');
                burgerBtn.classList.add('is-active');
                burgerBtn.setAttribute('aria-expanded', 'true');
                burgerBtn.setAttribute('aria-label', 'Fermer le menu');
                document.body.style.overflow = 'hidden';
            } else {
                mobileDrawer.classList.remove('is-open');
                mobileDrawer.setAttribute('aria-hidden', 'true');
                burgerBtn.classList.remove('is-active');
                burgerBtn.setAttribute('aria-expanded', 'false');
                burgerBtn.setAttribute('aria-label', 'Ouvrir le menu de navigation');
                document.body.style.overflow = '';
            }
        }

        burgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Fermeture au clic sur un lien du menu
        mobileDrawer.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link) {
                toggleMenu(false);
            }
        });

        // Fermeture sur Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
                toggleMenu(false);
            }
        });

        // Fermeture si on repasse au-dessus de 960px
        window.addEventListener('resize', () => {
            if (window.innerWidth > 960 && mobileDrawer.classList.contains('is-open')) {
                toggleMenu(false);
            }
        }, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }

    // 6. Barre de progression de lecture (.scroll-progress) sur les études de cas
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        const updateProgress = () => {
            const doc = document.documentElement;
            const maxScroll = doc.scrollHeight - window.innerHeight;
            const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (window.scrollY / maxScroll) * 100)) : 0;
            progressBar.style.width = pct.toFixed(2) + '%';
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    // 7. Copie des codes hexadécimaux au clic sur les nuanciers (.swatch-card[data-copy-hex])
    const swatchCards = document.querySelectorAll('.swatch-card[data-copy-hex]');
    if (swatchCards.length) {
        const toast = document.createElement('div');
        toast.className = 'copy-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);

        let toastTimer = null;
        const showToast = (msg) => {
            toast.textContent = msg;
            toast.classList.add('is-visible');
            clearTimeout(toastTimer);
            toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2000);
        };

        swatchCards.forEach(card => {
            card.setAttribute('role', 'button');
            card.setAttribute('tabindex', '0');
            const hex = card.getAttribute('data-copy-hex');
            card.setAttribute('aria-label', 'Copier la couleur ' + hex);

            const copyHex = () => {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(hex).then(() => showToast('Couleur copiée : ' + hex))
                        .catch(() => showToast('Code couleur : ' + hex));
                } else {
                    const tmp = document.createElement('textarea');
                    tmp.value = hex;
                    tmp.style.position = 'fixed';
                    tmp.style.opacity = '0';
                    document.body.appendChild(tmp);
                    tmp.select();
                    try { document.execCommand('copy'); } catch (_) {}
                    document.body.removeChild(tmp);
                    showToast('Couleur copiée : ' + hex);
                }
            };

            card.addEventListener('click', copyHex);
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    copyHex();
                }
            });
        });
    }

})();
