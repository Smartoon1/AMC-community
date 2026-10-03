/* ============================================================
   AMC — African Mobilator Community
   Interactive layer: nav, typing, reveal, counters, filters,
   lightbox, video modal, join modal, forms, back-to-top
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ---------- Preloader ---------- */
  const preloader = document.getElementById('preloader');
  const hidePreloader = () => preloader && preloader.classList.add('hide');
  window.addEventListener('load', hidePreloader);
  setTimeout(hidePreloader, 2800); // fallback

  /* ---------- Header state + back-to-top ---------- */
  const header = document.getElementById('header');
  const toTop = document.getElementById('toTop');
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
    toTop.classList.toggle('show', window.scrollY > 500);
    parallaxHero();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- Hero parallax ---------- */
  const heroBg = document.getElementById('heroBg');
  let ticking = false;
  function parallaxHero() {
    if (ticking || !heroBg) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < window.innerHeight) heroBg.style.transform = `translateY(${y * 0.28}px)`;
      ticking = false;
    });
  }

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
    document.body.style.overflow = navMenu.classList.contains('open') ? 'hidden' : '';
  });
  navMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navMenu.classList.remove('open');
    document.body.style.overflow = '';
  }));

  /* ---------- Scrollspy ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Hero typing effect ---------- */
  const typedEl = document.getElementById('typed');
  const words = ['UNITE.', 'PLAY.', 'GROW.'];
  let wIdx = 0, cIdx = 0, deleting = false;
  (function type() {
    const word = words[wIdx];
    cIdx += deleting ? -1 : 1;
    typedEl.textContent = word.slice(0, cIdx);
    let delay = deleting ? 55 : 110;
    if (!deleting && cIdx === word.length) { delay = 1700; deleting = true; }
    else if (deleting && cIdx === 0) { deleting = false; wIdx = (wIdx + 1) % words.length; delay = 350; }
    setTimeout(type, delay);
  })();

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  revealEls.forEach(el => {
    const d = el.dataset.delay;
    if (d) el.style.transitionDelay = `${d}ms`;
  });
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      counterObserver.unobserve(el);
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const duration = 1700;
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Player filtering ---------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const playerCards = document.querySelectorAll('.player-card');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    playerCards.forEach(card => {
      const match = filter === 'all' || card.dataset.role === filter;
      card.classList.remove('pop');
      if (match) {
        card.style.display = '';
        void card.offsetWidth; // reflow to restart animation
        card.classList.add('pop');
      } else {
        card.style.display = 'none';
      }
    });
  }));

  /* ---------- Gallery lightbox ---------- */
  const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbCaption = document.getElementById('lightboxCaption');
  let lbIndex = 0;

  function openLightbox(i) {
    lbIndex = (i + galleryItems.length) % galleryItems.length;
    const item = galleryItems[lbIndex];
    const img = item.querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = item.dataset.caption || img.alt;
    openModal(lightbox);
  }
  galleryItems.forEach((item, i) => item.addEventListener('click', () => openLightbox(i)));
  document.getElementById('lbClose').addEventListener('click', () => closeModal(lightbox));
  document.getElementById('lbPrev').addEventListener('click', e => { e.stopPropagation(); openLightbox(lbIndex - 1); });
  document.getElementById('lbNext').addEventListener('click', e => { e.stopPropagation(); openLightbox(lbIndex + 1); });
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeModal(lightbox); });

  /* ---------- Video modal ----------
     Paste a YouTube video ID into data-yt on each .video-card
     and it will embed & autoplay automatically. */
  const videoModal = document.getElementById('videoModal');
  const videoFrame = document.getElementById('videoFrame');
  const videoPlaceholder = document.getElementById('videoPlaceholder');
  const videoPlaceholderImg = document.getElementById('videoPlaceholderImg');
  const videoModalTitle = document.getElementById('videoModalTitle');

  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => {
      const ytId = card.dataset.yt.trim();
      videoModalTitle.textContent = card.dataset.title;
      if (ytId) {
        videoFrame.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
        videoFrame.hidden = false;
        videoPlaceholder.style.display = 'none';
      } else {
        videoFrame.src = '';
        videoFrame.hidden = true;
        videoPlaceholder.style.display = '';
        videoPlaceholderImg.src = card.querySelector('img').src;
      }
      openModal(videoModal);
    });
  });

  /* ---------- Modal helpers ---------- */
  function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (modal === videoModal) { videoFrame.src = ''; }
  }
  document.querySelectorAll('[data-close]').forEach(btn =>
    btn.addEventListener('click', () => closeModal(btn.closest('.modal')))
  );
  document.querySelectorAll('.modal').forEach(modal =>
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(modal); })
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.modal.open').forEach(closeModal);
    if (lightbox.classList.contains('open')) {
      if (e.key === 'ArrowLeft') openLightbox(lbIndex - 1);
      if (e.key === 'ArrowRight') openLightbox(lbIndex + 1);
    }
  });

  /* ---------- Join modal ---------- */
  const joinModal = document.getElementById('joinModal');
  document.querySelectorAll('.join-trigger').forEach(btn =>
    btn.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
      }
      openModal(joinModal);
    })
  );

  /* ---------- Form validation helpers ---------- */
  function setError(input, message) {
    const group = input.closest('.form-group');
    group.classList.add('invalid');
    const msg = group.querySelector('.error-msg');
    if (msg) msg.textContent = message;
  }
  function clearErrors(form) {
    form.querySelectorAll('.form-group').forEach(g => g.classList.remove('invalid'));
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---------- Join form ---------- */
  const joinForm = document.getElementById('joinForm');
  joinForm.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors(joinForm);
    const tag = document.getElementById('jTag');
    const email = document.getElementById('jEmail');
    const country = document.getElementById('jCountry');
    const game = document.getElementById('jGame');
    let ok = true;
    if (tag.value.trim().length < 3) { setError(tag, 'Enter your gamertag (min. 3 characters).'); ok = false; }
    if (!emailRe.test(email.value.trim())) { setError(email, 'Enter a valid email address.'); ok = false; }
    if (!country.value) { setError(country, 'Select your country.'); ok = false; }
    if (!game.value) { setError(game, 'Select your main game.'); ok = false; }
    if (!ok) return;
    joinForm.hidden = true;
    document.getElementById('joinSuccess').hidden = false;
  });

  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors(contactForm);
    const name = document.getElementById('cName');
    const email = document.getElementById('cEmail');
    const message = document.getElementById('cMessage');
    let ok = true;
    if (name.value.trim().length < 2) { setError(name, 'Please enter your name.'); ok = false; }
    if (!emailRe.test(email.value.trim())) { setError(email, 'Please enter a valid email.'); ok = false; }
    if (message.value.trim().length < 10) { setError(message, 'Message should be at least 10 characters.'); ok = false; }
    if (!ok) return;
    contactForm.reset();
    const success = document.getElementById('formSuccess');
    success.hidden = false;
    setTimeout(() => { success.hidden = true; }, 6000);
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Initial states ---------- */
  onScroll();
});
