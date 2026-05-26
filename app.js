const portfolioProjects = {
  error: {
    terminalTitle: 'error-ux-kit',
    title: 'Error UX Kit',
    type: 'TypeScript · npm · CLI tooling',
    description: 'Maps backend/API error codes into consistent, user-friendly frontend messages and actions — with catalogues, validation rules, coverage reports, and CLI checks for missing ownership.',
    link: 'https://www.npmjs.com/package/error-ux-kit',
    install: 'npm i error-ux-kit',
    snippet: 'npm i error-ux-kit\n\nnormalizeApiError(response)\n  .toUserMessage()\n  .withAction("Try again")\n  .ownedBy("checkout")'
  },
  observer: {
    terminalTitle: 'frontend-observer',
    title: 'Frontend Observer',
    type: 'TypeScript · npm · observability SDK',
    description: 'Lightweight SDK for frontend errors, API request timings, and async measurements. Built for teams that need visibility before committing to a full observability platform.',
    link: 'https://www.npmjs.com/package/frontend-observer',
    install: 'npm i frontend-observer',
    snippet: 'npm i frontend-observer\n\nobserver.trackApi("/checkout", duration)\nobserver.captureError(error)\nobserver.exportTo(httpExporter)'
  },
  perf: {
    terminalTitle: 'perf-reviewer',
    title: 'Perf Reviewer',
    type: 'TypeScript · npm · Web Vitals',
    description: 'Generates readable performance reports from runtime signals — page speed, API speed, slow resources, long tasks, manual measurements, scores, bottlenecks, and recommendations.',
    link: 'https://www.npmjs.com/package/perf-reviewer',
    install: 'npm i perf-reviewer',
    snippet: 'npm i perf-reviewer\n\nconst report = reviewPerformance(signals)\nreport.score()\nreport.recommendations()'
  }
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

// Background particle network
const canvas = $('#spaceCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
const mouse = { x: 0, y: 0 };

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(110, Math.floor(window.innerWidth / 13));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.34,
    vy: (Math.random() - 0.5) * 0.34,
    r: Math.random() * 1.7 + 0.4
  }));
}

function drawBackground() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < -20) p.x = window.innerWidth + 20;
    if (p.x > window.innerWidth + 20) p.x = -20;
    if (p.y < -20) p.y = window.innerHeight + 20;
    if (p.y > window.innerHeight + 20) p.y = -20;

    const dxMouse = p.x - mouse.x;
    const dyMouse = p.y - mouse.y;
    const md = Math.hypot(dxMouse, dyMouse);
    if (md < 130) {
      p.x += dxMouse / 900;
      p.y += dyMouse / 900;
    }

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(210, 228, 255, 0.55)';
    ctx.fill();
  });

  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i];
      const b = particles[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 118) {
        ctx.strokeStyle = `rgba(111, 143, 255, ${0.12 * (1 - d / 118)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawBackground);
}

resizeCanvas();
drawBackground();
window.addEventListener('resize', resizeCanvas);
window.addEventListener('pointermove', (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
  const glow = $('.cursor-glow');
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

// Scroll reveals
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('revealed');
  });
}, { threshold: 0.14 });
$$('[data-reveal]').forEach((el) => revealObserver.observe(el));

// 3D hero tilt
const stage = $('#stage3d');
if (stage) {
  stage.addEventListener('pointermove', (event) => {
    const rect = stage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    stage.style.transform = `rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 13).toFixed(2)}deg)`;
  });
  stage.addEventListener('pointerleave', () => {
    stage.style.transform = 'rotateX(0deg) rotateY(0deg)';
  });
}

// Card tilt
$$('.tilt-card').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-2px)`;
  });
  card.addEventListener('pointerleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  });
});

// Project console
function setActiveProject(key) {
  const project = portfolioProjects[key];
  if (!project) return;
  $$('.project-tab').forEach((tab) => tab.classList.toggle('active', tab.dataset.project === key));
  $('#terminalTitle').textContent = project.terminalTitle;
  $('#projectTitle').textContent = project.title;
  $('#projectType').textContent = project.type;
  $('#projectDescription').textContent = project.description;
  $('#projectLink').href = project.link;
  $('#projectSnippet').textContent = project.snippet;
  $('.copy-install').dataset.install = project.install;
}

$$('.project-tab').forEach((tab) => {
  tab.addEventListener('click', () => setActiveProject(tab.dataset.project));
});
$$('[data-project-card]').forEach((card) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    setActiveProject(card.dataset.projectCard);
    $('#open-source').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Skill filters
$$('.skill-filter').forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    $$('.skill-filter').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    $$('.skill-cluster').forEach((cluster) => {
      const isVisible = filter === 'all' || cluster.dataset.category === filter;
      cluster.classList.toggle('is-hidden', !isVisible);
    });
  });
});

// Copy install commands
const toast = $('#toast');
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
}
$$('.copy-install').forEach((button) => {
  button.addEventListener('click', async () => {
    const text = button.dataset.install;
    try {
      await navigator.clipboard.writeText(text);
      showToast(`Copied: ${text}`);
    } catch {
      showToast(text);
    }
  });
});

// Planet shortcuts
$$('.planet').forEach((planet) => {
  planet.addEventListener('click', () => {
    const target = document.getElementById(planet.dataset.target);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

$('#backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
