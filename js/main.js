// ── Konfiguration ──
// Hinweis: API-Schlüssel dürfen nicht clientseitig eingebettet werden.
// Serverless-Endpoint `/api/reviews` liefert die Bewertungen sicher vom Server.
const CONSENT_KEY    = 'brotzilla_cookie_consent';
const CACHE_KEY      = 'brotzilla_reviews_cache';
const ONE_WEEK       = 7 * 24 * 60 * 60 * 1000;

// ── Burger Menu ──
const toggle   = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');

if (toggle) {
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// ── Hero Slider ──
const slides        = document.querySelectorAll('.hero-slider .slide');
const dotsContainer = document.getElementById('slider-dots');
let current   = 0;
let autoTimer;

const slideIcons = [
    'img/SVG/1.webp',
    'img/SVG/2.webp',
    'img/IMG_4373.webp',
];

if (slides.length > 0 && dotsContainer) {
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        const icon = slideIcons[i] || slideIcons[0];
        dot.innerHTML = `<img src="${icon}" alt="" class="dot-svg">`;
        dot.addEventListener('click', () => { goTo(i); startAuto(); });
        dotsContainer.appendChild(dot);
    });

    function goTo(index) {
        slides[current].classList.remove('active');
        dotsContainer.children[current].classList.remove('active');
        current = (index + slides.length) % slides.length;
        slides[current].classList.add('active');
        dotsContainer.children[current].classList.add('active');
    }

    function startAuto() {
        clearInterval(autoTimer);
        autoTimer = setInterval(() => goTo(current + 1), 4000);
    }

    document.getElementById('slider-next')?.addEventListener('click', () => { goTo(current + 1); startAuto(); });
    document.getElementById('slider-prev')?.addEventListener('click', () => { goTo(current - 1); startAuto(); });

    startAuto();
}

// ── Scroll Reveal ──
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
});

// ── Navbar Scroll ──
const navbar = document.querySelector('.navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        navbar.style.background = window.scrollY > 60
            ? 'rgba(0,0,0,0.85)'
            : 'rgba(0,0,0,0.55)';
    });
}

// ── Cookie Consent ──
function hasConsent() {
    return localStorage.getItem(CONSENT_KEY) === 'accepted';
}

function acceptCookies() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    hideBanner();
    enableGoogleServices();
}

function declineCookies() {
    localStorage.setItem(CONSENT_KEY, 'declined');
    hideBanner();
}

function hideBanner() {
    const banner = document.getElementById('cookie-banner');
    if (banner) {
        banner.classList.remove('visible');
        setTimeout(() => banner.style.display = 'none', 400);
    }
}

function enableGoogleServices() {
    // Google Maps iframe aktivieren
    const iframe      = document.getElementById('maps-iframe');
    const placeholder = document.getElementById('maps-placeholder');
    if (iframe && iframe.dataset.src) {
        iframe.src = iframe.dataset.src;
        iframe.style.display = 'block';
    }
    if (placeholder) placeholder.style.display = 'none';

    // Google Bewertungen laden
    loadGoogleReviews();
}

function initCookieBanner() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    const consent = localStorage.getItem(CONSENT_KEY);

    if (!consent) {
        // Noch keine Entscheidung — Banner anzeigen, Google-Dienste blockieren
        banner.style.display = 'block';
        setTimeout(() => banner.classList.add('visible'), 80);

        const iframe      = document.getElementById('maps-iframe');
        const placeholder = document.getElementById('maps-placeholder');
        if (iframe)      iframe.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';

    } else if (consent === 'accepted') {
        banner.style.display = 'none';
        enableGoogleServices();

    } else {
        // Abgelehnt
        banner.style.display = 'none';
        const iframe      = document.getElementById('maps-iframe');
        const placeholder = document.getElementById('maps-placeholder');
        if (iframe)      iframe.style.display = 'none';
        if (placeholder) placeholder.style.display = 'flex';
    }

    document.getElementById('cookie-accept')?.addEventListener('click', acceptCookies);
    document.getElementById('cookie-decline')?.addEventListener('click', declineCookies);
}

window.acceptCookies = acceptCookies;

// ── Google Reviews ──
function starsHTML(rating) {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

function renderReviews(data) {
    const ratingEl = document.getElementById('reviews-rating');
    const starsEl  = document.getElementById('reviews-stars-big');
    const countEl  = document.getElementById('reviews-count');
    const grid     = document.getElementById('reviews-grid');
    if (!grid) return;

    if (data.rating && ratingEl) ratingEl.textContent = data.rating.toFixed(1);
    if (data.rating && starsEl)  starsEl.textContent  = starsHTML(data.rating);

    const total = data.userRatingCount;
    if (total && countEl) countEl.textContent = `${total} Bewertung${total !== 1 ? 'en' : ''} auf Google`;

    const reviews = data.reviews || [];
    grid.innerHTML = ''; // safe clear
    if (!reviews.length) {
        const p = document.createElement('p');
        p.className = 'reviews-loading';
        p.textContent = 'Noch keine Bewertungen vorhanden.';
        grid.appendChild(p);
        return;
    }

    reviews.forEach(r => {
        const name  = r.authorAttribution?.displayName || 'Gast';
        const photo = r.authorAttribution?.photoUri    || '';
        const time  = r.relativePublishTimeDescription || '';
        const text  = r.text?.text || '';
        const stars = r.rating || 5;

        const card = document.createElement('div');
        card.className = 'review-card reveal';

        const header = document.createElement('div');
        header.className = 'review-header';

        const img = document.createElement('img');
        img.className = 'review-avatar';
        if (photo) img.src = photo;
        img.alt = name;
        img.onerror = function() { this.style.display = 'none'; };

        const info = document.createElement('div');
        const author = document.createElement('div');
        author.className = 'review-author';
        author.textContent = name;
        const date = document.createElement('div');
        date.className = 'review-date';
        date.textContent = time;

        info.appendChild(author);
        info.appendChild(date);
        header.appendChild(img);
        header.appendChild(info);

        const starsElLocal = document.createElement('div');
        starsElLocal.className = 'review-stars';
        starsElLocal.textContent = starsHTML(stars);

        card.appendChild(header);
        card.appendChild(starsElLocal);
        if (text) {
            const p = document.createElement('p');
            p.className = 'review-text';
            p.textContent = text;
            card.appendChild(p);
        }

        grid.appendChild(card);
        revealObserver.observe(card);
    });
}

async function loadGoogleReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid) return;

    // Cache prüfen
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && (Date.now() - cached.timestamp) < ONE_WEEK) {
            renderReviews(cached.data);
            return;
        }
    } catch (_) {}

    // Neu von Google holen
    try {
        // Hole Bewertungen über den serverseitigen Endpoint (API-Key bleibt auf dem Server)
        const res = await fetch('/api/reviews');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
        renderReviews(data);
    } catch (e) {
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
            if (cached) { renderReviews(cached.data); return; }
        } catch (_) {}
        if (grid) grid.innerHTML = '<p class="reviews-loading">Bewertungen konnten nicht geladen werden.</p>';
    }
}

// ── Tabs ──
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.menu-tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId)?.classList.add('active');
    btn.classList.add('active');
}
window.switchTab = switchTab;

// ── Scroll To Top ──
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
window.scrollToTop = scrollToTop;

document.addEventListener('DOMContentLoaded', () => {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (!scrollTopBtn) return;

    // toggle visibility on scroll
    const onScroll = () => scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });

    // initial state
    onScroll();
});

// ── Start ──
initCookieBanner();
