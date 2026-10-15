const fs = require('fs');
const path = require('path');

const sprite = fs.readFileSync(path.join(__dirname, 'sprite.svg.html'), 'utf8');
let html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// 1. Clean up <head>: Remove CDN Tailwind, Google Fonts, Lucide, Tailwind inline config, inline styles
const headHead = html.substring(0, html.indexOf('<!-- TODO: og:url'));
const headMeta = `<!-- SEO & Canonical -->
<link rel="canonical" href="https://tharsei.de/" />
`;

// Replace obsolete TODO in head
html = html.replace('<!-- TODO: og:url und og:image auf die echte, live erreichbare Domain/Pfad anpassen, sobald die Seite deployed ist. -->\n', '');

// Insert canonical before og:type
html = html.replace('<meta property="og:type"', headMeta + '<meta property="og:type"');

// Replace external CDNs & inline style with style.css
const cdnRegex = /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>[\s\S]*?<\/style>/;
html = html.replace(cdnRegex, '<link rel="stylesheet" href="style.css" />');

// 2. Inject SVG sprite right after <body>
html = html.replace('<body class="font-body text-ink antialiased">', '<body class="font-body text-ink antialiased">\n' + sprite);

// 3. Update Burger Button to include both SVG icons (menu and x)
const oldBurger = `<button id="burger" class="lg:hidden grid place-items-center w-11 h-11 rounded-full text-forest hover:bg-cream/70 transition" aria-label="Menü öffnen" aria-expanded="false" aria-controls="mobileMenu">
          <i data-lucide="menu" class="w-6 h-6"></i>
        </button>`;

const newBurger = `<button id="burger" class="lg:hidden grid place-items-center w-11 h-11 rounded-full text-forest hover:bg-cream/70 transition" aria-label="Menü öffnen" aria-expanded="false" aria-controls="mobileMenu">
          <svg id="burgerIconMenu" class="w-6 h-6" aria-hidden="true"><use href="#icon-menu"></use></svg>
          <svg id="burgerIconClose" class="w-6 h-6 hidden" aria-hidden="true"><use href="#icon-x"></use></svg>
        </button>`;
html = html.replace(oldBurger, newBurger);

// 4. Replace all <i data-lucide="NAME" class="CLASS"></i> with SVG use
html = html.replace(/<i data-lucide="([^"]+)" class="([^"]*)"><\/i>/g, '<svg class="$2" aria-hidden="true"><use href="#icon-$1"></use></svg>');

// 5. Replace data-img with real src attributes
const imgMap = {
  "mindful": "images/mindful.jpg",
  "lTbdev": "images/lTbdev.jpg",
  "beratung": "images/beratung.jpg",
  "portrait": "images/portrait.jpg",
  "kurt": "images/kurt.jpg",
  "logo": "images/logo.png",
  "lLeben": "images/lLeben.jpg",
  "lMittt": "images/lMittt.jpg",
  "lKideti": "images/lKideti.jpg"
};

// Replace on <img> tags
Object.entries(imgMap).forEach(([k, src]) => {
  const r = new RegExp(`<img data-img="${k}"([^>]*)>`, 'g');
  html = html.replace(r, (match, rest) => {
    // If it is the hero portrait (first portrait image on home)
    if (k === 'portrait' && rest.includes('Esther Sluiter, Begleitung')) {
      return `<img src="${src}" fetchpriority="high"${rest}>`;
    }
    return `<img src="${src}"${rest}>`;
  });
});

// Gallery divs on kurt page
html = html.replace('<div class="grid grid-cols-2 md:grid-cols-3 gap-4">', '<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">');
html = html.replace(
  '<div class="frame rounded-2xl aspect-square shadow-card" data-img="kurt" role="img" aria-label="Kurt am Deich"></div>',
  '<div class="frame rounded-2xl aspect-square shadow-card" style="background-image:url(images/kurt.jpg);background-size:cover;background-position:center" role="img" aria-label="Kurt am Deich"></div>'
);
html = html.replace(
  '<div class="frame rounded-2xl aspect-square shadow-card" data-img="portrait" role="img" aria-label="Esther Sluiter in der Praxis" style="background-position:center 12%"></div>',
  '<div class="frame rounded-2xl aspect-square shadow-card" style="background-image:url(images/portrait.jpg);background-size:cover;background-position:center 12%" role="img" aria-label="Esther Sluiter in der Praxis"></div>'
);
html = html.replace(
  '<div class="frame rounded-2xl aspect-square shadow-card" data-img="beratung" role="img" aria-label="Im Gespräch"></div>',
  '<div class="frame rounded-2xl aspect-square shadow-card" style="background-image:url(images/beratung.jpg);background-size:cover;background-position:center" role="img" aria-label="Im Gespräch"></div>'
);

// 6. Navigation links: update href="#" to href="#page"
const pages = ['home', 'angebote', 'kurt', 'haltung', 'kontakt', 'impressum', 'datenschutz'];
pages.forEach(p => {
  const r = new RegExp(`href="#" data-nav="${p}"`, 'g');
  html = html.replace(r, `href="#${p}" data-nav="${p}"`);
});

// 7. Form: wrap in real <form> tag and button type="submit"
html = html.replace(
  '<div class="space-y-5" id="contactForm">',
  '<form class="space-y-5" id="contactForm" novalidate>'
);
html = html.replace(
  '<button id="submitBtn" class="btn-terra w-full sm:w-auto px-8 py-3.5 rounded-full font-medium inline-flex items-center justify-center gap-2">',
  '<button id="submitBtn" type="submit" class="btn-terra w-full sm:w-auto px-8 py-3.5 rounded-full font-medium inline-flex items-center justify-center gap-2">'
);
// replace closing div of contactForm with </form>
html = html.replace('<!-- Confirmation -->', '</form>\n        <!-- Confirmation -->');

// 8. Improve text contrast for small links
html = html.replace(/class="text-terra underline/g, 'class="text-terra-dark underline');

// 9. Update Datenschutzerklärung
const oldCookies = `      <div>
        <h2 class="font-display text-2xl text-forest mb-3">Cookies</h2>
        <p>
          Diese Website verwendet teilweise Cookies. Session-Cookies werden nach Ende Ihres Besuchs automatisch
          gelöscht. Permanente Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese selbst löschen oder eine
          automatische Löschung durch Ihren Webbrowser erfolgt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
          beziehungsweise, sofern eine Einwilligung abgefragt wurde, § 25 Abs. 1 TDDDG.
        </p>
      </div>`;

const newCookiesAndFonts = `      <div>
        <h2 class="font-display text-2xl text-forest mb-3">Cookies</h2>
        <p>
          Diese Website verwendet keine Cookies und keine Tracking-Tools. Beim Aufruf der Seiten werden keinerlei
          persistente oder temporäre Cookies auf Ihrem Endgerät gespeichert.
        </p>
      </div>

      <div>
        <h2 class="font-display text-2xl text-forest mb-3">Schriftarten (Lokales Hosting)</h2>
        <p>
          Diese Seite nutzt zur einheitlichen Darstellung von Texten Schriftarten (Lora und Inter). Alle Schriftdateien
          sind lokal auf dem eigenen Webserver gespeichert und werden ohne externe Verbindung zu Servern Dritter
          (wie Google) ausgeliefert. Es erfolgt keine Übermittlung Ihrer IP-Adresse an externe Schriftarten-Dienste.
        </p>
      </div>`;

html = html.replace(oldCookies, newCookiesAndFonts);

// 10. Replace scripts at the bottom with modern hash routing, form handling, and a11y
const scriptSection = `
<script>
(function () {
  /* ---------- Image fallback ---------- */
  document.querySelectorAll('.frame img').forEach(function (img) {
    img.addEventListener('error', function () { img.setAttribute('data-broken', '1'); });
    if (img.complete && img.naturalWidth === 0) img.setAttribute('data-broken', '1');
  });

  /* ---------- Hash-based SPA routing ---------- */
  var validPages = ['home', 'haltung', 'angebote', 'kurt', 'kontakt', 'impressum', 'datenschutz'];
  var pages = {};
  validPages.forEach(function (k) {
    pages[k] = document.getElementById('page-' + k);
  });
  var navLinks = document.querySelectorAll('[data-nav]');

  function getTargetFromHash() {
    var h = (window.location.hash || '').replace('#', '').trim();
    return pages[h] ? h : 'home';
  }

  function go(name, pushHash) {
    if (!pages[name]) name = 'home';
    if (pushHash !== false && window.location.hash !== '#' + name) {
      window.location.hash = name;
      return;
    }
    validPages.forEach(function (k) {
      if (pages[k]) pages[k].classList.toggle('active', k === name);
    });
    navLinks.forEach(function (l) {
      if (l.classList.contains('nav-link')) {
        l.classList.toggle('current', l.getAttribute('data-nav') === name);
      }
    });
    window.scrollTo({ top: 0, behavior: 'auto' });
    closeMenu();
  }

  window.addEventListener('hashchange', function () {
    go(getTargetFromHash(), false);
  });

  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-nav]');
    if (!t) return;
    var target = t.getAttribute('data-nav');
    if (target) {
      e.preventDefault();
      go(target);
    }
  });

  /* ---------- Mobile menu with Escape and outside-click support ---------- */
  var burger = document.getElementById('burger');
  var menu = document.getElementById('mobileMenu');
  var iconMenu = document.getElementById('burgerIconMenu');
  var iconClose = document.getElementById('burgerIconClose');

  function openMenu() {
    menu.classList.remove('hidden-menu');
    burger.setAttribute('aria-expanded', 'true');
    if (iconMenu && iconClose) {
      iconMenu.classList.add('hidden');
      iconClose.classList.remove('hidden');
    }
  }

  function closeMenu() {
    menu.classList.add('hidden-menu');
    burger.setAttribute('aria-expanded', 'false');
    if (iconMenu && iconClose) {
      iconClose.classList.add('hidden');
      iconMenu.classList.remove('hidden');
    }
  }

  burger.addEventListener('click', function () {
    if (menu.classList.contains('hidden-menu')) openMenu(); else closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.classList.contains('hidden-menu')) {
      closeMenu();
    }
  });

  document.addEventListener('click', function (e) {
    if (!menu.classList.contains('hidden-menu') && !menu.contains(e.target) && !burger.contains(e.target)) {
      closeMenu();
    }
  });

  /* ---------- Accordion ---------- */
  document.querySelectorAll('.acc-head').forEach(function (head) {
    head.addEventListener('click', function () {
      var item = head.closest('.acc-item');
      var isOpen = item.classList.contains('open');
      item.closest('.space-y-3')?.querySelectorAll('.acc-item.open').forEach(function (o) { o.classList.remove('open'); });
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ---------- Google Maps click-to-consent ---------- */
  var loadMapBtn = document.getElementById('loadMapBtn');
  var mapConsent = document.getElementById('mapConsent');
  var mapFrame = document.getElementById('mapFrame');
  if (loadMapBtn) {
    loadMapBtn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.title = 'Standort Tharsei, Kloster-Langen-Straße 30, 26723 Emden';
      iframe.src = 'https://maps.google.com/maps?q=Kloster-Langen-Stra%C3%9Fe%2030%2C%2026723%20Emden&z=15&output=embed';
      iframe.width = '100%';
      iframe.height = '380';
      iframe.style.border = '0';
      iframe.style.display = 'block';
      iframe.style.filter = 'saturate(.9)';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      mapFrame.appendChild(iframe);
      mapFrame.classList.remove('hidden');
      mapConsent.classList.add('hidden');
    });
  }

  /* ---------- Accessible contact form ---------- */
  var formInner = document.getElementById('contactForm');
  var submitBtn = document.getElementById('submitBtn');
  var success = document.getElementById('formSuccess');
  var resetBtn = document.getElementById('resetBtn');
  var formError = document.getElementById('formError');

  if (formInner) {
    formInner.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('c-name').value.trim();
      var mail = document.getElementById('c-mail').value.trim();
      var text = document.getElementById('c-text').value.trim();
      var consent = document.getElementById('c-consent').checked;
      var emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      var isMailValid = emailRegex.test(mail);

      [['c-name', !!name], ['c-mail', isMailValid], ['c-text', !!text]].forEach(function (pair) {
        var el = document.getElementById(pair[0]);
        el.style.borderColor = pair[1] ? '' : '#9C522D';
      });

      var consentBox = document.getElementById('c-consent');
      consentBox.style.outline = consent ? '' : '2px solid #9C522D';

      if (!name || !isMailValid || !text || !consent) {
        formError.textContent = !isMailValid && mail
          ? 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
          : 'Bitte füllen Sie alle erforderlichen Felder aus und bestätigen Sie die Datenschutzerklärung.';
        formError.classList.remove('hidden');
        return;
      }

      formError.classList.add('hidden');

      // Honeypot check
      if (document.getElementById('c-website').value) {
        formInner.classList.add('hidden');
        success.classList.remove('hidden');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.style.opacity = '.6';

      var data = new URLSearchParams();
      data.set('name', name);
      data.set('email', mail);
      data.set('phone', document.getElementById('c-tel').value.trim());
      data.set('anliegen', document.getElementById('c-anliegen').value);
      data.set('message', text);
      data.set('_subject', 'Neue Nachricht über das Kontaktformular: Tharsei');
      data.set('_template', 'table');
      data.set('_cc', 'esther.sluiter@web.de');
      data.set('_captcha', 'false');

      fetch('https://formsubmit.co/ajax/info@tharsei.de', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Accept': 'application/json' },
        body: data.toString()
      })
      .then(function (res) { return res.json(); })
      .then(function (json) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
        if (json && (json.success === true || json.success === 'true')) {
          formInner.classList.add('hidden');
          success.classList.remove('hidden');
          window.scrollTo({ top: document.getElementById('page-kontakt').offsetTop - 40, behavior: 'smooth' });
        } else {
          formError.textContent = 'Da ist leider etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie mir direkt an info@tharsei.de.';
          formError.classList.remove('hidden');
        }
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '';
        formError.textContent = 'Da ist leider etwas schiefgelaufen. Bitte versuchen Sie es erneut oder schreiben Sie mir direkt an info@tharsei.de.';
        formError.classList.remove('hidden');
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      ['c-name','c-mail','c-tel','c-text'].forEach(function(id){ document.getElementById(id).value=''; });
      document.getElementById('c-consent').checked = false;
      success.classList.add('hidden');
      formInner.classList.remove('hidden');
    });
  }

  /* ---------- Initial route trigger ---------- */
  go(getTargetFromHash(), false);
})();
</script>
</body>
</html>
`;

// Replace bottom scripts
const oldScriptRegex = /<script>window\.__IMGS=[\s\S]*?<\/html>/;
html = html.replace(oldScriptRegex, scriptSection);

fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('index.html transformed successfully.');
