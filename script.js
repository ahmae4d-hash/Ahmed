/* ====================================================
   AHMED SAED — Portfolio Script
   Vanilla JS + GSAP 3
   - Fully responsive
   - Video restarts when hero re-enters viewport
   - Ultra-smooth GPU-only animations
==================================================== */

gsap.registerPlugin(ScrollTrigger, CustomEase);
CustomEase.create("rockFall", "M0,0 C0.1,0 0.22,0.08 0.28,0.4 0.35,0.72 0.4,1.02 0.45,1.06 0.5,1.1 0.6,1.04 0.65,1.0 0.7,0.96 1,1 1,1");

function rand(a, b) { return a + Math.random() * (b - a); }

/* ====================================================
   0. LOADING SCREEN
==================================================== */
(function initLoader() {
  const loader   = document.getElementById('loader');
  const lottieEl = document.getElementById('lottieLoader');
  const video    = document.getElementById('heroVideo');

  if (typeof lottie !== 'undefined' && lottieEl) {
    lottie.loadAnimation({
      container: lottieEl, renderer: 'svg', loop: true, autoplay: true, path: 'loading.json'
    });
  }

  function hideLoader() {
    if (!loader || loader.classList.contains('hidden')) return;
    gsap.to(loader, {
      opacity: 0, duration: 0.7, ease: 'power2.inOut',
      onComplete: () => loader.classList.add('hidden')
    });
  }

  const fallback = setTimeout(hideLoader, 6000);

  if (video) {
    const ready = () => { clearTimeout(fallback); setTimeout(hideLoader, 200); };
    if (video.readyState >= 3) { ready(); }
    else {
      video.addEventListener('canplay',        ready, { once: true });
      video.addEventListener('canplaythrough', ready, { once: true });
    }
  }
})();

/* ====================================================
   1. VIDEO — autoplay + restart on re-enter
==================================================== */
(function setupVideo() {
  const video = document.getElementById('heroVideo');
  if (!video) return;

  video.muted = true;
  video.playsInline = true;

  /* force play on all browsers */
  function tryPlay() {
    return video.play().catch(() => {});
  }

  tryPlay();
  ['click', 'touchstart', 'touchend', 'pointerdown'].forEach(ev => {
    document.addEventListener(ev, tryPlay, { once: true });
  });

  /* restart video when hero section comes back into view */
  let heroWasVisible = true;
  const heroEl = document.getElementById('hero');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!heroWasVisible) {
          /* hero re-entered — restart from beginning */
          video.currentTime = 0;
          tryPlay();
        }
        heroWasVisible = true;
      } else {
        heroWasVisible = false;
      }
    });
  }, { threshold: 0.25 });

  if (heroEl) observer.observe(heroEl);

  /* also restart when scroll goes idle while hero is visible */
  let scrollTimer = null;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (heroWasVisible) {
        video.currentTime = 0;
        tryPlay();
      }
    }, 600);
  }, { passive: true });
})();

/* ====================================================
   2. ROCK NAME DROP
==================================================== */
function spawnDust(container, cx, cy, count) {
  const colors = ['#00c8ff','#7b2fff','#ffffff','#ff2d78','#ccccee'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'dust-particle';
    const s = rand(3, 11);
    const c = colors[Math.floor(Math.random() * colors.length)];
    Object.assign(p.style, {
      width: s + 'px', height: s + 'px', background: c,
      left: cx + 'px', top: cy + 'px', opacity: '1',
      boxShadow: `0 0 ${s * 2}px ${c}`
    });
    container.appendChild(p);
    gsap.to(p, {
      x: rand(-200, 200), y: rand(-110, 50), opacity: 0,
      scale: rand(0.1, 1.4), duration: rand(0.5, 1.2), ease: 'power2.out',
      onComplete: () => p.remove()
    });
  }
}

function triggerImpact() {
  const wrapper = document.getElementById('rockWrapper');
  const dust    = document.getElementById('dustContainer');
  const crack   = document.getElementById('crackLine');
  const section = document.querySelector('.name-section');
  const sRect   = section.getBoundingClientRect();
  const wRect   = wrapper.getBoundingClientRect();

  spawnDust(dust, wRect.left - sRect.left + wRect.width / 2, wRect.bottom - sRect.top, 70);

  gsap.to(crack, { width: '88%', opacity: 1, duration: 0.3, ease: 'power3.out' });
  gsap.to(crack, { opacity: 0, delay: 1.1, duration: 0.5 });

  gsap.to(section, {
    keyframes: [
      { x: -9,  y:  4, duration: 0.04 },
      { x:  9,  y: -4, duration: 0.04 },
      { x: -7,  y:  4, duration: 0.04 },
      { x:  7,  y: -2, duration: 0.04 },
      { x: -3,  y:  2, duration: 0.04 },
      { x:  3,  y: -1, duration: 0.04 },
      { x:  0,  y:  0, duration: 0.04 }
    ]
  });
}

ScrollTrigger.create({
  trigger: '#name-section', start: 'top 65%', once: true,
  onEnter() {
    const letters = document.querySelectorAll('.rock-letter');
    gsap.set('#rockName', { autoAlpha: 1 });
    gsap.set(letters, { y: -window.innerHeight * 1.2, opacity: 1 });

    const tl = gsap.timeline();
    tl.to(letters, {
      y: 0, duration: 0.6, ease: 'power4.in',
      stagger: 0.022, onComplete: triggerImpact
    })
    .to('#bioTag1', { opacity: 1, y: 0, duration: 0.42, ease: 'back.out(1.7)' }, '+=0.16')
    .to('#bioTag2', { opacity: 1, y: 0, duration: 0.42, ease: 'back.out(1.7)' }, '-=0.25')
    .to('#bioTag3', { opacity: 1, y: 0, duration: 0.42, ease: 'back.out(1.7)' }, '-=0.25');
  }
});

/* ====================================================
   3. GOKU SECTION — slide in from sides
==================================================== */
ScrollTrigger.create({
  trigger: '#gokuSection', start: 'top 72%', once: true,
  onEnter() {
    gsap.to('#gokuImg',  { opacity: 1, x: 0, duration: 0.75, ease: 'power3.out' });
    gsap.to('#gokuText', { opacity: 1, x: 0, duration: 0.75, ease: 'power3.out', delay: 0.12 });
  }
});

/* ====================================================
   4. ROADMAP TIMELINE
==================================================== */
document.querySelectorAll('.timeline-item').forEach((item) => {
  ScrollTrigger.create({
    trigger: item, start: 'top 88%', once: true,
    onEnter() {
      const idx = parseInt(item.dataset.index || '0', 10);
      gsap.to(item, { opacity: 1, x: 0, duration: 0.55, delay: idx * 0.07, ease: 'power3.out' });
    }
  });
});

/* ====================================================
   5. DREAM CARDS — float up
==================================================== */
document.querySelectorAll('.dream-card').forEach((card) => {
  ScrollTrigger.create({
    trigger: card, start: 'top 90%', once: true,
    onEnter() {
      const idx = parseInt(card.dataset.index || '0', 10);
      gsap.to(card, { opacity: 1, y: 0, duration: 0.55, delay: idx * 0.09, ease: 'power3.out' });
    }
  });
});

/* ====================================================
   6. FAVORITES — pop in
==================================================== */
document.querySelectorAll('.fav-item').forEach((item) => {
  ScrollTrigger.create({
    trigger: item, start: 'top 93%', once: true,
    onEnter() {
      const idx = parseInt(item.dataset.index || '0', 10);
      gsap.to(item, { opacity: 1, scale: 1, duration: 0.4, delay: idx * 0.055, ease: 'back.out(1.6)' });
    }
  });
});

/* ====================================================
   7. SKILL CARDS — float up
==================================================== */
document.querySelectorAll('.skill-card').forEach((card) => {
  ScrollTrigger.create({
    trigger: card, start: 'top 88%', once: true,
    onEnter() {
      const idx = parseInt(card.dataset.index || '0', 10);
      gsap.to(card, { opacity: 1, y: 0, duration: 0.55, delay: idx * 0.09, ease: 'power3.out' });
    }
  });
});

/* ====================================================
   8. ABOUT — code block + animated counters
==================================================== */
ScrollTrigger.create({
  trigger: '.about-section', start: 'top 75%', once: true,
  onEnter() {
    gsap.to('.code-block', { opacity: 1, x: 0, duration: 0.75, ease: 'power3.out' });
    gsap.from('.about-para', {
      opacity: 0, y: 22, duration: 0.5, stagger: 0.13, ease: 'power2.out'
    });
    document.querySelectorAll('.stat-num').forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      gsap.fromTo(el, { innerText: 0 }, {
        innerText: target, duration: 1.5, ease: 'power2.out',
        snap: { innerText: 1 }, delay: 0.25,
        onUpdate() { el.textContent = Math.round(parseFloat(el.innerText)); }
      });
    });
  }
});

/* ====================================================
   9. CONTACT
==================================================== */
ScrollTrigger.create({
  trigger: '.contact-section', start: 'top 82%', once: true,
  onEnter() {
    gsap.from([
      '.contact-section .section-label',
      '.contact-section .section-title',
      '.contact-sub',
      '.wa-btn'
    ], { opacity: 0, y: 32, duration: 0.6, stagger: 0.09, ease: 'power3.out' });
  }
});

/* ====================================================
   10. SECTION LABELS & TITLES
==================================================== */
gsap.utils.toArray('.section-label').forEach(el => {
  ScrollTrigger.create({
    trigger: el, start: 'top 93%', once: true,
    onEnter() { gsap.from(el, { opacity: 0, x: -14, duration: 0.4, ease: 'power2.out' }); }
  });
});
gsap.utils.toArray('.section-title').forEach(el => {
  ScrollTrigger.create({
    trigger: el, start: 'top 93%', once: true,
    onEnter() { gsap.from(el, { opacity: 0, y: 22, duration: 0.55, ease: 'power3.out', delay: 0.07 }); }
  });
});

/* ====================================================
   11. CURSOR GLOW (desktop only — GPU-only via GSAP)
==================================================== */
if (window.matchMedia('(pointer: fine)').matches) {
  const g = document.createElement('div');
  Object.assign(g.style, {
    position: 'fixed', width: '350px', height: '350px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(123,47,255,0.07), transparent 70%)',
    pointerEvents: 'none', zIndex: '0',
    transform: 'translate(-50%,-50%) translate3d(0,0,0)',
    top: '0', left: '0', willChange: 'transform'
  });
  document.body.appendChild(g);
  document.addEventListener('mousemove', e => {
    gsap.to(g, {
      left: e.clientX, top: e.clientY,
      duration: 0.5, ease: 'power2.out',
      overwrite: 'auto'
    });
  }, { passive: true });
}
