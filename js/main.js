// --- TAB & MENU LOGIC ---
function switchTab(tabName) {
    // Capsule buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Tab content
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');

    // Update Global Title
    const titles = { 'spot': 'Spot Calculator', 'futures': 'Futures Calculator', 'fees': 'Fee Calculator' };
    document.getElementById('calc-title').textContent = titles[tabName];
}

// Global helper to close menu from HTML onclick
function closeMenu() {
    document.getElementById('side-drawer').classList.remove('active');
    document.getElementById('menu-overlay').classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- SIDE DRAWER LOGIC ---
    const menuBtn = document.getElementById('menu-toggle');
    const closeBtn = document.getElementById('menu-close');
    const sideDrawer = document.getElementById('side-drawer');
    const overlay = document.getElementById('menu-overlay');
    
    if (menuBtn && sideDrawer && overlay) {
        menuBtn.addEventListener('click', () => {
            sideDrawer.classList.add('active');
            overlay.classList.add('active');
        });
        
        closeBtn.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
    }

    // --- PREMIUM COOKIE CONSENT LOGIC ---
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner && !localStorage.getItem('cookieConsent')) {
        // Waits 1.5 seconds after page loads, then smoothly slides up!
        setTimeout(() => {
            cookieBanner.classList.add('show');
        }, 1500); 
    }

    document.getElementById('accept-cookies')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.classList.remove('show'); // Slides down
        setTimeout(() => cookieBanner.style.display = 'none', 600); // Removes from code after slide
    });

    document.getElementById('reject-cookies')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected');
        cookieBanner.classList.remove('show'); // Slides down
        setTimeout(() => cookieBanner.style.display = 'none', 600);
    });

    // --- CURRENCY LOGIC ---
    const currencySelect = document.getElementById('currency-selector');
    const symbols = { 'USD': '$', 'EUR': '€', 'GBP': '£' };
    const savedCur = localStorage.getItem('selectedCurrency') || 'USD';
    
    if(currencySelect) currencySelect.value = savedCur;
    updateCurrency(savedCur);

    currencySelect?.addEventListener('change', (e) => {
        localStorage.setItem('selectedCurrency', e.target.value);
        updateCurrency(e.target.value);
    });

    function updateCurrency(currency) {
        document.querySelectorAll('.currency-symbol').forEach(el => el.textContent = symbols[currency]);
        document.querySelectorAll('.currency-label').forEach(el => el.textContent = currency);
    }

    // Utility Functions
    const getVal = id => parseFloat(document.getElementById(id).value) || 0;
    const formatCur = num => Math.abs(num).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    
    // --- 1. SPOT CALCULATOR LOGIC ---
    function calcSpot() {
        const inv = getVal('spot-inv'), buy = getVal('spot-buy'), sell = getVal('spot-sell'), feePct = getVal('spot-fee');
        const empty = document.getElementById('spot-empty'), filled = document.getElementById('spot-filled');

        if (!inv || !buy || !sell) { empty.classList.remove('hidden'); filled.classList.add('hidden'); return; }
        empty.classList.add('hidden'); filled.classList.remove('hidden');

        const coins = inv / buy;
        const grossVal = coins * sell;
        const totalFees = (inv * (feePct / 100)) + (grossVal * (feePct / 100));
        const netProfit = grossVal - inv - totalFees;
        const roi = (netProfit / inv) * 100;

        document.getElementById('spot-pnl').textContent = formatCur(netProfit);
        document.getElementById('spot-roi').textContent = formatCur(roi);
        document.getElementById('spot-coins').textContent = formatCur(coins);
        document.getElementById('spot-gross').textContent = formatCur(grossVal);
        document.getElementById('spot-total-fees').textContent = formatCur(totalFees);

        const valColor = document.getElementById('spot-pnl-val');
        const pillColor = document.getElementById('spot-roi-pill');
        if(netProfit < 0) { 
            valColor.className = "pnl-value loss"; pillColor.className = "roi-pill loss";
            document.getElementById('spot-pnl-sign').textContent = "-"; document.getElementById('spot-roi-sign').textContent = "-";
        } else { 
            valColor.className = "pnl-value profit"; pillColor.className = "roi-pill profit";
            document.getElementById('spot-pnl-sign').textContent = "+"; document.getElementById('spot-roi-sign').textContent = "+";
        }
    }['spot-inv', 'spot-buy', 'spot-sell', 'spot-fee'].forEach(id => document.getElementById(id)?.addEventListener('input', calcSpot));

    // --- 2. FUTURES CALCULATOR LOGIC ---
    let isLong = true;
    document.getElementById('btn-long')?.addEventListener('click', (e) => { isLong = true; e.target.classList.add('active'); document.getElementById('btn-short').classList.remove('active'); calcFut(); });
    document.getElementById('btn-short')?.addEventListener('click', (e) => { isLong = false; e.target.classList.add('active'); document.getElementById('btn-long').classList.remove('active'); calcFut(); });

    function calcFut() {
        const ent = getVal('fut-entry'), ext = getVal('fut-exit'), lev = getVal('fut-lev'), mar = getVal('fut-margin'), feePct = getVal('fut-fee');
        const empty = document.getElementById('fut-empty'), filled = document.getElementById('fut-filled');

        if(!ent || !ext || !lev || !mar) { empty.classList.remove('hidden'); filled.classList.add('hidden'); return; }
        empty.classList.add('hidden'); filled.classList.remove('hidden');

        const size = mar * lev; 
        const qty = size / ent; 
        const extSize = qty * ext;
        const totalFees = (size * (feePct / 100)) + (extSize * (feePct / 100)); 
        
        let pnl = 0, liq = 0;
        if (isLong) {
            pnl = (extSize - size) - totalFees;
            liq = ent - (ent / lev); 
            document.getElementById('fut-disp-dir').innerHTML = "▲ Long";
            document.getElementById('fut-disp-dir').style.color = "var(--accent)";
        } else {
            pnl = (size - extSize) - totalFees;
            liq = ent + (ent / lev); 
            document.getElementById('fut-disp-dir').innerHTML = "▼ Short";
            document.getElementById('fut-disp-dir').style.color = "var(--accent-loss)";
        }
        const roi = (pnl / mar) * 100;

        document.getElementById('fut-pnl').textContent = formatCur(pnl);
        document.getElementById('fut-roi').textContent = formatCur(roi);
        document.getElementById('fut-size').textContent = formatCur(size);
        document.getElementById('fut-disp-lev').textContent = formatCur(lev);
        document.getElementById('fut-fees-total').textContent = formatCur(totalFees);
        document.getElementById('fut-liq').textContent = liq > 0 ? formatCur(liq) : "0.00";

        const valColor = document.getElementById('fut-pnl-val');
        const pillColor = document.getElementById('fut-roi-pill');
        if(pnl < 0) { 
            valColor.className = "pnl-value loss"; pillColor.className = "roi-pill loss";
            document.getElementById('fut-pnl-sign').textContent = "-"; document.getElementById('fut-roi-sign').textContent = "-";
        } else { 
            valColor.className = "pnl-value profit"; pillColor.className = "roi-pill profit";
            document.getElementById('fut-pnl-sign').textContent = "+"; document.getElementById('fut-roi-sign').textContent = "+";
        }
    }['fut-entry', 'fut-exit', 'fut-lev', 'fut-margin', 'fut-fee'].forEach(id => document.getElementById(id)?.addEventListener('input', calcFut));

    // --- 3. FEES CALCULATOR LOGIC ---
    function calcFees() {
        const size = getVal('fee-size'), pct = getVal('fee-pct');
        const empty = document.getElementById('fee-empty'), filled = document.getElementById('fee-filled');

        if(!size || !pct) { empty.classList.remove('hidden'); filled.classList.add('hidden'); return; }
        empty.classList.add('hidden'); filled.classList.remove('hidden');
        
        const feeCost = size * (pct / 100);
        const amountAfter = size - feeCost;

        document.getElementById('fee-total').textContent = formatCur(feeCost);
        document.getElementById('fee-after').textContent = formatCur(amountAfter);
    }['fee-size', 'fee-pct'].forEach(id => document.getElementById(id)?.addEventListener('input', calcFees));
// 🔥 Crypto Ticker with Color Change

const coins = [
  { id: "bitcoin", symbol: "BTC" },
  { id: "ethereum", symbol: "ETH" },
  { id: "ripple", symbol: "XRP" },
  { id: "binancecoin", symbol: "BNB" },
  { id: "solana", symbol: "SOL" }
];

async function loadTicker() {
  const container = document.getElementById("cryptoPrices");
  if (!container) return;

  try {
    const ids = coins.map(c => c.id).join(",");
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("API error");

    const data = await res.json();

    let items = "";

    coins.forEach(c => {
  const price = data[c.id]?.usd;

  if (price !== undefined) {
    items += `
      <div class="ticker-item">
        <span class="coin">${c.symbol}</span>
        <span class="price">$${price.toLocaleString()}</span>
      </div>
    `;
  }
});
    container.innerHTML = items + items;

  } catch (err) {
    console.error("Ticker error:", err);
  }
}

// Run
loadTicker();
setInterval(loadTicker, 60000);
// ==========================================
    // --- PRO LIVE TICKER & AUTO-UPDATE LOGIC --
    // ==========================================
    async function fetchCryptoPrices() {
        try {
            // Fetch live prices
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,binancecoin,solana&vs_currencies=usd');
            if (!response.ok) throw new Error('API busy');
            const data = await response.json();

            // Format numbers beautifully
            const formatPrice = (price) => {
                if (price < 2) return '$' + price.toFixed(4);
                return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };

            // Create a dictionary of the new prices
            const updates = {
                'price-btc': data.bitcoin.usd,
                'price-eth': data.ethereum.usd,
                'price-xrp': data.ripple.usd,
                'price-bnb': data.binancecoin.usd,
                'price-sol': data.solana.usd
            };

            // This clever loop updates ALL cloned boxes in the infinite scroll instantly!
            for (const [id, price] of Object.entries(updates)) {
                const elements = document.querySelectorAll(`[id="${id}"]`);
                elements.forEach(el => el.textContent = formatPrice(price));
            }

        } catch (error) {
            console.log("CoinGecko API resting. Keeping last known prices on screen.");
            // We DO NOT change the text to "Unavailable" anymore. It just stays as the last price.
        }
    }

    // 1. Run the fetch immediately when the page loads
    fetchCryptoPrices().then(() => {
        // 2. Clone the track for the infinite loop ONLY ONCE after the first load
        const track = document.getElementById('crypto-ticker-track');
        if(track && !track.dataset.cloned) {
            const content = track.innerHTML;
            track.innerHTML = content + content; 
            track.dataset.cloned = "true"; // Marks it so it never clones twice
        }
    });

    // 3. AUTO-UPDATE: Fetch fresh prices entirely in the background every 60 seconds!
    setInterval(fetchCryptoPrices, 60000);
