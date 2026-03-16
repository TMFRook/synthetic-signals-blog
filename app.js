(() => {
  'use strict';

  // --- Theme toggle with localStorage ---
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = themeToggle?.querySelector('.theme-icon');
  const savedTheme = localStorage.getItem('ss-theme') || 'dark';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) themeIcon.textContent = theme === 'dark' ? '\u2600\uFE0F' : '\uD83C\uDF19';
    localStorage.setItem('ss-theme', theme);
  }
  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  // --- Mobile menu ---
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const navMenu = document.getElementById('navMenu');
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const spans = mobileToggle.querySelectorAll('span');
      spans.forEach(s => s.classList.toggle('open'));
    });
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => navMenu.classList.remove('active'));
    });
  }

  // --- Back to top ---
  const backBtn = document.getElementById('backToTop');
  window.addEventListener('scroll', () => {
    if (backBtn) backBtn.classList.toggle('show', window.scrollY > 500);
  }, { passive: true });
  if (backBtn) {
    backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // --- Animated stat counters ---
  function animateCounter(el, target) {
    const duration = 1800;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(tick);
  }

  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.stat-number').forEach(el => {
          const target = parseInt(el.dataset.target, 10);
          if (target) animateCounter(el, target);
        });
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.4 });
  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  // --- Article search/filter ---
  const searchInput = document.getElementById('articleSearch');
  const filterTags = document.querySelectorAll('.filter-tag');
  const articlesGrid = document.getElementById('articlesGrid');
  const cards = articlesGrid ? Array.from(articlesGrid.querySelectorAll('.article-card')) : [];

  function filterCards(query, category) {
    const q = query.toLowerCase().trim();
    cards.forEach(card => {
      const title = (card.querySelector('.card-title')?.textContent || '').toLowerCase();
      const excerpt = (card.querySelector('.card-excerpt')?.textContent || '').toLowerCase();
      const cats = (card.dataset.categories || '').split(' ');
      const matchesText = !q || title.includes(q) || excerpt.includes(q);
      const matchesCat = category === 'all' || cats.includes(category);
      card.style.display = matchesText && matchesCat ? '' : 'none';
    });
  }

  let activeFilter = 'all';
  if (searchInput) {
    searchInput.addEventListener('input', () => filterCards(searchInput.value, activeFilter));
  }
  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      filterTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      activeFilter = tag.dataset.filter;
      filterCards(searchInput?.value || '', activeFilter);
    });
  });

  // --- Newsletter form ---
  const form = document.getElementById('newsletterForm');
  const feedback = document.getElementById('formFeedback');
  if (form && feedback) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('newsletterEmail');
      if (!email || !email.value) return;

      const btn = form.querySelector('.btn-primary');
      if (btn) btn.classList.add('loading');

      setTimeout(() => {
        if (btn) btn.classList.remove('loading');
        feedback.textContent = 'Thanks for subscribing! Check your inbox.';
        feedback.className = 'form-feedback show success';
        email.value = '';
        setTimeout(() => { feedback.className = 'form-feedback'; }, 4000);
      }, 1200);
    });
  }

  // --- Fade-in on scroll for cards ---
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        cardObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
    cardObserver.observe(card);
  });

  // --- Subtle card tilt on hover ---
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 5;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -5;
      card.style.transform = `translateY(-8px) perspective(800px) rotateX(${y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // --- Reading progress bar (for article pages) ---
  const progressBar = document.querySelector('.reading-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = docHeight > 0 ? (scrollTop / docHeight) * 100 + '%' : '0%';
    }, { passive: true });
  }

  // --- Lazy image loading fallback ---
  if (!('loading' in HTMLImageElement.prototype)) {
    const lazyImgs = document.querySelectorAll('img[loading="lazy"]');
    const imgObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) img.src = img.dataset.src;
          imgObserver.unobserve(img);
        }
      });
    });
    lazyImgs.forEach(img => imgObserver.observe(img));
  }

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
})();
