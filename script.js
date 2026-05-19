/**
 * SalonFlow LP - Interactive behaviors
 */

(function () {
  'use strict';

  // ---- LINE URL (実際のURLに差し替えてください) ----
  const LINE_URL = 'https://line.me/R/ti/p/@YOUR_LINE_ID';

  // ---- DOM Elements ----
  const header = document.getElementById('header');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const stickyCta = document.getElementById('stickyCta');
  const lineCta = document.getElementById('lineCta');
  const heroSection = document.getElementById('hero');

  // ---- Header scroll effect ----
  function handleHeaderScroll() {
    if (window.scrollY > 50) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  }

  // ---- Sticky CTA visibility ----
  function handleStickyCta() {
    if (!stickyCta || !heroSection) return;
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    if (window.scrollY > heroBottom - 200) {
      stickyCta.classList.add('is-visible');
    } else {
      stickyCta.classList.remove('is-visible');
    }
  }

  // ---- Mobile menu ----
  function toggleMenu() {
    const isOpen = menuBtn.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMenu() {
    menuBtn.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', toggleMenu);
  }

  mobileMenu?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // ---- Scroll reveal ----
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // Hero content visible immediately
  document.querySelectorAll('.hero .reveal').forEach((el) => {
    setTimeout(() => el.classList.add('is-visible'), 100);
  });

  // ---- Counter animation ----
  function animateCounter(el, target, duration = 1500) {
    const start = performance.now();
    const startVal = 0;

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * eased);
      el.textContent = current;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        if (!isNaN(target)) animateCounter(el, target);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach((el) => {
    counterObserver.observe(el);
  });

  // ---- Result bar animation ----
  const barObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelectorAll('.result-card__bar').forEach((bar) => {
          bar.style.height = bar.style.getPropertyValue('--h');
        });
        barObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll('.result-card__chart').forEach((chart) => {
    chart.querySelectorAll('.result-card__bar').forEach((bar) => {
      bar.style.height = '0';
    });
    barObserver.observe(chart.closest('.result-card'));
  });

  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  // ---- LINE CTA link ----
  if (lineCta) {
    lineCta.href = LINE_URL;
    lineCta.setAttribute('target', '_blank');
    lineCta.setAttribute('rel', 'noopener noreferrer');
  }

  // ---- FAQ: close others when one opens (optional UX) ----
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item && other.open) other.open = false;
      });
    });
  });

  // ---- Scroll handlers (throttled) ----
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        handleHeaderScroll();
        handleStickyCta();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  handleHeaderScroll();
  handleStickyCta();

  // ---- Ecosystem node pulse on hover (desktop) ----
  const ecosystemNodes = document.querySelectorAll('.ecosystem__node');
  ecosystemNodes.forEach((node) => {
    node.addEventListener('mouseenter', () => {
      document.querySelector('.ecosystem__center')?.classList.add('is-pulse');
    });
    node.addEventListener('mouseleave', () => {
      document.querySelector('.ecosystem__center')?.classList.remove('is-pulse');
    });
  });

})();
