// ── Hero background video playlist ──
const videoPLaylist = [
    'videos/TL3.mp4',
  ];
  
  let currentClip = 0;
  const heroBgVideo = document.getElementById('heroBgVideo');
  
  function playNextClip() {
    currentClip = (currentClip + 1) % videoPLaylist.length;
  
    // Fade out
    heroBgVideo.style.transition = 'opacity .6s ease';
    heroBgVideo.style.opacity = '0';
  
    setTimeout(() => {
      heroBgVideo.src = videoPLaylist[currentClip];
      heroBgVideo.load();
      heroBgVideo.play().then(() => {
        // Fade back in
        heroBgVideo.style.opacity = '0.45';
      }).catch(() => {});
    }, 600); // wait for fade out to finish
  }
  
  if (heroBgVideo) {
    heroBgVideo.addEventListener('ended', playNextClip);
  }


// ======================================
// INDEX.JS — Portfolio Main Page
// ======================================

// ── Navbar: scroll state + active link + hamburger ──
const navbar      = document.getElementById('navbar');
const hamburger   = document.getElementById('navHamburger');
const drawer      = document.getElementById('navDrawer');
const navLinks    = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Scrolled state for blur/border
  navbar.classList.toggle('scrolled', window.scrollY > 20);

  // Active nav link based on scroll position
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 100) current = sec.id;
  });
  navLinks.forEach(link => {
    const href = link.getAttribute('href')?.replace('#', '');
    link.classList.toggle('active', href === current);
  });
}, { passive: true });

// Hamburger toggle
hamburger.addEventListener('click', () => {
  const isOpen = drawer.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
});

// Close drawer on drawer link click
drawer.querySelectorAll('.nav-drawer-link').forEach(link => {
  link.addEventListener('click', () => {
    drawer.classList.remove('open');
    hamburger.classList.remove('open');
  });
});

// ── Stat counters ──
function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.hero-stat-num').forEach(el => statsObserver.observe(el));

// ── AI cards: scroll-in animation ──
const aiObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger each card slightly
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, entry.target.dataset.index ? parseInt(entry.target.dataset.index) * 120 : 0);
      aiObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.ai-card[data-aos]').forEach((el, i) => {
  el.dataset.index = i;
  aiObserver.observe(el);
});

// ── Tabs ──
const tabBtns      = document.querySelectorAll('.tab-btn');
const projectCards = document.querySelectorAll('.project-card');
const indicator    = document.getElementById('tabIndicator');

function moveIndicator(btn) {
  const tabsBar  = btn.closest('.tabs-bar');
  const barRect  = tabsBar.getBoundingClientRect();
  const btnRect  = btn.getBoundingClientRect();
  indicator.style.width  = btnRect.width + 'px';
  indicator.style.transform = `translateX(${btnRect.left - barRect.left}px)`;
}

// Position indicator on load
requestAnimationFrame(() => {
  const activeBtn = document.querySelector('.tab-btn.active');
  if (activeBtn) moveIndicator(activeBtn);
});

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active state
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Move indicator
    moveIndicator(btn);

    const selected = btn.dataset.tab;

    // Filter cards
    projectCards.forEach(card => {
      const match = selected === 'all' || card.dataset.category === selected;
      if (match) {
        card.classList.remove('hidden');
        // Trigger re-paint for animation
        void card.offsetWidth;
        card.classList.add('filtering');
        card.addEventListener('animationend', () => card.classList.remove('filtering'), { once: true });
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// Recalculate indicator on resize
window.addEventListener('resize', () => {
  const activeBtn = document.querySelector('.tab-btn.active');
  if (activeBtn) moveIndicator(activeBtn);
}, { passive: true });

// ── Smooth scroll for anchor links ──
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 72; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});