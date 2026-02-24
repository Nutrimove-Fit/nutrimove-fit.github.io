/* ═══════════════════════════════════════════════════
   NutriMove Fit — Ultra-Premium Interactions
   Particles, 3D tilt, parallax, magnetic btns,
   morphing glows, typing fx, stagger reveals
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ══════════════════════════════════════════════════
  //  0 · HELPER UTILITIES
  // ══════════════════════════════════════════════════
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const rand = (a, b) => Math.random() * (b - a) + a;
  const isMobile = () => window.innerWidth < 768;

  // ══════════════════════════════════════════════════
  //  1 · PARTICLE CANVAS (Hero Background)
  // ══════════════════════════════════════════════════
  const heroSection = document.querySelector('.hero');
  if (heroSection && !isMobile()) {
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-particles';
    canvas.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;opacity:.6';
    heroSection.style.position = 'relative';
    heroSection.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let W, H;
    const particles = [];
    const PARTICLE_COUNT = 80;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = rand(0, W);
        this.y = rand(0, H);
        this.r = rand(1, 3);
        this.vx = rand(-0.3, 0.3);
        this.vy = rand(-0.2, -0.8);
        this.alpha = rand(0.1, 0.5);
        this.color = ['#AEEA00', '#7C3AED', '#06B6D4', '#FF6B35'][Math.floor(rand(0, 4))];
        this.life = rand(60, 200);
        this.maxLife = this.life;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life--;
        this.alpha = (this.life / this.maxLife) * 0.5;
        if (this.life <= 0 || this.y < -10) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.alpha;
        ctx.fill();
        // Glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    // Connection lines between nearby particles
    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(174,234,0,' + (1 - dist / 120) * 0.08 + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach((p) => { p.update(); p.draw(); });
      drawLines();
      requestAnimationFrame(animateParticles);
    }
    animateParticles();
  }

  // ══════════════════════════════════════════════════
  //  2 · STAGGERED SCROLL REVEAL (enhanced)
  // ══════════════════════════════════════════════════
  const revealElements = document.querySelectorAll('.reveal');
  let revealIndex = 0;
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger siblings
          const parent = entry.target.parentElement;
          const siblings = parent ? Array.from(parent.querySelectorAll('.reveal:not(.visible)')) : [];
          const idx = siblings.indexOf(entry.target);
          const delay = Math.max(0, idx) * 100;
          setTimeout(() => {
            entry.target.classList.add('visible');
            entry.target.style.transitionDelay = '0s'; // Reset after animation
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  // ══════════════════════════════════════════════════
  //  3 · PARALLAX on Scroll
  // ══════════════════════════════════════════════════
  const parallaxEls = document.querySelectorAll('.hero__bg-glow, .hero__phone, .chefpilot::before');
  const glowEl = document.querySelector('.hero__bg-glow');
  const phoneEl = document.querySelector('.hero__phone');

  function onScroll() {
    const y = window.scrollY;
    // Header
    header.classList.toggle('scrolled', y > 60);

    // Parallax for hero glow
    if (glowEl) {
      glowEl.style.transform = `scale(${1 + y * 0.0002}) translateY(${y * 0.15}px)`;
    }
    // Phone subtle parallax
    if (phoneEl && !isMobile()) {
      phoneEl.style.transform = `translateY(${Math.sin(Date.now() / 1000) * 14 + y * -0.04}px)`;
    }
  }

  // ══════════════════════════════════════════════════
  //  4 · 3D TILT on Feature Cards
  // ══════════════════════════════════════════════════
  if (!isMobile()) {
    document.querySelectorAll('.feature-card, .price-card, .cp-feature').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const mx = e.clientX - cx;
        const my = e.clientY - cy;
        const rotX = clamp(-(my / rect.height) * 12, -12, 12);
        const rotY = clamp((mx / rect.width) * 12, -12, 12);
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        card.style.boxShadow = `${-rotY * 2}px ${rotX * 2}px 40px rgba(174,234,0,0.08), 0 12px 40px rgba(0,0,0,.3)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.boxShadow = '';
      });
    });
  }

  // ══════════════════════════════════════════════════
  //  5 · MAGNETIC BUTTONS
  // ══════════════════════════════════════════════════
  if (!isMobile()) {
    document.querySelectorAll('.btn--primary, .btn--lg').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${dx * 0.2}px, ${dy * 0.2 - 2}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  // ══════════════════════════════════════════════════
  //  6 · HEADER with scroll
  // ══════════════════════════════════════════════════
  const header = document.querySelector('.header');
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Mobile Nav Toggle ──
  const burger = document.getElementById('navToggle');
  const nav = document.getElementById('mainNav');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('open');
      const isOpen = nav.classList.contains('open');
      burger.setAttribute('aria-label', isOpen ? 'Menü schliessen' : 'Menü öffnen');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        document.body.style.overflow = '';
      })
    );
  }

  // ══════════════════════════════════════════════════
  //  7 · COUNTER ANIMATION (enhanced with easing)
  // ══════════════════════════════════════════════════
  const counterElements = document.querySelectorAll('[data-target]');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  counterElements.forEach((el) => counterObserver.observe(el));

  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = target > 1000 ? 2800 : 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Elastic ease-out
      const eased = 1 - Math.pow(2, -10 * progress) * Math.cos(progress * Math.PI * 1.3);
      const current = Math.round(eased * target);
      el.textContent = current.toLocaleString('de-CH');
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  // ══════════════════════════════════════════════════
  //  8 · TYPING EFFECT for Hero Title
  // ══════════════════════════════════════════════════
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const originalHTML = heroTitle.innerHTML;
    heroTitle.style.opacity = '0';
    const titleObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          heroTitle.style.opacity = '1';
          heroTitle.classList.add('title-animate');
          titleObserver.unobserve(heroTitle);
        }
      },
      { threshold: 0.3 }
    );
    titleObserver.observe(heroTitle);
  }

  // ══════════════════════════════════════════════════
  //  9 · WATER GLASS CLICK ANIMATION (Phone Mockup)
  // ══════════════════════════════════════════════════
  document.querySelectorAll('.water-glass').forEach((glass) => {
    glass.addEventListener('click', () => {
      glass.style.transform = 'translateY(-6px) scale(1.2)';
      glass.style.filter = 'brightness(1.5) drop-shadow(0 0 8px rgba(56,189,248,.5))';
      setTimeout(() => {
        glass.style.transform = '';
        glass.style.filter = '';
      }, 400);
    });
  });

  // ══════════════════════════════════════════════════
  //  10 · CURSOR GLOW FOLLOWER
  // ══════════════════════════════════════════════════
  if (!isMobile()) {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.cssText =
      'position:fixed;top:0;left:0;width:400px;height:400px;pointer-events:none;z-index:9999;' +
      'background:radial-gradient(circle,rgba(174,234,0,.04) 0%,rgba(124,58,237,.02) 40%,transparent 70%);' +
      'border-radius:50%;transform:translate(-50%,-50%);transition:opacity .3s;opacity:0;mix-blend-mode:screen';
    document.body.appendChild(glow);

    let glowX = 0, glowY = 0, targetX = 0, targetY = 0;
    document.addEventListener('mousemove', (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.style.opacity = '1';
    });
    document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });

    function followCursor() {
      glowX = lerp(glowX, targetX, 0.08);
      glowY = lerp(glowY, targetY, 0.08);
      glow.style.left = glowX + 'px';
      glow.style.top = glowY + 'px';
      requestAnimationFrame(followCursor);
    }
    followCursor();
  }

  // ══════════════════════════════════════════════════
  //  11 · SCROLL PROGRESS BAR
  // ══════════════════════════════════════════════════
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  progressBar.style.cssText =
    'position:fixed;top:0;left:0;height:3px;z-index:10001;' +
    'background:linear-gradient(90deg,#AEEA00,#7C3AED,#06B6D4);' +
    'transform-origin:left;transform:scaleX(0);transition:none;pointer-events:none';
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? window.scrollY / max : 0;
    progressBar.style.transform = `scaleX(${pct})`;
  }, { passive: true });

  // ══════════════════════════════════════════════════
  //  12 · PRICING TABS (enhanced with slide)
  // ══════════════════════════════════════════════════
  const pricingTabs = document.querySelectorAll('.pricing__tab');
  pricingTabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      pricingTabs.forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.pricing__panel').forEach((p) => {
        p.classList.remove('active');
        p.style.animation = '';
      });
      tab.classList.add('active');
      const panel = document.getElementById('panel-' + target);
      if (panel) {
        panel.classList.add('active');
        panel.style.animation = 'fadeSlideUp .5s ease forwards';
        panel.querySelectorAll('.reveal:not(.visible)').forEach((el) => revealObserver.observe(el));
      }
    })
  );

  // ══════════════════════════════════════════════════
  //  13 · LEGAL TABS
  // ══════════════════════════════════════════════════
  const legalTabs = document.querySelectorAll('.legal__tab');
  legalTabs.forEach((tab) =>
    tab.addEventListener('click', () => {
      const target = tab.dataset.legal;
      legalTabs.forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.legal__panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById(target);
      if (panel) {
        panel.classList.add('active');
        panel.style.animation = 'fadeSlideUp .4s ease forwards';
      }
    })
  );

  // ══════════════════════════════════════════════════
  //  14 · SMOOTH SCROLL
  // ══════════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id === '#' || id === '#top') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const offset = header.offsetHeight + 20;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    })
  );

  // ══════════════════════════════════════════════════
  //  15 · CONTACT FORM
  // ══════════════════════════════════════════════════
  const form = document.getElementById('contactForm');
  const formMsg = document.getElementById('formMsg');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements.name.value.trim();
      const email = form.elements.email.value.trim();
      if (!name || !email) {
        showFormMsg('Bitte fülle Name und E-Mail aus.', 'error');
        return;
      }
      showFormMsg('Danke, ' + name + '! Wir melden uns bald bei dir.', 'success');
      form.reset();
    });
  }
  function showFormMsg(text, type) {
    if (!formMsg) return;
    formMsg.textContent = text;
    formMsg.className = 'form-msg ' + type;
    setTimeout(() => { formMsg.textContent = ''; formMsg.className = 'form-msg'; }, 5000);
  }

  // ══════════════════════════════════════════════════
  //  16 · AUTO-ROTATE TESTIMONIALS (optional carousel)
  // ══════════════════════════════════════════════════
  const testimonials = document.querySelectorAll('.testimonial');
  if (testimonials.length > 1 && isMobile()) {
    let currentTestimonial = 0;
    testimonials.forEach((t, i) => { if (i > 0) t.style.display = 'none'; });
    setInterval(() => {
      testimonials[currentTestimonial].style.display = 'none';
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
      testimonials[currentTestimonial].style.display = '';
      testimonials[currentTestimonial].style.animation = 'fadeSlideUp .5s ease forwards';
    }, 4000);
  }

  // ══════════════════════════════════════════════════
  //  17 · FLOATING ACTION BADGES  (scroll-triggered)
  // ══════════════════════════════════════════════════
  const badgeNew = document.querySelector('.phone-activity__badge-new');
  if (badgeNew) {
    setInterval(() => {
      badgeNew.style.transform = `scale(${1 + Math.sin(Date.now() / 500) * 0.1})`;
    }, 50);
  }

  // ══════════════════════════════════════════════════
  //  18 · PHONE RING COUNTER ANIMATION
  // ══════════════════════════════════════════════════
  const ringVal = document.querySelector('.phone-ring-val');
  if (ringVal) {
    const phoneObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let count = 0;
          const target = 1847;
          const step = Math.ceil(target / 60);
          const interval = setInterval(() => {
            count = Math.min(count + step, target);
            ringVal.textContent = count.toLocaleString('de-CH');
            if (count >= target) clearInterval(interval);
          }, 25);
          phoneObserver.unobserve(ringVal);
        }
      },
      { threshold: 0.5 }
    );
    phoneObserver.observe(ringVal);
  }

  // ══════════════════════════════════════════════════
  //  19 · DYNAMIC WATER COUNTER
  // ══════════════════════════════════════════════════
  const waterVal = document.getElementById('waterVal');
  if (waterVal) {
    let waterCount = 0;
    const waterTarget = 2.13;
    const waterObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const start = performance.now();
          function animateWater(now) {
            const progress = Math.min((now - start) / 1500, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            waterVal.textContent = (eased * waterTarget).toFixed(2).replace('.', ',');
            if (progress < 1) requestAnimationFrame(animateWater);
          }
          requestAnimationFrame(animateWater);
          waterObserver.unobserve(waterVal);
        }
      },
      { threshold: 0.5 }
    );
    waterObserver.observe(waterVal);
  }

  // ══════════════════════════════════════════════════
  //  20 · HOW-STEPS CONNECTOR GLOW
  // ══════════════════════════════════════════════════
  document.querySelectorAll('.how__num').forEach((num) => {
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          num.style.animation = 'numPop .6s cubic-bezier(.34,1.56,.64,1) forwards';
          obs.unobserve(num);
        }
      },
      { threshold: 0.5 }
    );
    obs.observe(num);
  });

})();
