// ── Konfiguration ──
const GOOGLE_API_KEY = 'AIzaSyDg3Bp8_PmkD9vi5UApN_3qihT0UCWpDiA';
const PLACE_ID       = 'ChIJMaH56hgvmEcRP4MMML00W54';
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

if (slides.length > 0 && dotsContainer) {
    slides.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
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

    if (data.rating) {
        if (ratingEl) ratingEl.textContent = data.rating.toFixed(1);
        if (starsEl)  starsEl.textContent  = starsHTML(data.rating);
    }
    const total = data.userRatingCount;
    if (total && countEl) countEl.textContent = `${total} Bewertung${total !== 1 ? 'en' : ''} auf Google`;

    const reviews = data.reviews || [];
    if (!reviews.length) {
        grid.innerHTML = '<p class="reviews-loading">Noch keine Bewertungen vorhanden.</p>';
        return;
    }

    grid.innerHTML = reviews.map(r => {
        const name  = r.authorAttribution?.displayName || 'Gast';
        const photo = r.authorAttribution?.photoUri    || '';
        const time  = r.relativePublishTimeDescription || '';
        const text  = r.text?.text || '';
        const stars = r.rating || 5;
        return `
        <div class="review-card reveal">
            <div class="review-header">
                <img class="review-avatar" src="${photo}" alt="${name}" onerror="this.style.display='none'">
                <div>
                    <div class="review-author">${name}</div>
                    <div class="review-date">${time}</div>
                </div>
            </div>
            <div class="review-stars">${starsHTML(stars)}</div>
            ${text ? `<p class="review-text">${text}</p>` : ''}
        </div>`;
    }).join('');

    grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
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
        const url = `https://places.googleapis.com/v1/places/${PLACE_ID}?fields=rating,userRatingCount,reviews&languageCode=de&key=${GOOGLE_API_KEY}`;
        const res = await fetch(url, { headers: { 'X-Goog-Api-Key': GOOGLE_API_KEY } });
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
const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
    });
}
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }
window.scrollToTop = scrollToTop;

// ── Start ──
initCookieBanner();
