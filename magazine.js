/* Magazine — scroll : progression, révélation, parallaxe, filtres, navigation enrichie & lightbox */
(function() {
    document.documentElement.classList.add('js');
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var bar = document.querySelector('.progress');
    var heroImg = document.querySelector('.hero > img');

    // Liste complète des projets pour la navigation rapide et le passage Précédent / Suivant
    var projects = [
        { num: '01', title: 'Campagne Lacoste', cat: 'Direction artistique', href: 'lacoste_project.html' },
        { num: '02', title: 'Union Cycliste (UCPV)', cat: 'Campagne 360°', href: 'ucpv.html' },
        { num: '03', title: 'Mes créations', cat: 'Création visuelle', href: 'creation.html' },
        { num: '04', title: 'Hava Archerie', cat: 'Branding', href: 'hava-archerie.html' },
        { num: '05', title: 'Magazine Interface', cat: 'Édition', href: 'mag-interface.html' },
        { num: '06', title: 'FlèchOptim', cat: 'Outil web', href: 'FlechOptim.html' },
        { num: '07', title: 'Tour de France', cat: 'Design graphique', href: 'tour-de-france.html' },
        { num: '08', title: 'Rallye des Cardabelles', cat: 'Photographie', href: 'rallye-cardabelles.html' },
        { num: '09', title: 'Archers du Velay', cat: 'Charte graphique', href: 'archers-du-velay.html' },
        { num: '10', title: 'After Effects & Storyboard', cat: 'Motion & Vidéo', href: 'motion-storyboard.html' }
    ];

    var currentFile = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    var currentIdx = -1;
    projects.forEach(function(p, idx) {
        if (p.href.toLowerCase() === currentFile) currentIdx = idx;
    });

    // Enrichissement de la barre de navigation supérieure (.topbar)
    var topbarNav = document.querySelector('.topbar nav');
    if (topbarNav) {
        // Ajoute un lien direct vers le Sommaire du magazine s'il n'existe pas déjà
        var hasSommaire = [].some.call(topbarNav.querySelectorAll('a'), function(a) {
            return a.textContent.trim().toLowerCase() === 'sommaire';
        });
        if (!hasSommaire) {
            var firstLink = topbarNav.querySelector('a');
            var somLink = document.createElement('a');
            somLink.href = 'index.html#sommaire';
            somLink.textContent = 'Sommaire';
            if (firstLink && firstLink.nextSibling) topbarNav.insertBefore(somLink, firstLink.nextSibling);
            else topbarNav.appendChild(somLink);
        }

        // Marque la page active
        [].slice.call(topbarNav.querySelectorAll('a')).forEach(function(a) {
            var h = (a.getAttribute('href') || '').toLowerCase();
            if (h === currentFile) a.classList.add('active');
        });

        // Ajoute le menu déroulant "Accès rapide ▾"
        var dd = document.createElement('div');
        dd.className = 'nav-dropdown';
        var ddBtn = document.createElement('button');
        ddBtn.type = 'button';
        ddBtn.className = 'nav-dropdown-btn';
        ddBtn.setAttribute('aria-expanded', 'false');
        ddBtn.innerHTML = 'Accès rapide ▾';
        var ddMenu = document.createElement('div');
        ddMenu.className = 'nav-dropdown-menu';

        projects.forEach(function(p, idx) {
            var item = document.createElement('a');
            item.href = p.href;
            if (idx === currentIdx) item.className = 'current';
            item.innerHTML = '<span>' + p.num + '</span>' + p.title + '<em>' + p.cat + '</em>';
            ddMenu.appendChild(item);
        });

        dd.appendChild(ddBtn);
        dd.appendChild(ddMenu);
        topbarNav.appendChild(dd);

        ddBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            var open = dd.classList.toggle('open');
            ddBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.addEventListener('click', function(e) {
            if (!dd.contains(e.target)) {
                dd.classList.remove('open');
                ddBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Barre flottante de navigation entre projets sur les pages études de cas
    if (currentIdx !== -1) {
        var prevProj = projects[(currentIdx - 1 + projects.length) % projects.length];
        var nextProj = projects[(currentIdx + 1) % projects.length];
        var floatNav = document.createElement('nav');
        floatNav.className = 'proj-float-nav';
        floatNav.setAttribute('aria-label', 'Navigation entre les projets');
        floatNav.innerHTML =
            '<a href="' + prevProj.href + '" title="Projet précédent : ' + prevProj.title + '">← ' + prevProj.title + '</a>' +
            '<a href="projets.html" class="proj-float-index" title="Voir tous les projets">☰ Projets (' + (currentIdx + 1) + '/' + projects.length + ')</a>' +
            '<a href="' + nextProj.href + '" title="Projet suivant : ' + nextProj.title + '">' + nextProj.title + ' →</a>' +
            '<button type="button" title="Remonter en haut de page" aria-label="Haut de page">↑</button>';
        floatNav.querySelector('button').addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });
        document.body.appendChild(floatNav);
    }

    // Révélation au scroll
    var rvs = [].slice.call(document.querySelectorAll('.rv'));
    if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function(es) {
            es.forEach(function(e) {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    io.unobserve(e.target);
                }
            });
        }, { threshold: .12 });
        rvs.forEach(function(el) { io.observe(el); });
    } else {
        rvs.forEach(function(el) { el.classList.add('in'); });
    }

    // Progression au scroll
    var tick = false;
    function onScroll() {
        tick = false;
        var max = document.documentElement.scrollHeight - innerHeight;
        if (bar) bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%';
    }
    addEventListener('scroll', function() {
        if (!tick) {
            tick = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });
    onScroll();

    // Filtres de la page projets
    var btns = [].slice.call(document.querySelectorAll('.filters button'));
    btns.forEach(function(b) {
        b.addEventListener('click', function() {
            btns.forEach(function(x) { x.classList.toggle('on', x === b); });
            var f = b.dataset.f;
            document.querySelectorAll('.card').forEach(function(c) {
                c.classList.toggle('hide', f !== 'all' && c.dataset.type !== f);
            });
        });
    });

    // Lightbox enrichie avec boutons Précédent / Suivant pour les galeries
    var imgs = [].slice.call(document.querySelectorAll('.gallery img'));
    if (imgs.length) {
        var lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.innerHTML =
            '<button type="button" class="lb-close" aria-label="Fermer">×</button>' +
            '<button type="button" class="lb-nav lb-prev" aria-label="Image précédente">‹</button>' +
            '<img alt="">' +
            '<button type="button" class="lb-nav lb-next" aria-label="Image suivante">›</button>' +
            '<div class="cap"></div>';
        document.body.appendChild(lb);
        var lbImg = lb.querySelector('img'),
            cap = lb.querySelector('.cap'),
            btnPrev = lb.querySelector('.lb-prev'),
            btnNext = lb.querySelector('.lb-next'),
            cur = 0;

        var show = function(i) {
            cur = (i + imgs.length) % imgs.length;
            lbImg.src = imgs[cur].src;
            lbImg.alt = imgs[cur].alt;
            cap.textContent = imgs[cur].alt + '  ·  ' + (cur + 1) + ' / ' + imgs.length;
            lb.classList.add('open');
        };

        imgs.forEach(function(im, i) {
            im.addEventListener('click', function() { show(i); });
        });
        btnPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            show(cur - 1);
        });
        btnNext.addEventListener('click', function(e) {
            e.stopPropagation();
            show(cur + 1);
        });
        lbImg.addEventListener('click', function(e) {
            e.stopPropagation();
        });
        lb.addEventListener('click', function() {
            lb.classList.remove('open');
        });
        document.addEventListener('keydown', function(e) {
            if (!lb.classList.contains('open')) return;
            if (e.key === 'Escape') lb.classList.remove('open');
            if (e.key === 'ArrowRight') show(cur + 1);
            if (e.key === 'ArrowLeft') show(cur - 1);
        });
    }
})();