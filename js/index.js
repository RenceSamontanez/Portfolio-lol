// ======================================
// INDEX.JS — Portfolio Main Page
// ======================================

// ── Hero background video playlist ──
const videoPlaylist = [
  'videos/TL3.mp4',
  // add more: 'videos/clip2.mp4',
];

let currentClip = 0;
const heroBgVideo = document.getElementById('heroBgVideo');

function playNextClip() {
  currentClip = (currentClip + 1) % videoPlaylist.length;
  heroBgVideo.style.transition = 'opacity .6s ease';
  heroBgVideo.style.opacity = '0';
  setTimeout(() => {
    heroBgVideo.src = videoPlaylist[currentClip];
    heroBgVideo.load();
    heroBgVideo.play().then(() => {
      heroBgVideo.style.opacity = '0.45';
    }).catch(() => {});
  }, 600);
}

if (heroBgVideo) {
  heroBgVideo.addEventListener('ended', playNextClip);
}

// ── DOM refs ──
const navbar     = document.getElementById('navbar');
const navLinks   = document.querySelectorAll('.nav-link');
const sections   = document.querySelectorAll('section[id]');
const scrollHint = document.querySelector('.hero-scroll-hint');

// ── Hamburger + Drawer ──
const navHamburger       = document.getElementById('navHamburger');
const navDrawer          = document.getElementById('navDrawer');
const navDrawerBackdrop  = document.getElementById('navDrawerBackdrop');
const navDrawerLinks     = navDrawer.querySelectorAll('.nav-drawer-link');

function openDrawer() {
  navHamburger.classList.add('open');
  navDrawer.classList.add('open');
  navDrawerBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  navHamburger.classList.remove('open');
  navDrawer.classList.remove('open');
  navDrawerBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

navHamburger.addEventListener('click', function(e) {
  e.stopPropagation();
  navDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
});

navDrawerBackdrop.addEventListener('click', closeDrawer);

navDrawerLinks.forEach(link => {
  link.addEventListener('click', function() {
    closeDrawer();
    // Smooth scroll for hash links
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        setTimeout(() => {
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
        }, 50);
      }
    }
  });
});

// Close drawer on Escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && navDrawer.classList.contains('open')) closeDrawer();
});

// ── Scroll hint ──
if (scrollHint) {
  scrollHint.addEventListener('click', () => {
    const target = document.getElementById('projects');
    if (target) {
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    }
  });
}

// ── Scroll handler: navbar state + active link + hide scroll hint ──
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  if (scrollHint) {
    scrollHint.style.opacity       = window.scrollY > 80 ? '0' : '1';
    scrollHint.style.pointerEvents = window.scrollY > 80 ? 'none' : 'auto';
  }

  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href')?.replace('#', '') === current);
  });
}, { passive: true });

// ── Stat counters ──
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const start  = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / 1200, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick);
  })(start);
}

const statsObs = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { animateCounter(entry.target); obs.unobserve(entry.target); }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.hero-stat-num').forEach(el => statsObs.observe(el));

// ── Tabs ──
(function() {
  const tabsBar  = document.getElementById('projectsTabsBar');
  const tabs     = Array.from(tabsBar.querySelectorAll('.tab-btn'));
  const indicator = document.getElementById('tabIndicator');
  const cards    = Array.from(document.querySelectorAll('.project-card'));
  let currentTab = 'all';

  function setIndicator(btn) {
    if (!btn || !indicator) return;
    const barRect = tabsBar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    indicator.style.width = btnRect.width + 'px';
    indicator.style.left  = (btnRect.left - barRect.left) + 'px';
  }

  function activateTab(tabName) {
    currentTab = tabName;
    tabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabName));
    cards.forEach(card => {
      card.style.display = (tabName === 'all' || card.dataset.category === tabName) ? '' : 'none';
    });
    setIndicator(tabs.find(b => b.dataset.tab === tabName));
  }

  // Click on tabs bar (event delegation — catches any tab btn)
  tabsBar.addEventListener('click', function(e) {
    const btn = e.target.closest('.tab-btn');
    if (btn) activateTab(btn.dataset.tab);
  });

  // Init on load
  window.addEventListener('load', function() { activateTab('all'); });
  requestAnimationFrame(() => requestAnimationFrame(() => activateTab('all')));

  // Recalculate on resize
  window.addEventListener('resize', function() {
    setIndicator(tabs.find(b => b.dataset.tab === currentTab) || tabs[0]);
  }, { passive: true });
})();

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    }
  });
});
