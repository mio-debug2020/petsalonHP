/**
 * SalonFlow LP - Interactive behaviors
 */

(function () {
  'use strict';

  // ---- LINE URL (実際のURLに差し替えてください) ----
  const LINE_URL = 'https://line.me/R/ti/p/@YOUR_LINE_ID';

  // ---- GAS Webアプリ URL（デプロイ後のURLに差し替え） ----
  const GAS_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxeZ7_PRaqG0MXZ_arJxDjmf2oXV0Yzhabnzjg-p1NGsWnjSl4vj2N-D-wsAsMNeU-A/exec';

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


  // ---- お問い合わせフォーム → GAS ----
  const contactForm = document.getElementById('contactForm');
  const formMessage = document.getElementById('formMessage');
  const submitBtn = document.getElementById('submitBtn');

  function showFormMessage(text, type) {
    if (!formMessage) return;
    formMessage.textContent = text;
    formMessage.className = 'form-message is-visible form-message--' + type;
  }

  function clearFormErrors() {
    contactForm?.querySelectorAll('.is-error').forEach((el) => {
      el.classList.remove('is-error');
    });
  }

  function setFieldError(field) {
    field?.classList.add('is-error');
  }

  function validateForm(form) {
    clearFormErrors();
    let valid = true;

    const required = [
      { id: 'salonName', label: 'サロン名' },
      { id: 'name', label: 'お名前' },
      { id: 'email', label: 'メールアドレス' },
      { id: 'message', label: 'ご相談内容' },
    ];

    required.forEach(({ id }) => {
      const field = form.querySelector('#' + id);
      if (!field?.value.trim()) {
        setFieldError(field);
        valid = false;
      }
    });

    const email = form.querySelector('#email');
    if (email?.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setFieldError(email);
      valid = false;
    }

    const privacy = form.querySelector('#privacy');
    if (!privacy?.checked) {
      valid = false;
    }

    if (!valid) {
      showFormMessage('未入力または形式が正しくない項目があります。', 'error');
    }

    return valid;
  }

  async function submitToGas(form) {
    const body = new URLSearchParams({
      salonName: form.salonName.value.trim(),
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim(),
      sourceUrl: window.location.href,
    });

    const response = await fetch(GAS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || '送信に失敗しました');
    }
    return data;
  }

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (GAS_ENDPOINT === 'YOUR_GAS_WEB_APP_URL_HERE') {
        showFormMessage(
          'GASのURLが未設定です。script.js の GAS_ENDPOINT を設定してください。',
          'error'
        );
        return;
      }

      if (!validateForm(contactForm)) return;

      submitBtn?.classList.add('is-loading');
      submitBtn.disabled = true;
      formMessage?.classList.remove('is-visible');

      try {
        await submitToGas(contactForm);
        showFormMessage(
          'お問い合わせを受け付けました。ご連絡ありがとうございます！',
          'success'
        );
        contactForm.reset();
      } catch (err) {
        console.error(err);
        showFormMessage(
          err.message || '送信に失敗しました。時間をおいて再度お試しください。',
          'error'
        );
      } finally {
        submitBtn?.classList.remove('is-loading');
        submitBtn.disabled = false;
      }
    });

    contactForm.querySelectorAll('input, textarea').forEach((field) => {
      field.addEventListener('input', () => field.classList.remove('is-error'));
    });
  }


})();
