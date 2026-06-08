/* ====================================================
   AHMED SAED — Portfolio Script
   Vanilla JS + GSAP 3
==================================================== */

gsap.registerPlugin(ScrollTrigger, CustomEase);

/* ====================================================
   0. LOADING SCREEN
==================================================== */
(function initLoader() {
  const loader = document.getElementById('loader');
  const lottieEl = document.getElementById('lottieLoader');
  const video = document.querySelector('.hero__video');

  /* Start Lottie animation */
  if (typeof lottie !== 'undefined' && lottieEl) {
    lottie.loadAnimation({
      container: lottieEl,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: 'loading.json'
    });
  }

  /* Hide loader function */
  function hideLoader() {
    if (!loader || loader.classList.contains('hidden')) return;
    gsap.to(loader, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.inOut',
      onComplete: () => loader.classList.add('hidden')
    });
  }

  /* Safety timeout — hide after 6s no matter what */
  const safetyTimer = setTimeout(hideLoader, 6000);

  /* Hide when video can play */
  if (video) {
    const onReady = () => {
      clearTimeout(safetyTimer);
      /* Small extra delay so first frame renders */
      setTimeout(hideLoader, 300);
    };
    if (video.readyState >= 3) {
      onReady();
    } else {
      video.addEventListener('canplaythrough', onReady, { once: true });
      video.addEventListener('canplay', onReady, { once: true });
    }
  }
})();

/* ─── Custom ease for rock drop ─── */
CustomEase.create("rockFall", "M0,0 C0.1,0 0.22,0.08 0.28,0.4 0.35,0.72 0.4,1.02 0.45,1.06 0.5,1.1 0.6,1.04 0.65,1.0 0.7,0.96 1,1 1,1");

/* ─── Helpers ─── */
function randomBetween(a, b) { return a + Math.random() * (b - a); }

/* ====================================================
   1. VIDEO AUTO-PLAY SAFETY
==================================================== */
(function ensureVideoPlay() {
  const video = document.querySelector('.hero__video');
  if (!video) return;
  video.muted = true;
  const tryPlay = () => video.play().catch(() => {});
  tryPlay();
  document.addEventListener('click', tryPlay, { once: true });
  document.addEventListener('touchstart', tryPlay, { once: true });
})();

/* ====================================================
   2. PAGE LOAD ENTRANCE
==================================================== */
window.addEventListener('load', () => {
  gsap.from('.hero__scroll-hint', {
    opacity: 0,
    y: 20,
    delay: 1.2,
    duration: 1,
    ease: 'power2.out'
  });
});

/* ====================================================
   3. ROCK-NAME DROP (ScrollTrigger)
==================================================== */
function spawnDust(containerEl, originX, originY, count) {
  const colors = ['#00c8ff', '#7b2fff', '#ffffff', '#ff2d78', '#aaaacc'];
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.classList.add('dust-particle');
    const size = randomBetween(3, 12);
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width:${size}px; height:${size}px;
      background:${color};
      left:${originX}px; top:${originY}px;
      opacity:1;
      box-shadow: 0 0 ${size*2}px ${color};
    `;
    containerEl.appendChild(p);

    gsap.to(p, {
      x: randomBetween(-220, 220),
      y: randomBetween(-120, 60),
      opacity: 0,
      scale: randomBetween(0.1, 1.5),
      duration: randomBetween(0.6, 1.4),
      ease: 'power2.out',
      onComplete: () => p.remove()
    });
  }
}

function triggerImpact() {
  const wrapper = document.getElementById('rockWrapper');
  const dust    = document.getElementById('dustContainer');
  const crack   = document.getElementById('crackLine');
  const section = document.querySelector('.name-section');
  const rect    = wrapper.getBoundingClientRect();
  const sectionRect = section.getBoundingClientRect();

  /* Spawn dust at bottom of name */
  spawnDust(
    dust,
    rect.left - sectionRect.left + rect.width / 2,
    rect.bottom - sectionRect.top,
    80
  );

  /* Crack line expansion */
  gsap.to(crack, {
    width: '90%',
    opacity: 1,
    duration: 0.35,
    ease: 'power3.out'
  });
  gsap.to(crack, {
    opacity: 0,
    delay: 1.2,
    duration: 0.6
  });

  /* Screen shake */
  section.classList.add('shake');
  setTimeout(() => section.classList.remove('shake'), 500);

  /* Camera shake via GSAP */
  gsap.to(section, {
    keyframes: [
      { x: -10, y: 5,  duration: 0.04 },
      { x: 10,  y: -5, duration: 0.04 },
      { x: -8,  y: 4,  duration: 0.04 },
      { x: 8,   y: -3, duration: 0.04 },
      { x: -4,  y: 2,  duration: 0.04 },
      { x: 4,   y: -1, duration: 0.04 },
      { x: 0,   y: 0,  duration: 0.05 }
    ]
  });
}

ScrollTrigger.create({
  trigger: '#name-section',
  start: 'top 60%',
  once: true,
  onEnter: () => {
    const letters = document.querySelectorAll('.rock-letter');
    const tl = gsap.timeline();

    /* All letters start high above viewport */
    gsap.set('#rockName', { autoAlpha: 1 });
    gsap.set(letters, { y: -window.innerHeight * 1.2, opacity: 1 });

    /* Drop each letter with slight stagger */
    tl.to(letters, {
      y: 0,
      duration: 0.7,
      ease: 'power4.in',
      stagger: 0.025,
      onComplete: triggerImpact
    })
    /* After impact — bio tags slide up */
    .to('#bioTag1', { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, '+=0.2')
    .to('#bioTag2', { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3')
    .to('#bioTag3', { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.3');
  }
});

/* ====================================================
   4. SKILL CARDS — staggered entrance
==================================================== */
gsap.utils.toArray('.skill-card').forEach((card) => {
  ScrollTrigger.create({
    trigger: card,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      const idx = parseInt(card.dataset.index || '0', 10);
      gsap.to(card, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: idx * 0.1,
        ease: 'power3.out'
      });
    }
  });
});

/* ====================================================
   5. ABOUT — code block slide in + counters
==================================================== */
ScrollTrigger.create({
  trigger: '.about-section',
  start: 'top 75%',
  once: true,
  onEnter: () => {
    /* Code block */
    gsap.to('.code-block', {
      opacity: 1,
      x: 0,
      duration: 0.9,
      ease: 'power3.out'
    });

    /* About text paragraphs */
    gsap.from('.about-para', {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out'
    });

    /* Counters */
    document.querySelectorAll('.stat-num').forEach((el) => {
      const target = parseInt(el.dataset.target, 10);
      gsap.fromTo(el,
        { innerText: 0 },
        {
          innerText: target,
          duration: 1.8,
          ease: 'power2.out',
          snap: { innerText: 1 },
          delay: 0.3,
          onUpdate() {
            el.textContent = Math.round(parseFloat(el.innerText));
          }
        }
      );
    });
  }
});

/* ====================================================
   6. CONTACT — fade up
==================================================== */
ScrollTrigger.create({
  trigger: '.contact-section',
  start: 'top 80%',
  once: true,
  onEnter: () => {
    gsap.from(['.contact-section .section-label',
               '.contact-section .section-title',
               '.contact-sub', '.wa-btn'], {
      opacity: 0,
      y: 40,
      duration: 0.7,
      stagger: 0.12,
      ease: 'power3.out'
    });
  }
});

/* ====================================================
   7. SMOOTH CURSOR GLOW (desktop only)
==================================================== */
if (window.matchMedia('(pointer: fine)').matches) {
  const glow = document.createElement('div');
  glow.style.cssText = `
    position:fixed; width:400px; height:400px; border-radius:50%;
    background:radial-gradient(circle, rgba(123,47,255,0.07) 0%, transparent 70%);
    pointer-events:none; z-index:0; transform:translate(-50%,-50%);
    transition:opacity 0.3s; top:0; left:0;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', (e) => {
    gsap.to(glow, {
      left: e.clientX,
      top: e.clientY,
      duration: 0.6,
      ease: 'power2.out'
    });
  });
}

/* ====================================================
   8. SECTION LABEL REVEAL
==================================================== */
gsap.utils.toArray('.section-label').forEach((el) => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.from(el, { opacity: 0, x: -20, duration: 0.5, ease: 'power2.out' });
    }
  });
});

gsap.utils.toArray('.section-title').forEach((el) => {
  ScrollTrigger.create({
    trigger: el,
    start: 'top 90%',
    once: true,
    onEnter: () => {
      gsap.from(el, { opacity: 0, y: 30, duration: 0.7, ease: 'power3.out', delay: 0.1 });
    }
  });
});
