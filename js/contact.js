// ===================================
// CONTACT FORM — contact.js
// ===================================

const EMAILJS_PUBLIC_KEY  = 'i7MifOA3_CLCGir9U';
const EMAILJS_SERVICE_ID  = 'service_asoc8pp';
const EMAILJS_TEMPLATE_ID = 'template_4shn2lr';

emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ── DOM refs ──
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('contact-submit');
const labelEl   = submitBtn.querySelector('.contact-submit-label');
const loadingEl = submitBtn.querySelector('.contact-submit-loading');
const statusEl  = document.getElementById('contact-status');
const toastContainer = document.getElementById('toast-container');

// ===================================
// TOAST NOTIFICATION SYSTEM
// ===================================
const TOAST_ICONS = {
  success: `<svg class="toast-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  error:   `<svg class="toast-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
  warning: `<svg class="toast-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
  info:    `<svg class="toast-icon" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
};

const TOAST_TITLES = {
  success: 'Message Sent!',
  error:   'Something Went Wrong',
  warning: 'Hold On',
  info:    'Heads Up',
};

function showToast(type, message, duration = 5000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.style.setProperty('--toast-duration', `${duration}ms`);

  toast.innerHTML = `
    ${TOAST_ICONS[type]}
    <div class="toast-body">
      <p class="toast-title">${TOAST_TITLES[type]}</p>
      <p class="toast-msg">${message}</p>
    </div>
    <button class="toast-close" aria-label="Dismiss">
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  `;

  toastContainer.appendChild(toast);

  // Trigger slide-in
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add('show'));
  });

  // Close button
  toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));

  // Auto dismiss
  const timer = setTimeout(() => dismissToast(toast), duration);

  // Pause drain on hover
  toast.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    toast.style.animationPlayState = 'paused';
    toast.querySelector('::after');
    // Pause the ::after pseudo animation via class
    toast.classList.add('paused');
  });
  toast.addEventListener('mouseleave', () => {
    toast.classList.remove('paused');
    setTimeout(() => dismissToast(toast), 1500);
  });
}

function dismissToast(toast) {
  toast.classList.remove('show');
  toast.classList.add('hide');
  toast.addEventListener('transitionend', () => toast.remove(), { once: true });
}

// ===================================
// INLINE STATUS BANNER (below form)
// ===================================
function showStatus(type, message) {
  const icons = {
    success: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    error:   `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    warning: `<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>`,
  };
  statusEl.className = `contact-status show ${type}`;
  statusEl.innerHTML = `${icons[type]} <span>${message}</span>`;
  statusEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  if (type === 'success') setTimeout(() => statusEl.classList.remove('show'), 8000);
}

// ===================================
// BANNED WORDS — English + Filipino
// ===================================
const BANNED_WORDS = [
  'fuck','shit','bitch','asshole','bastard','damn','crap','dick','cock',
  'pussy','cunt','faggot','nigger','nigga','whore','slut','retard',
  'dumbass','motherfucker','jackass','bullshit','prick','twat','wanker',
  'douchebag','son of a bitch',
  'putang ina','putangina','putanginamo','puta','gago','gaga','bobo','tanga',
  'ulol','tarantado','pakyu','kupal','leche','letse','hindot','hayop ka',
  'punyeta','bwisit','inutil','engot','mangmang','loko','loka','ungas',
  'peste','lintik','putragis','punyemas','kingina','anak ng puta',
  'anak ng teteng','buang','yawa','bogo','walang kwenta','walang hiya',
  'bastos','salbahe','mamatay ka','gago ka','bobo ka','tanga ka',
  'pakyu ka','hinayupak','siraulo','gunggong','hudas','putcha','putcha mo',
];

// ===================================
// DISPOSABLE / TROLL EMAIL DOMAINS
// ===================================
const BLOCKED_DOMAINS = [
  'mailinator.com','guerrillamail.com','trashmail.com','tempmail.com',
  'yopmail.com','maildrop.cc','sharklasers.com','spam4.me','trashmail.io',
  'dispostable.com','filzmail.com','mailnull.com','spamgourmet.com',
  'discard.email','fakeinbox.com','tempr.email','temp-mail.org','temp-mail.io',
  'getairmail.com','mailnesia.com','mohmal.com','spamfree24.org',
  'spambox.us','getnada.com','emailondeck.com','10minutemail.com',
  '10minutemail.net','20minutemail.com','5minutemail.com','minutemail.com',
  'tempail.com','burnermail.io','inboxkitten.com','moakt.com',
  'mailtemp.info','noclickemail.com','throwam.com','mytemp.email',
  'tempinbox.com','spamwc.com','crazymailing.com',
];

const FAKE_NAME_PATTERNS = [
  /^(.)\1{2,}$/i,
  /^(test|tester|testing|asdf|qwerty|zxcvbn|lorem|ipsum|admin|user|guest|anon|anonymous|nobody|noone|haha|hehe|lol|wtf|fake|troll|bot|robot|null|undefined|xyz|abc|zzz|aaa|bbb)$/i,
  /^[^a-zA-Z\u00C0-\u024F]+$/,
];

const TROLL_EMAIL_PATTERNS = [
  /^(test|tester|asdf|qwerty|zxcvbn|fake|troll|nobody|noreply|noemail|donotreply|null|undefined|example|lorem|ipsum|admin123|user123)(\d*)$/i,
  /^(.)\1{4,}/i,
  /^\d+$/,
  /^[^a-zA-Z0-9]/,
];

// ===================================
// FLOOD PROTECTION — max 3 per 10 min
// ===================================
const FLOOD_LIMIT  = 3;
const FLOOD_WINDOW = 10 * 60 * 1000;
const FLOOD_KEY    = 'cf_submit_log';

function getSubmitLog() {
  try { return JSON.parse(sessionStorage.getItem(FLOOD_KEY) || '[]'); }
  catch { return []; }
}
function recordSubmit() {
  const log = getSubmitLog();
  log.push(Date.now());
  sessionStorage.setItem(FLOOD_KEY, JSON.stringify(log));
}
function isFlooding() {
  const now = Date.now();
  const log = getSubmitLog().filter(t => now - t < FLOOD_WINDOW);
  sessionStorage.setItem(FLOOD_KEY, JSON.stringify(log));
  return log.length >= FLOOD_LIMIT;
}
function floodCooldownMsg() {
  const log    = getSubmitLog();
  const oldest = Math.min(...log);
  const mins   = Math.ceil((FLOOD_WINDOW - (Date.now() - oldest)) / 60000);
  return `Too many messages sent. Please wait ${mins} minute${mins !== 1 ? 's' : ''} before trying again.`;
}

// ===================================
// INPUT DETECTION HELPERS
// ===================================
function containsBannedWord(text) {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ');
  return BANNED_WORDS.some(word => {
    const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${esc}(\\s|$)`, 'i').test(clean);
  });
}
function isBlockedDomain(email) {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  return BLOCKED_DOMAINS.includes(domain);
}
function isTrollEmail(email) {
  const local = email.split('@')[0] || '';
  return TROLL_EMAIL_PATTERNS.some(p => p.test(local));
}
function isFakeName(name) {
  return FAKE_NAME_PATTERNS.some(p => p.test(name.trim()));
}
function hasNumbersInName(name) {
  return /\d/.test(name);
}
function isAllCaps(text) {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 3) return false;
  return (text.match(/[A-Z]/g) || []).length / letters.length >= 0.8;
}
function isRepeatedSpam(text) {
  const words = text.trim().toLowerCase().split(/\s+/);
  if (words.length < 4) return false;
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  return Math.max(...Object.values(freq)) / words.length > 0.5;
}
function isCopyPasteGarbage(text) {
  return /(.)\1{9,}/.test(text);
}

// ===================================
// SHAKE ANIMATION
// ===================================
function shakeField(id) {
  const el = document.getElementById(id);
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

// ===================================
// VALIDATION RULES
// ===================================
const rules = {
  'cf-name': {
    errId: 'err-name',
    validate(v) {
      if (!v.trim())             return 'Name is required.';
      if (v.trim().length < 2)   return 'Name must be at least 2 characters.';
      if (v.trim().length > 60)  return 'Name is too long (max 60 characters).';
      if (hasNumbersInName(v))   return 'Name should not contain numbers.';
      if (isAllCaps(v))          return "Please don't type in all caps.";
      if (isFakeName(v))         return 'Please enter your real name.';
      if (containsBannedWord(v)) return 'Please keep it respectful — no inappropriate language.';
      return null;
    },
  },
  'cf-email': {
    errId: 'err-email',
    validate(v) {
      if (!v.trim())                                  return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.';
      if (isBlockedDomain(v))                        return 'Disposable email addresses are not allowed.';
      if (isTrollEmail(v))                           return 'Please use a real email address.';
      return null;
    },
  },
  'cf-subject': {
    errId: 'err-subject',
    validate(v) {
      if (!v.trim())             return 'Subject is required.';
      if (v.trim().length < 3)   return 'Subject must be at least 3 characters.';
      if (v.trim().length > 100) return 'Subject is too long (max 100 characters).';
      if (isAllCaps(v))          return "Please don't type in all caps.";
      if (isCopyPasteGarbage(v)) return 'Subject contains invalid repeated characters.';
      if (containsBannedWord(v)) return 'Please keep it respectful — no inappropriate language.';
      return null;
    },
  },
  'cf-message': {
    errId: 'err-message',
    validate(v) {
      if (!v.trim())              return 'Message is required.';
      if (v.trim().length < 10)   return 'Message must be at least 10 characters.';
      if (v.trim().length > 3000) return 'Message is too long (max 3000 characters).';
      if (isAllCaps(v))           return "Please don't type in all caps — it's hard to read.";
      if (isRepeatedSpam(v))      return 'Your message looks like spam. Please write a real message.';
      if (isCopyPasteGarbage(v))  return 'Message contains invalid repeated characters.';
      if (containsBannedWord(v))  return 'Your message contains inappropriate language. Please revise it.';
      return null;
    },
  },
};

function validateField(id) {
  const el       = document.getElementById(id);
  const rule     = rules[id];
  const errEl    = document.getElementById(rule.errId);
  const error    = rule.validate(el.value);
  const wasError = el.classList.contains('error');

  el.classList.toggle('error', !!error);
  errEl.textContent = error || '';

  if (error && !wasError) shakeField(id);
  return !error;
}

function validateAll() {
  return Object.keys(rules).map(validateField).every(Boolean);
}

// Live validation
Object.keys(rules).forEach(id => {
  document.getElementById(id).addEventListener('blur',  () => validateField(id));
  document.getElementById(id).addEventListener('input', () => {
    if (document.getElementById(id).classList.contains('error')) validateField(id);
  });
});

// ===================================
// UI HELPERS
// ===================================
function setLoading(on) {
  submitBtn.disabled = on;
  labelEl.hidden     = on;
  loadingEl.hidden   = !on;
}

// ===================================
// SUBMIT HANDLER
// ===================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.classList.remove('show');

  // 1. Flood check
  if (isFlooding()) {
    const msg = floodCooldownMsg();
    showStatus('warning', msg);
    showToast('warning', msg, 6000);
    return;
  }

  // 2. Validate all fields
  if (!validateAll()) {
    showToast('error', 'Please fix the highlighted fields before sending.', 4000);
    return;
  }

  setLoading(true);
  showToast('info', 'Sending your message…', 3000);

  const params = {
    from_name:  document.getElementById('cf-name').value.trim(),
    from_email: document.getElementById('cf-email').value.trim(),
    subject:    document.getElementById('cf-subject').value.trim(),
    message:    document.getElementById('cf-message').value.trim(),
    to_email:   'rencesamontanez@gmail.com',
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    recordSubmit();

    // ✅ Success — inline banner + toast
    showStatus('success', "Message sent! I'll get back to you as soon as possible.");
    showToast('success', "Your message was sent successfully! I'll get back to you soon.", 7000);

    form.reset();
    Object.keys(rules).forEach(id => {
      document.getElementById(id).classList.remove('error');
      document.getElementById(rules[id].errId).textContent = '';
    });

  } catch (err) {
    console.error('EmailJS error:', err);
    const errMsg = 'Failed to send. Please email me directly at rencesamontanez@gmail.com';
    showStatus('error', errMsg);
    showToast('error', errMsg, 8000);
  } finally {
    setLoading(false);
  }
});
