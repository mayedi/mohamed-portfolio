/* ============================================
   Portfolio interactivity
   - Scroll-triggered reveals
   - Nav scroll state
   - Language bar animation
   - Smooth-scroll for anchor links
   ============================================ */

(function () {
  // ---------- 1. Scroll-triggered reveal ----------
  const reveals = document.querySelectorAll('[data-reveal]');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.revealDelay || '0', 10);
          setTimeout(() => {
            entry.target.classList.add('is-revealed');
          }, delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  reveals.forEach((el) => revealObserver.observe(el));

  // ---------- 2. Hero immediate reveal ----------
  // Hero reveals should fire on load, not require scroll
  window.addEventListener('load', () => {
    document.querySelectorAll('.hero [data-reveal]').forEach((el) => {
      const delay = parseInt(el.dataset.revealDelay || '0', 10);
      setTimeout(() => el.classList.add('is-revealed'), delay);
    });
  });

  // ---------- 3. Nav scroll state ----------
  const nav = document.querySelector('.nav');
  let lastScrollY = window.scrollY;

  function onScroll() {
    const y = window.scrollY;
    if (y > 20) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
    lastScrollY = y;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- 4. Language bars animate on scroll into view ----------
  const langBars = document.querySelectorAll('.lang__bar');

  const langObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const level = bar.dataset.level || '0';
          bar.style.setProperty('--target-width', level + '%');
          // Tiny stagger based on position in DOM
          const siblings = Array.from(bar.parentElement.parentElement.children);
          const idx = siblings.indexOf(bar.parentElement);
          setTimeout(() => {
            bar.classList.add('is-animated');
          }, idx * 120);
          langObserver.unobserve(bar);
        }
      });
    },
    { threshold: 0.4 }
  );

  langBars.forEach((bar) => langObserver.observe(bar));

  // ---------- 4b. Count-up animation for stat callouts ----------
  const countEls = document.querySelectorAll('[data-count-to]');

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateCount(el) {
    const target = parseFloat(el.dataset.countTo);
    const suffix = el.dataset.suffix || '';
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = target < 5 ? (target * eased).toFixed(0) : Math.floor(target * eased);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    }

    requestAnimationFrame(tick);
  }

  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  countEls.forEach((el) => countObserver.observe(el));

  // ---------- 4c. Timeline rail progress + job markers ----------
  const timeline = document.querySelector('.timeline');
  const timelineProgress = document.querySelector('.timeline__progress');
  const jobs = document.querySelectorAll('.job');

  if (timeline && timelineProgress) {
    function updateTimelineProgress() {
      const rect = timeline.getBoundingClientRect();
      const viewH = window.innerHeight;

      // Where the viewport "reading line" sits — about 40% down from the top
      const readLine = viewH * 0.4;

      const total = rect.height;
      const fromTop = readLine - rect.top;
      const pct = Math.max(0, Math.min(100, (fromTop / total) * 100));

      timeline.style.setProperty('--progress', pct + '%');
    }

    window.addEventListener('scroll', updateTimelineProgress, { passive: true });
    window.addEventListener('resize', updateTimelineProgress);
    updateTimelineProgress();
  }

  const jobObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
        } else {
          entry.target.classList.remove('is-in-view');
        }
      });
    },
    {
      threshold: 0,
      rootMargin: '-30% 0px -30% 0px', // marker activates when job is in the middle band
    }
  );

  jobs.forEach((j) => jobObserver.observe(j));

  // ---------- 5. Subtle parallax on hero text on scroll ----------
  const heroText = document.querySelector('.hero__text');

  if (heroText) {
    window.addEventListener(
      'scroll',
      () => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          heroText.style.transform = `translateY(${y * 0.15}px)`;
          heroText.style.opacity = String(1 - (y / window.innerHeight) * 0.8);
        }
      },
      { passive: true }
    );
  }

  // ---------- 6. Project card subtle tilt on hover ----------
  const projects = document.querySelectorAll('.project');

  projects.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (y - 0.5) * 4; // max 2deg
      const tiltY = (x - 0.5) * -4;
      card.style.transform = `translateY(-6px) perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  // ---------- 7. Anchor-link smooth scroll (with nav offset) ----------
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight + 1;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();
