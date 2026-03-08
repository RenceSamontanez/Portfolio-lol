// ===================================
// CONTACT FORM — contact.js
// Uses EmailJS to send directly to Gmail
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

// Fake name patterns
const FAKE_NAME_PATTERNS = [
  /^(.)\1{2,}$/i,
  /^(test|tester|testing|asdf|qwerty|zxcvbn|lorem|ipsum|admin|user|guest|anon|anonymous|nobody|noone|haha|hehe|lol|wtf|fake|troll|bot|robot|null|undefined|xyz|abc|zzz|aaa|bbb)$/i,
  /^[^a-zA-Z\u00C0-\u024F]+$/,
];

// Troll email local-part patterns
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

// Banned words check
function containsBannedWord(text) {
  const clean = text.toLowerCase().replace(/[^a-z0-9\s]/gi, ' ');
  return BANNED_WORDS.some(word => {
    const esc = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(^|\\s)${esc}(\\s|$)`, 'i').test(clean);
  });
}

// Blocked email domain
function isBlockedDomain(email) {
  const domain = email.split('@')[1]?.toLowerCase() || '';
  return BLOCKED_DOMAINS.includes(domain);
}

// Troll email pattern
function isTrollEmail(email) {
  const local = email.split('@')[0] || '';
  return TROLL_EMAIL_PATTERNS.some(p => p.test(local));
}

// Fake name pattern
function isFakeName(name) {
  return FAKE_NAME_PATTERNS.some(p => p.test(name.trim()));
}

// Numbers in name — allow hyphens/apostrophes/spaces but not digits
function hasNumbersInName(name) {
  return /\d/.test(name);
}

// ALL CAPS — if 80%+ of letters are uppercase and there are 3+ letters, flag it
function isAllCaps(text) {
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length < 3) return false;
  const upperCount = (text.match(/[A-Z]/g) || []).length;
  return upperCount / letters.length >= 0.8;
}

// Repeated word spam — e.g. "hello hello hello hello"
function isRepeatedSpam(text) {
  const words = text.trim().toLowerCase().split(/\s+/);
  if (words.length < 4) return false;
  // Count frequency of each word
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const maxFreq = Math.max(...Object.values(freq));
  // If any single word makes up more than 50% of the total, it's spam
  return maxFreq / words.length > 0.5;
}

// Copy-paste wall of text — same character repeated excessively
function isCopyPasteGarbage(text) {
  // Detect long runs of the same character (e.g. "aaaaaaaaaa")
  return /(.)\1{9,}/.test(text);
}

// ===================================
// SHAKE ANIMATION TRIGGER
// ===================================
function shakeField(id) {
  const el = document.getElementById(id);
  el.classList.remove('shake');
  // Force reflow so the animation restarts if already shaking
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
      if (!v.trim())              return 'Name is required.';
      if (v.trim().length < 2)    return 'Name must be at least 2 characters.';
      if (v.trim().length > 60)   return 'Name is too long (max 60 characters).';
      if (hasNumbersInName(v))    return 'Name should not contain numbers.';
      if (isAllCaps(v))           return 'Please don\'t type in all caps.';
      if (isFakeName(v))          return 'Please enter your real name.';
      if (containsBannedWord(v))  return 'Please keep it respectful — no inappropriate language.';
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
      if (!v.trim())              return 'Subject is required.';
      if (v.trim().length < 3)    return 'Subject must be at least 3 characters.';
      if (v.trim().length > 100)  return 'Subject is too long (max 100 characters).';
      if (isAllCaps(v))           return 'Please don\'t type in all caps.';
      if (isCopyPasteGarbage(v))  return 'Subject contains invalid repeated characters.';
      if (containsBannedWord(v))  return 'Please keep it respectful — no inappropriate language.';
      return null;
    },
  },
  'cf-message': {
    errId: 'err-message',
    validate(v) {
      if (!v.trim())              return 'Message is required.';
      if (v.trim().length < 10)   return 'Message must be at least 10 characters.';
      if (v.trim().length > 3000) return 'Message is too long (max 3000 characters).';
      if (isAllCaps(v))           return 'Please don\'t type in all caps — it\'s hard to read.';
      if (isRepeatedSpam(v))      return 'Your message looks like spam. Please write a real message.';
      if (isCopyPasteGarbage(v))  return 'Message contains invalid repeated characters.';
      if (containsBannedWord(v))  return 'Your message contains inappropriate language. Please revise it.';
      return null;
    },
  },
};

// ===================================
// VALIDATE SINGLE FIELD
// ===================================
function validateField(id) {
  const el    = document.getElementById(id);
  const rule  = rules[id];
  const errEl = document.getElementById(rule.errId);
  const error = rule.validate(el.value);
  const wasError = el.classList.contains('error');

  el.classList.toggle('error', !!error);
  errEl.textContent = error || '';

  // Only shake if this is a new error (not already in error state)
  if (error && !wasError) shakeField(id);

  return !error;
}

function validateAll() {
  return Object.keys(rules).map(validateField).every(Boolean);
}

// Live validation — on blur and on input if already errored
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
// SUBMIT HANDLER
// ===================================
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.classList.remove('show');

  // 1. Flood check
  if (isFlooding()) {
    showStatus('warning', floodCooldownMsg());
    return;
  }

  // 2. Validate all fields — shake each invalid one
  if (!validateAll()) return;

  setLoading(true);

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
    showStatus('success', `Message sent! I'll get back to you as soon as possible.`);
    form.reset();
    Object.keys(rules).forEach(id => {
      document.getElementById(id).classList.remove('error');
      document.getElementById(rules[id].errId).textContent = '';
    });
  } catch (err) {
    console.error('EmailJS error:', err);
    showStatus('error', 'Something went wrong. Please try emailing me directly at rencesamontanez@gmail.com');
  } finally {
    setLoading(false);
  }
});