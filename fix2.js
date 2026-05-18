const fs = require('fs');
let js = fs.readFileSync('js/main.js', 'utf8');

const additionalJs = `
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
`;

fs.writeFileSync('js/main.js', js + '\n' + additionalJs);
console.log('main.js updated.');

let getraenke = fs.readFileSync('getraenke.html', 'utf8');
if (!getraenke.includes('scrollTopBtn')) {
    getraenke = getraenke.replace('</body>', '<button id="scrollTopBtn" class="scroll-top-btn" onclick="scrollToTop()">&#8679;</button>\n</body>');
    fs.writeFileSync('getraenke.html', getraenke);
    console.log('getraenke.html updated with scroll-to-top');
}

let indexHtml = fs.readFileSync('index.html', 'utf8');
if (!indexHtml.includes('scrollTopBtn')) {
    indexHtml = indexHtml.replace('</body>', '<button id="scrollTopBtn" class="scroll-top-btn" onclick="scrollToTop()">&#8679;</button>\n</body>');
    fs.writeFileSync('index.html', indexHtml);
    console.log('index.html updated with scroll-to-top');
}
