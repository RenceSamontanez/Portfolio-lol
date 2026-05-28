    // ======================================
// INDEX1.JS — New Portfolio Sections
// Sections: About · Skills · Services · Process · Testimonials
// ======================================

(function () {
  'use strict';

  // ── Text Justify — make all text justified in all sections ──────────────
  // Applies text-align: justify to all direct section children with textual content
  document.addEventListener('DOMContentLoaded', () => {
    // Select all relevant content blocks in sections (exclude things like nav)
    const contentSelectors = [
      '.about-content-col',
      '.about-tl-item',
      '.skills-cat',
      '.skill-pill',
      '.service-card',
      '.process-step-card',
      '.testi-card',
      '.testi-cta'
    ];
    contentSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.style.textAlign = 'justify';
      });
    });
  });

  // ── Reveal on scroll (IntersectionObserver) ──────────────────────────────
  // Adds .reveal class to key elements, then triggers .visible on entry

  const revealTargets = [
    // About
    '.about-photo-col',
    '.about-content-col',
    '.about-tl-item',
    // Skills
    '.skills-cat',
    '.skill-pill',
    // Services
    '.service-card',
    // Process
    '.process-step',
    // Testimonials
    '.testi-card',
    '.testi-cta',
  ];

  // Apply reveal class + staggered delay
  revealTargets.forEach(selector => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.classList.add('reveal');
      // Stagger siblings within same parent
      if (i > 0) el.classList.add(`reveal-delay-${Math.min(i, 5)}`);
    });
  });

  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


  // ── Skill bar animation ───────────────────────────────────────────────────
  // Triggers the CSS --w transition when the skills section enters view

  const skillsSection = document.querySelector('.skills-section');

  if (skillsSection) {
    const skillsObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          skillsObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    skillsObs.observe(skillsSection);
  }


  // ── Active nav link for new sections ─────────────────────────────────────
  // Extends the existing scroll handler in index.js with the new section IDs

  const newSectionIds = ['about', 'skills', 'services', 'process', 'testimonials'];
  const allNavLinks   = document.querySelectorAll('.nav-link, .nav-drawer-link');

  // We piggyback on the existing scroll event — just update active state
  // for the extra sections. Uses a passive listener so no conflict.
  window.addEventListener('scroll', () => {
    let current = '';
    document.querySelectorAll('section[id]').forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    allNavLinks.forEach(link => {
      const href = link.getAttribute('href')?.replace('#', '');
      link.classList.toggle('active', href === current);
    });
  }, { passive: true });


  // ── Process step: pulse the active step num on hover ─────────────────────
  document.querySelectorAll('.process-step').forEach(step => {
    const num = step.querySelector('.process-step-num');
    if (!num) return;
    step.addEventListener('mouseenter', () => {
      num.style.boxShadow = '0 0 0 8px rgba(34,211,238,.08), 0 0 20px rgba(34,211,238,.25)';
    });
    step.addEventListener('mouseleave', () => {
      num.style.boxShadow = '';
    });
  });


  // ── Service card: track mouse for spotlight glow ──────────────────────────
  document.querySelectorAll('.service-card').forEach(card => {
    const glow = card.querySelector('.service-card-glow');
    if (!glow) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      glow.style.left   = `${x - 90}px`;
      glow.style.top    = `${y - 90}px`;
      glow.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });
  });


  // ── Testimonial card: 3D tilt micro-interaction ───────────────────────────
  document.querySelectorAll('.testi-card').forEach(card => {
    const MAX_TILT = 6; // degrees

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `
        translateY(-5px)
        rotateX(${-dy * MAX_TILT}deg)
        rotateY(${dx * MAX_TILT}deg)
      `;
      card.style.transition = 'transform .08s ease';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .45s cubic-bezier(.16,1,.3,1), border-color .35s';
    });
  });


  // ── About timeline: highlight current item on scroll ─────────────────────
  const tlItems = document.querySelectorAll('.about-tl-item');
  if (tlItems.length) {
    const tlObs = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }
      });
    }, { threshold: 0.6 });

    tlItems.forEach((item, i) => {
      item.style.opacity   = '0';
      item.style.transform = 'translateX(-16px)';
      item.style.transition = `opacity .5s ${i * .12}s ease, transform .5s ${i * .12}s ease`;
      tlObs.observe(item);
    });
  }

})();
// ======================================
// PROCESS SECTION — Cinematic Glow
// Paste this at the bottom of index1.js
// (after the closing })(); of the IIFE)
// ======================================

(function processGlow() {

    const steps     = Array.from(document.querySelectorAll('.process-step'));
    const connector = document.querySelector('.process-connector');
    const streak    = document.querySelector('.process-streak');
  
    if (!steps.length || !connector || !streak) return;
  
    const NUM_STEPS = steps.length;
  
    // ── Timing (ms) — tweak these to taste ────────────────────────────────
    const PAUSE_BEFORE_START = 800;   // calm before the first pass
    const TRAVEL_PER_SEGMENT = 1400;  // time for streak to glide between numbers
    const LINGER_AT_NUM      = 550;   // how long streak sits on a number
    const NUM_GLOW_DURATION  = 850;   // how long the number ring pulse lasts
    const CARD_GLOW_DURATION = 1100;  // how long the card border glow lasts
    const PAUSE_AFTER_LAST   = 2000;  // rest at the end before looping
  
    // ── Easing ────────────────────────────────────────────────────────────
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function easeOutQuart(t) {
      return 1 - Math.pow(1 - t, 4);
    }
  
    // ── Measure where each number sits along the connector ────────────────
    function getStepPositions() {
      const connRect = connector.getBoundingClientRect();
      if (connRect.width === 0) return steps.map((_, i) => i / (NUM_STEPS - 1));
      return steps.map(step => {
        const numEl   = step.querySelector('.process-step-num');
        const numRect = numEl.getBoundingClientRect();
        const center  = numRect.left + numRect.width / 2;
        return (center - connRect.left) / connRect.width;
      });
    }
  
    // ── Move streak (0 = left edge, 1 = right edge) ───────────────────────
    // Streak is 80px wide; we center it on the fractional position
    function setStreakPos(pos) {
      pos = Math.max(0, Math.min(1, pos));
      streak.style.left = `calc(${pos * 100}% - 40px)`;
    }
  
    function setStreakOpacity(val) {
      streak.style.opacity = String(Math.max(0, Math.min(1, val)));
    }
  
    // ── Generic rAF tweener ───────────────────────────────────────────────
    // Returns a cancel function
    function tween({ from, to, duration, easing, onUpdate, onDone }) {
      const start = performance.now();
      let id;
      function tick(now) {
        const raw = Math.min((now - start) / duration, 1);
        onUpdate(from + (to - from) * easing(raw));
        if (raw < 1) { id = requestAnimationFrame(tick); }
        else         { if (onDone) onDone(); }
      }
      id = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(id);
    }
  
    // ── Promise-wrapped tween ─────────────────────────────────────────────
    function tweenP(opts) {
      return new Promise(resolve => {
        const cancel = tween({ ...opts, onDone: resolve });
        // Store cancel on opts so caller can abort
        if (opts.cancelRef) opts.cancelRef.fn = cancel;
      });
    }
  
    // ── Promise-wrapped wait ──────────────────────────────────────────────
    function waitP(ms, cancelRef) {
      return new Promise(resolve => {
        const id = setTimeout(resolve, ms);
        if (cancelRef) cancelRef.fn = () => { clearTimeout(id); resolve(); };
      });
    }
  
    // ── Light / dim helpers ───────────────────────────────────────────────
    function reflow(el) { void el.offsetWidth; }
  
    function lightNum(step) {
      const num = step.querySelector('.process-step-num');
      step.classList.remove('num-lit');
      reflow(num);
      step.classList.add('num-lit');
    }
    function dimNum(step)  { step.classList.remove('num-lit');  }
  
    function lightCard(step) {
      const card = step.querySelector('.process-step-card');
      step.classList.remove('card-lit');
      reflow(card);
      step.classList.add('card-lit');
    }
    function dimCard(step) { step.classList.remove('card-lit'); }
  
    // ── Main async cycle ──────────────────────────────────────────────────
    let running    = false;
    let cancelRef  = { fn: null };
  
    function abort() {
      running = false;
      if (cancelRef.fn) { cancelRef.fn(); cancelRef.fn = null; }
      steps.forEach(s => { s.classList.remove('num-lit', 'card-lit'); });
      setStreakOpacity(0);
    }
  
    async function runCycle() {
      if (!running) return;
  
      const pos = getStepPositions();
  
      // Position streak at step 0 while invisible
      setStreakPos(pos[0]);
      await waitP(PAUSE_BEFORE_START, cancelRef);
      if (!running) return;
  
      // Fade streak in
      await tweenP({ from: 0, to: 1, duration: 500, easing: easeOutQuart,
                     onUpdate: setStreakOpacity, cancelRef });
      if (!running) return;
  
      // Visit each step
      for (let i = 0; i < NUM_STEPS; i++) {
        if (!running) return;
  
        // Arrive — light num immediately, card 80ms later
        lightNum(steps[i]);
        const cardTimer = setTimeout(() => { if (running) lightCard(steps[i]); }, 80);
  
        // Linger on this number
        await waitP(LINGER_AT_NUM, cancelRef);
        if (!running) { clearTimeout(cardTimer); return; }
  
        // Schedule dim
        const dimNTimer  = setTimeout(() => dimNum(steps[i]),  NUM_GLOW_DURATION);
        const dimCTimer  = setTimeout(() => dimCard(steps[i]), CARD_GLOW_DURATION);
  
        // Travel to next step
        if (i < NUM_STEPS - 1) {
          await tweenP({
            from: pos[i], to: pos[i + 1],
            duration: TRAVEL_PER_SEGMENT,
            easing: easeInOutCubic,
            onUpdate: setStreakPos,
            cancelRef
          });
        }
  
        if (!running) {
          clearTimeout(dimNTimer);
          clearTimeout(dimCTimer);
          return;
        }
      }
  
      // Linger at last step, then fade out
      await waitP(PAUSE_AFTER_LAST * 0.35, cancelRef);
      if (!running) return;
  
      await tweenP({ from: 1, to: 0, duration: 700, easing: easeInOutCubic,
                     onUpdate: setStreakOpacity, cancelRef });
      if (!running) return;
  
      // Jump back (invisible) and rest
      setStreakPos(pos[0]);
      await waitP(PAUSE_AFTER_LAST * 0.65, cancelRef);
      if (!running) return;
  
      runCycle(); // loop
    }
  
    // ── Start / stop on visibility ────────────────────────────────────────
    const section = document.querySelector('.process-section');
  
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !running) {
          running = true;
          setStreakOpacity(0);
          runCycle();
        } else if (!entry.isIntersecting && running) {
          abort();
        }
      });
    }, { threshold: 0.2 });
  
    if (section) obs.observe(section);
  
  })();
