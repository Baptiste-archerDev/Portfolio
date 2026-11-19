/* Maquettes Instagram animées : carrousel qui se « swipe », stories avec minuteur, reel, cartes retournables.
   Aucune dépendance. Chaque maquette ne s'anime que lorsqu'elle est visible à l'écran. */
(function () {
    'use strict';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function whenVisible(el, onIn, onOut) {
        if (!('IntersectionObserver' in window)) { onIn(); return; }
        new IntersectionObserver((entries) => {
            entries.forEach((e) => (e.isIntersecting ? onIn() : onOut && onOut()));
        }, { threshold: 0.45 }).observe(el);
    }

    /* ------------------------------------------------------------------ carrousel */
    document.querySelectorAll('[data-ig-carousel]').forEach((root) => {
        const track = root.querySelector('.ig-track');
        const slides = Array.from(track.children);
        const post = root.closest('.ig-post') || root;
        const dots = Array.from(post.querySelectorAll('.ig-dots i'));
        const count = root.querySelector('.ig-count');
        const prev = root.querySelector('.ig-arrow.prev');
        const next = root.querySelector('.ig-arrow.next');
        const finger = root.querySelector('.ig-finger');
        const pop = root.querySelector('.ig-heart-pop');
        const like = post.querySelector('.ig-like-btn');
        const delay = Number(root.dataset.delay || 2800);
        let index = 0, timer = null, visible = false, holdUntil = 0, hinted = false;

        const width = () => track.clientWidth || 1;
        function update(i) {
            index = i;
            dots.forEach((d, k) => d.classList.toggle('on', k === i));
            if (count) count.textContent = (i + 1) + '/' + slides.length;
            if (prev) prev.disabled = i === 0;
            if (next) next.disabled = i === slides.length - 1;
        }
        function go(i, smooth = true) {
            i = Math.max(0, Math.min(slides.length - 1, i));
            track.scrollTo({ left: i * width(), behavior: smooth && !reduce ? 'smooth' : 'auto' });
            update(i);
        }
        track.addEventListener('scroll', () => {
            const i = Math.round(track.scrollLeft / width());
            if (i !== index) update(i);
        }, { passive: true });

        function step() {
            if (!visible || Date.now() < holdUntil) return;
            if (index >= slides.length - 1) { go(0); return; }
            if (finger && !hinted) { hinted = true; finger.classList.remove('go'); void finger.offsetWidth; finger.classList.add('go'); }
            go(index + 1);
        }
        function start() { if (reduce || timer) return; timer = setInterval(step, delay); }
        function stop() { clearInterval(timer); timer = null; }
        const pauseFor = (ms) => { holdUntil = Date.now() + ms; };

        whenVisible(root, () => { visible = true; start(); }, () => { visible = false; stop(); });
        root.addEventListener('pointerenter', () => pauseFor(6000));
        prev && prev.addEventListener('click', () => { pauseFor(7000); go(index - 1); });
        next && next.addEventListener('click', () => { pauseFor(7000); go(index + 1); });

        // glisser à la souris (le tactile est géré nativement par le scroll-snap)
        let drag = null;
        track.addEventListener('pointerdown', (e) => {
            pauseFor(7000);
            if (e.pointerType !== 'mouse') return;
            drag = { x: e.clientX, left: track.scrollLeft, moved: false };
            track.classList.add('is-dragging');
            track.setPointerCapture(e.pointerId);
        });
        track.addEventListener('pointermove', (e) => {
            if (!drag) return;
            const dx = e.clientX - drag.x;
            if (Math.abs(dx) > 4) drag.moved = true;
            track.scrollLeft = drag.left - dx;
        });
        const endDrag = (e) => {
            if (!drag) return;
            const dx = e.clientX - drag.x;
            track.classList.remove('is-dragging');
            let target = Math.round(drag.left / width());
            if (dx < -40) target += 1; else if (dx > 40) target -= 1;
            drag = null;
            go(target);
        };
        track.addEventListener('pointerup', endDrag);
        track.addEventListener('pointercancel', endDrag);

        // double-clic = « j'aime »
        function heart() {
            if (like) like.classList.add('on');
            if (pop) { pop.classList.remove('go'); void pop.offsetWidth; pop.classList.add('go'); }
        }
        track.addEventListener('dblclick', heart);
        like && like.addEventListener('click', () => like.classList.toggle('on'));
        update(0);
    });

    /* ------------------------------------------------------------------ stories */
    document.querySelectorAll('[data-ig-story]').forEach((root) => {
        const items = Array.from(root.querySelectorAll('.ig-story-media > *'));
        const barsBox = root.querySelector('.ig-bars');
        const timeEl = root.querySelector('.ig-time');
        barsBox.innerHTML = items.map(() => '<span><i></i></span>').join('');
        const bars = Array.from(barsBox.querySelectorAll('i'));
        let k = 0, elapsed = 0, last = 0, running = false, paused = false, raf = 0;

        const dur = (el) => {
            if (el.tagName === 'VIDEO' && el.duration && isFinite(el.duration)) return el.duration * 1000;
            return Number(el.dataset.dur || 5000);
        };
        function show(i) {
            k = (i + items.length) % items.length;
            elapsed = 0;
            items.forEach((el, n) => {
                el.classList.toggle('on', n === k);
                if (el.tagName === 'VIDEO') { if (n === k) { el.currentTime = 0; el.play().catch(() => {}); } else el.pause(); }
            });
            bars.forEach((b, n) => { b.style.width = n < k ? '100%' : '0%'; });
            if (timeEl) timeEl.textContent = items[k].dataset.time || '';
        }
        function tick(t) {
            if (!running) return;
            const dt = last ? t - last : 0; last = t;
            if (!paused) elapsed += dt;
            const d = dur(items[k]);
            bars[k].style.width = Math.min(100, (elapsed / d) * 100) + '%';
            if (elapsed >= d) show(k + 1);
            raf = requestAnimationFrame(tick);
        }
        function play() { if (running) return; running = true; last = 0; const v = items[k]; if (v.tagName === 'VIDEO') v.play().catch(() => {}); raf = requestAnimationFrame(tick); }
        function halt() { running = false; cancelAnimationFrame(raf); items.forEach((el) => el.tagName === 'VIDEO' && el.pause()); }
        function setPaused(p) { paused = p; root.classList.toggle('paused', p); const v = items[k]; if (v.tagName === 'VIDEO') p ? v.pause() : v.play().catch(() => {}); }

        // toucher à gauche = précédente, à droite = suivante, appui long = pause
        let downAt = 0, holdT = 0;
        root.addEventListener('pointerdown', () => { downAt = Date.now(); holdT = setTimeout(() => setPaused(true), 220); });
        root.addEventListener('pointerup', (e) => {
            clearTimeout(holdT);
            if (paused) { setPaused(false); return; }
            if (Date.now() - downAt > 400) return;
            const r = root.getBoundingClientRect();
            show(e.clientX - r.left < r.width * 0.33 ? k - 1 : k + 1);
        });
        root.addEventListener('pointerleave', () => { clearTimeout(holdT); if (paused) setPaused(false); });

        show(0);
        if (reduce) { bars[0].style.width = '100%'; return; }
        whenVisible(root, play, halt);
    });

    /* ------------------------------------------------------------------ reels */
    document.querySelectorAll('[data-ig-reel]').forEach((root) => {
        const v = root.querySelector('video');
        const bar = root.querySelector('.ig-reel-progress i');
        const snd = root.querySelector('.ig-sound');
        v.addEventListener('timeupdate', () => { if (v.duration) bar.style.width = (v.currentTime / v.duration) * 100 + '%'; });
        snd && snd.addEventListener('click', (e) => { e.stopPropagation(); v.muted = !v.muted; snd.textContent = v.muted ? '🔇 Activer le son' : '🔊 Son activé'; if (v.paused) v.play().catch(() => {}); });
        root.addEventListener('click', () => (v.paused ? v.play().catch(() => {}) : v.pause()));
        if (!reduce) whenVisible(root, () => v.play().catch(() => {}), () => v.pause());
    });

    /* ------------------------------------------------------------------ cartes de visite */
    document.querySelectorAll('.hv-card').forEach((c) => {
        c.addEventListener('click', () => c.classList.toggle('flipped'));
    });
})();
