// ===================================
// RESUME SECTION — resume.js
// ===================================

document.addEventListener('DOMContentLoaded', function () {

    initSkillBarAnimations();
    initTimelineAnimations();
    initCardHoverEffects();
    createFloatingParticles();
    initAvatarInteraction();
    initScrollProgress();

    // Recreate particles on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            document.querySelectorAll('.resume-particle').forEach(p => p.remove());
            createFloatingParticles();
        }, 250);
    });
});

// ===================================
// Skill Bar Animations
// ===================================
function initSkillBarAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || entry.target.classList.contains('animated')) return;

            const item        = entry.target;
            const fill        = item.querySelector('.resume-skill-fill');
            const label       = item.querySelector('.resume-skill-percent');
            const target      = parseInt(item.dataset.skill);

            item.classList.add('animated');
            setTimeout(() => { fill.style.width = target + '%'; }, 100);

            let current = 0;
            const step  = target / 60;
            const timer = setInterval(() => {
                current += step;
                if (current >= target) { label.textContent = target + '%'; clearInterval(timer); }
                else                   { label.textContent = Math.floor(current) + '%'; }
            }, 25);

            observer.unobserve(item);
        });
    }, { threshold: 0.5, rootMargin: '0px 0px -80px 0px' });

    document.querySelectorAll('.resume-skill-item').forEach(el => observer.observe(el));
}

// ===================================
// Timeline Animation on Scroll
// ===================================
function initTimelineAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.style.animationPlayState = 'running';
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.resume-timeline-item').forEach(el => observer.observe(el));
}

// ===================================
// Card Hover 3D Tilt
// ===================================
function initCardHoverEffects() {
    document.querySelectorAll('.resume-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const r  = card.getBoundingClientRect();
            const rx = (e.clientY - r.top  - r.height / 2) / 22;
            const ry = (r.width / 2 - (e.clientX - r.left)) / 22;
            card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ===================================
// Floating Particles
// ===================================
function createFloatingParticles() {
    const section = document.querySelector('.resume-section');
    if (!section) return;

    const count  = window.innerWidth < 768 ? 12 : 25;
    const colors = ['#22d3ee', '#8b5cf6', '#10b981'];

    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'resume-particle';
        const size = Math.random() * 3 + 1.5;
        Object.assign(p.style, {
            width:          size + 'px',
            height:         size + 'px',
            left:           Math.random() * 100 + '%',
            top:            Math.random() * 100 + '%',
            background:     colors[Math.floor(Math.random() * colors.length)],
            opacity:        (Math.random() * .4 + .15).toString(),
            animation:      `particleFloat ${Math.random() * 10 + 10}s ease-in-out infinite`,
            animationDelay: Math.random() * 5 + 's',
        });
        section.appendChild(p);
    }
}

// ===================================
// Avatar Click Ripple
// ===================================
function initAvatarInteraction() {
    const avatar = document.querySelector('.resume-avatar');
    if (!avatar) return;

    avatar.addEventListener('click', () => {
        const ripple = document.createElement('div');
        Object.assign(ripple.style, {
            position:     'absolute',
            width:        '100%',
            height:       '100%',
            borderRadius: '50%',
            border:       '2px solid #22d3ee',
            top:          '0',
            left:         '0',
            animation:    'rippleEffect .6s ease-out',
            pointerEvents:'none',
        });
        avatar.appendChild(ripple);
        setTimeout(() => ripple.remove(), 650);
    });
}

// ===================================
// Scroll Progress Bar
// ===================================
function initScrollProgress() {
    const section = document.querySelector('.resume-section');
    if (!section) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'resume-scroll-progress';
    const bar = document.createElement('div');
    bar.className = 'resume-scroll-progress-bar';
    wrapper.appendChild(bar);
    section.appendChild(wrapper);

    window.addEventListener('scroll', () => {
        const top    = section.getBoundingClientRect().top + window.scrollY;
        const height = section.offsetHeight;
        const winH   = window.innerHeight;

        if (window.scrollY > top && window.scrollY < top + height) {
            wrapper.classList.add('visible');
            const pct = ((window.scrollY - top) / (height - winH)) * 100;
            bar.style.width = Math.min(Math.max(pct, 0), 100) + '%';
        } else {
            wrapper.classList.remove('visible');
        }
    });
}

// ===================================
// Download Resume
// ===================================
function downloadResume() {
    const filePath = './files/Samontañez Rence P. Resume.pdf';
    const fileName = 'Samontañez Rence P. Resume.pdf';

    const link = document.createElement('a');
    link.href     = filePath;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (typeof gtag !== 'undefined') {
        gtag('event', 'download', { event_category: 'Resume', event_label: 'PDF Download' });
    }
}

// ===================================
// Print Resume
// ===================================
function printResume() {
    const filePath = './files/Samontañez Rence P. Resume.pdf';
    fetch(filePath)
        .then(r => r.blob())
        .then(blob => {
            const url = URL.createObjectURL(blob);
            const win = window.open(url, '_blank');
            if (win) win.onload = () => { win.focus(); win.print(); };
        })
        .catch(() => showNotification('Could not load PDF for printing. Make sure RESUME is in the "files" folder.', 'error'));
}

// ===================================
// Notification
// ===================================
function showNotification(message, type = 'info') {
    const icons = {
        success: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        error:   '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        info:    '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>',
    };

    const n = document.createElement('div');
    n.className = `resume-notification resume-notification-${type}`;
    n.innerHTML = `
        <div class="resume-notification-content">
            <svg class="resume-notification-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            ${icons[type] || icons.info}
            </svg>
            <span>${message}</span>
        </div>
        <button class="resume-notification-close" onclick="this.parentElement.remove()">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
        </button>`;

    document.body.appendChild(n);

    setTimeout(() => {
        n.style.animation = 'slideOutRight .4s cubic-bezier(.16,1,.3,1)';
        setTimeout(() => n.remove(), 420);
    }, 5000);
}