import re

with open('speisen.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Tabs and open first tab-content
tabs_html = '''                <div class="menu-tabs">
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
'''

content = re.sub(
    r'<h2 class="menu-title">FRÜHSTÜCK & MORE.*?</div>',
    tabs_html,
    content,
    flags=re.DOTALL
)

# 2. Close first tab and open second tab before Pizza
pizza_tab_open = '''                </div> <!-- End tab-fruehstueck -->
                
                <div id="tab-pizza" class="tab-content">
                    <div class="sub-nav" style="margin-bottom: 2rem;">
                        <a href="#pizza">Pizza</a>
                        <a href="#extras">Extras</a>
                        <a href="#mittagsangebote">Angebote</a>
                    </div>
                <div class="menu-category" id="pizza" style="margin-top: 2rem;">
'''

content = re.sub(
    r'<div class="menu-category" id="pizza" style="margin-top: 4rem;">',
    pizza_tab_open,
    content
)

# 3. Close second tab and open third tab before Dessert
dessert_tab_open = '''                </div> <!-- End tab-pizza -->
                
                <div id="tab-dessert" class="tab-content">
                <div class="menu-category highlight-box" id="torten-dessert" style="margin-top: 2rem; text-align: center; padding: 2rem; border-radius: 12px;">
'''

content = re.sub(
    r'<div class="menu-category highlight-box" id="torten-dessert" style="margin-top: 4rem; text-align: center; padding: 2rem; border-radius: 12px;">',
    dessert_tab_open,
    content
)

# 4. Close the last tab before </section>
content = re.sub(
    r'(\s*</div>\s*</section>)',
    r'\n                </div> <!-- End tab-dessert -->\1',
    content
)

# 5. Fix pizza prices to use wrapper
def replace_price(m):
    return f'<div class="price-three-cols-wrapper"><span class="item-price" data-label="Klein">{m.group(1)}</span><span class="item-price" data-label="Groß">{m.group(2)}</span><span class="item-price" data-label="Familie">{m.group(3)}</span></div>'

content = re.sub(
    r'<span class="item-price" style="text-align: center;">(.*?)</span>\s*<span class="item-price" style="text-align: center;">(.*?)</span>\s*<span class="item-price" style="text-align: right;">(.*?)</span>',
    replace_price,
    content
)

# 6. Add scroll to top button before </body>
content = content.replace('</body>', '<button id="scrollTopBtn" class="scroll-top-btn" onclick="scrollToTop()">&#8679;</button>\n</body>')

with open('speisen.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("speisen.html successfully refactored.")
