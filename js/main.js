// ==========================================
// 1. GLOBAL UI: TABS & MENU
// ==========================================
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');

    const titles = { 'spot': 'Spot Calculator', 'futures': 'Futures Calculator', 'fees': 'Fee Calculator' };
    if(document.getElementById('calc-title')) document.getElementById('calc-title').textContent = titles[tabName];
}

function closeMenu() {
    document.getElementById('side-drawer')?.classList.remove('active');
    document.getElementById('menu-overlay')?.classList.remove('active');
}

document.addEventListener('DOMContentLoaded', () => {
    
    // Mobile Menu Toggle
    const menuBtn = document.getElementById('menu-toggle');
    const sideDrawer = document.getElementById('side-drawer');
    const overlay = document.getElementById('menu-overlay');
    const closeBtn = document.getElementById('menu-close');
    
    if (menuBtn && sideDrawer && overlay) {
        menuBtn.addEventListener('click', () => {
            sideDrawer.classList.add('active');
            overlay.classList.add('active');
        });
        closeBtn?.addEventListener('click', closeMenu);
        overlay.addEventListener('click', closeMenu);
    }

    // ==========================================
    // 2. COOKIES & CURRENCY
    // ==========================================
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner && !localStorage.getItem('cookieConsent')) {
        setTimeout(() => cookieBanner.classList.add('show'), 1500); 
    }
    document.getElementById('accept-cookies')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.classList.remove('show'); 
        setTimeout(() => cookieBanner.style.display = 'none', 600);
    });
    document.getElementById('reject-cookies')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected');
        cookieBanner.classList.remove('show'); 
        setTimeout(() => cookieBanner.style.display = 'none', 600);
    });

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

    // ==========================================
    // 3. LIVE COINGECKO TICKER (Auto-Scrolling)
    // ==========================================
    async function fetchCryptoPrices() {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,binancecoin,solana&vs_currencies=usd');
            if (!response.ok) throw new Error('API busy');
            const data = await response.json();

            const formatPrice = (price) => {
                if (price < 2) return '$' + price.toFixed(4);
                return '$' + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            };

            const updates = {
                'price-btc': data.bitcoin.usd, 'price-eth': data.ethereum.usd,
                'price-xrp': data.ripple.usd, 'price-bnb': data.binancecoin.usd,
                'price-sol': data.solana.usd
            };

            for (const [id, price] of Object.entries(updates)) {
                document.querySelectorAll(`[id="${id}"]`).forEach(el => el.textContent = formatPrice(price));
            }
        } catch (error) {
            console.log("CoinGecko API resting. Keeping last known prices.");
        }
    }

    fetchCryptoPrices().then(() => {
        const track = document.getElementById('crypto-ticker-track');
        if(track && !track.dataset.cloned) {
            const content = track.innerHTML;
            track.innerHTML = content + content; // Duplicates track for infinite scroll
            track.dataset.cloned = "true"; 
        }
    });
    setInterval(fetchCryptoPrices, 60000); // Auto-updates every 60 seconds

    // ==========================================
    // 4. PREMIUM CALCULATORS (Empty/Filled States)
    // ==========================================
    const getVal = id => parseFloat(document.getElementById(id)?.value) || 0;
    const formatCur = num => '$' + Math.abs(num).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const formatNum = num => Math.abs(num).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    // --- SPOT ---
    function calcSpot() {
        const inv = getVal('spot-inv'), buy = getVal('spot-buy'), sell = getVal('spot-sell'), feePct = getVal('spot-fee');
        const empty = document.getElementById('spot-empty'), filled = document.getElementById('spot-filled');
        if (!empty || !filled) return;

        if (!inv || !buy || !sell) { empty.style.display = 'block'; filled.style.display = 'none'; return; }
        empty.style.display = 'none'; filled.style.display = 'block';

        const coins = inv / buy;
        const grossVal = coins * sell;
        const totalFees = (inv * (feePct / 100)) + (grossVal * (feePct / 100));
        const netProfit = grossVal - inv - totalFees;
        const roi = (netProfit / inv) * 100;

        const pnlEl = document.getElementById('spot-profit');
        pnlEl.textContent = (netProfit >= 0 ? '+' : '-') + formatCur(netProfit);
        pnlEl.className = 'pnl-value ' + (netProfit >= 0 ? 'color-profit' : 'color-loss');
        
        const roiEl = document.getElementById('spot-roi-pill');
        roiEl.textContent = `● ${(netProfit >= 0 ? '+' : '')}${roi.toFixed(2)}% ROI`;
        roiEl.className = 'roi-pill ' + (netProfit >= 0 ? 'roi-green' : 'roi-red');

        document.getElementById('spot-inv-disp').textContent = formatCur(inv);
        document.getElementById('spot-buy-disp').textContent = formatCur(buy);
        document.getElementById('spot-sell-disp').textContent = formatCur(sell);
        document.getElementById('spot-fees-disp').textContent = '-' + formatCur(totalFees);
    }['spot-inv', 'spot-buy', 'spot-sell', 'spot-fee'].forEach(id => document.getElementById(id)?.addEventListener('input', calcSpot));

    // --- FUTURES ---
    function calcFut() {
        const isLong = document.getElementById('pos-long')?.checked;
        const mar = getVal('fut-margin'), lev = getVal('fut-lev'), ent = getVal('fut-entry'), ext = getVal('fut-exit'), feePct = getVal('fut-fee');
        const empty = document.getElementById('fut-empty'), filled = document.getElementById('fut-filled');
        if (!empty || !filled) return;

        if(!mar || !lev || !ent || !ext) { empty.style.display = 'block'; filled.style.display = 'none'; return; }
        empty.style.display = 'none'; filled.style.display = 'block';

        const size = mar * lev; 
        const qty = size / ent; 
        const feeCost = size * (feePct / 100) * 2; 
        
        let pnl = 0, liq = 0;
        if (isLong) { pnl = (qty * (ext - ent)) - feeCost; liq = ent - (ent / lev); } 
        else { pnl = (qty * (ent - ext)) - feeCost; liq = ent + (ent / lev); }
        
        const pnlEl = document.getElementById('fut-profit');
        pnlEl.textContent = (pnl >= 0 ? '+' : '-') + formatCur(pnl);
        pnlEl.className = 'pnl-value ' + (pnl >= 0 ? 'color-profit' : 'color-loss');
        
        const roiEl = document.getElementById('fut-roi-pill');
        roiEl.textContent = `● ${(pnl >= 0 ? '+' : '')}${(pnl / mar * 100).toFixed(2)}% ROI on Margin`;
        roiEl.className = 'roi-pill ' + (pnl >= 0 ? 'roi-green' : 'roi-red');

        document.getElementById('fut-size-disp').textContent = formatCur(size);
        document.getElementById('fut-lev-disp').textContent = formatNum(lev) + '×';
        
        const dirEl = document.getElementById('fut-dir-disp');
        dirEl.textContent = isLong ? '▲ Long' : '▼ Short';
        dirEl.className = isLong ? 'color-profit' : 'color-loss';

        document.getElementById('fut-fees-disp').textContent = '-' + formatCur(feeCost);
        document.getElementById('fut-liq-disp').textContent = liq > 0 ? formatCur(liq) : "0.00";
    }['fut-margin', 'fut-lev', 'fut-entry', 'fut-exit', 'fut-fee', 'pos-long', 'pos-short'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calcFut);
        document.getElementById(id)?.addEventListener('change', calcFut);
    });

    // --- FEES ---
    function calcFees() {
        const size = getVal('fee-size'), pct = getVal('fee-pct');
        const empty = document.getElementById('fee-empty'), filled = document.getElementById('fee-filled');
        if (!empty || !filled) return;

        if(!size || !pct) { empty.style.display = 'block'; filled.style.display = 'none'; return; }
        empty.style.display = 'none'; filled.style.display = 'block';
        
        const feeCost = size * (pct / 100);
        document.getElementById('fee-total').textContent = '-' + formatCur(feeCost);
        document.getElementById('fee-orig-disp').textContent = formatCur(size);
        document.getElementById('fee-after-disp').textContent = formatCur(size - feeCost);
    }['fee-size', 'fee-pct'].forEach(id => document.getElementById(id)?.addEventListener('input', calcFees));
});
