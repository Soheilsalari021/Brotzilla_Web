const fs = require('fs');

let content = fs.readFileSync('speisen.html', 'utf8');

// 1. Add Tabs and open first tab-content
const tabsHtml = `                <div class="menu-tabs">
                    <button class="menu-tab-btn active" onclick="switchTab('tab-fruehstueck', this)">FRÜHSTÜCK & MORE</button>
                    <button class="menu-tab-btn" onclick="switchTab('tab-pizza', this)">PIZZA & EXTRAS</button>
                    <button class="menu-tab-btn" onclick="switchTab('tab-dessert', this)">KAFFEE & KUCHEN</button>
                </div>
                
                <div id="tab-fruehstueck" class="tab-content active">
                    <div class="sub-nav" style="margin-bottom: 2rem;">
                        <a href="#klassisch">Klassisch</a>
                        <a href="#gruppen">Für Gruppen</a>
                        <a href="#eiergerichte">Eiergerichte</a>
                        <a href="#spezialitaeten">Spezialitäten</a>
                        <a href="#sandwich">Sandwich</a>
                    </div>
`;

content = content.replace(/<h2 class="menu-title">FRÜHSTÜCK & MORE[\s\S]*?<\/div>/, tabsHtml);

// 2. Close first tab and open second tab before Pizza
const pizzaTabOpen = `                </div> <!-- End tab-fruehstueck -->
                
                <div id="tab-pizza" class="tab-content">
                    <div class="sub-nav" style="margin-bottom: 2rem;">
                        <a href="#pizza">Pizza</a>
                        <a href="#extras">Extras</a>
                        <a href="#mittagsangebote">Angebote</a>
                    </div>
                <div class="menu-category" id="pizza" style="margin-top: 2rem;">
`;

content = content.replace('<div class="menu-category" id="pizza" style="margin-top: 4rem;">', pizzaTabOpen);

// 3. Close second tab and open third tab before Dessert
const dessertTabOpen = `                </div> <!-- End tab-pizza -->
                
                <div id="tab-dessert" class="tab-content">
                <div class="menu-category highlight-box" id="torten-dessert" style="margin-top: 2rem; text-align: center; padding: 2rem; border-radius: 12px;">
`;

content = content.replace('<div class="menu-category highlight-box" id="torten-dessert" style="margin-top: 4rem; text-align: center; padding: 2rem; border-radius: 12px;">', dessertTabOpen);

// 4. Close the last tab before </section>
content = content.replace(/(\s*<\/div>\s*<\/section>)/, '\n                </div> <!-- End tab-dessert -->$1');

// 5. Fix pizza prices to use wrapper
content = content.replace(/<span class="item-price" style="text-align: center;">(.*?)<\/span>\s*<span class="item-price" style="text-align: center;">(.*?)<\/span>\s*<span class="item-price" style="text-align: right;">(.*?)<\/span>/g,
  '<div class="price-three-cols-wrapper"><span class="item-price" data-label="Klein">$1</span><span class="item-price" data-label="Groß">$2</span><span class="item-price" data-label="Familie">$3</span></div>'
);

// 6. Add scroll to top button before </body>
content = content.replace('</body>', '<button id="scrollTopBtn" class="scroll-top-btn" onclick="scrollToTop()">&#8679;</button>\n</body>');

fs.writeFileSync('speisen.html', content);
console.log("speisen.html successfully refactored.");
