// ─────────────────────────────────────────────
//  GOOGLE BEWERTUNGEN API (wird nun sicher übers Backend geladen)
// ─────────────────────────────────────────────

// ── Burger Menu ──
const toggle   = document.getElementById('mobile-menu');
const navLinks = document.getElementById('nav-links');

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

// ── Hero Slider ──
const slides        = document.querySelectorAll('.hero-slider .slide');
const dotsContainer = document.getElementById('slider-dots');
let current   = 0;
let autoTimer;

if (slides.length > 0) {
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

    document.getElementById('slider-next').addEventListener('click', () => { goTo(current + 1); startAuto(); });
    document.getElementById('slider-prev').addEventListener('click', () => { goTo(current - 1); startAuto(); });

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

// ── Navbar scroll effect ──
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    navbar.style.background = window.scrollY > 60
        ? 'rgba(0,0,0,0.85)'
        : 'rgba(0,0,0,0.55)';
});

// ── Google Reviews ──
function starsHTML(rating) {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
}

function renderReviews(data) {
    const ratingEl = document.getElementById('reviews-rating');
    const starsEl  = document.getElementById('reviews-stars-big');
    const countEl  = document.getElementById('reviews-count');
    const grid     = document.getElementById('reviews-grid');

    const rating = data.rating;
    const total  = data.userRatingCount;
    const reviews = data.reviews || [];

    if (rating) {
        ratingEl.textContent = rating.toFixed(1);
        starsEl.textContent  = starsHTML(rating);
    }
    if (total) countEl.textContent = `${total} Bewertung${total !== 1 ? 'en' : ''} auf Google`;

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

const CACHE_KEY = 'brotzilla_reviews_cache';
const ONE_WEEK  = 7 * 24 * 60 * 60 * 1000;

async function loadGoogleReviews() {
    // Cache prüfen — wenn jünger als 1 Woche, direkt anzeigen
    try {
        const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cached && (Date.now() - cached.timestamp) < ONE_WEEK) {
            renderReviews(cached.data);
            return;
        }
    } catch (_) {}

    // Neue Daten von unserem eigenen Backend holen (sicher vor Hacking)
    try {
        const res  = await fetch('/api/reviews');
        if (!res.ok) throw new Error(res.status);
        const data = await res.json();

        // Im Browser speichern
        localStorage.setItem(CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
        renderReviews(data);
    } catch (e) {
        // Bei Fehler: gecachte Daten als Fallback nutzen
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
            if (cached) { renderReviews(cached.data); return; }
        } catch (_) {}
        document.getElementById('reviews-grid').innerHTML =
            '<p class="reviews-loading">Bewertungen konnten nicht geladen werden.</p>';
    }
}

loadGoogleReviews();


// ── Tabs Logic ──
function switchTab(tabId, btn) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.menu-tab-btn').forEach(el => el.classList.remove('active'));
    
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}
window.switchTab = switchTab; // Ensure it's globally available

// ── Scroll To Top Logic ──
const scrollTopBtn = document.getElementById('scrollTopBtn');
if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
}
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.scrollToTop = scrollToTop;
