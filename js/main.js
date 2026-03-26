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

    // Utility Function to get Input Values safely
    const getVal = id => parseFloat(document.getElementById(id).value) || 0;
    const format = num => Math.abs(num).toFixed(2);

    // --- 1. SPOT CALCULATOR LOGIC ---
    function calcSpot() {
        const inv = getVal('spot-inv'), buy = getVal('spot-buy'), sell = getVal('spot-sell'), feePct = getVal('spot-fee');
        const sProf = document.getElementById('spot-profit'), sMain = sProf.parentElement;

        if (!inv || !buy || !sell) { 
            sProf.textContent = "0.00"; document.getElementById('spot-roi').textContent = "0.00%"; document.getElementById('spot-total-fees').textContent = "0.00"; sMain.classList.remove('loss'); return; 
        }

        const coins = inv / buy;
        const grossVal = coins * sell;
        const buyFee = inv * (feePct / 100);
        const sellFee = grossVal * (feePct / 100);
        const totalFees = buyFee + sellFee;
        
        const netProfit = grossVal - inv - totalFees;
        const roi = (netProfit / inv) * 100;

        sProf.textContent = format(netProfit);
        document.getElementById('spot-roi').textContent = roi.toFixed(2) + "%";
        document.getElementById('spot-total-fees').textContent = format(totalFees);

        if(netProfit < 0) { sMain.classList.add('loss'); sProf.textContent = "-" + sProf.textContent; } 
        else { sMain.classList.remove('loss'); sProf.textContent = "+" + sProf.textContent; }
    }['spot-inv', 'spot-buy', 'spot-sell', 'spot-fee'].forEach(id => document.getElementById(id)?.addEventListener('input', calcSpot));

    // --- 2. FUTURES CALCULATOR LOGIC ---
    function calcFut() {
        const isLong = document.getElementById('pos-long').checked;
        const mar = getVal('fut-margin'), lev = getVal('fut-lev'), ent = getVal('fut-entry'), ext = getVal('fut-exit'), feePct = getVal('fut-fee');
        const fProf = document.getElementById('fut-profit'), fMain = fProf.parentElement;

        if(!mar || !lev || !ent || !ext) { 
            fProf.textContent = "0.00"; document.getElementById('fut-roi').textContent = "0.00%"; 
            document.getElementById('fut-size').textContent = "0.00"; document.getElementById('fut-liq').textContent = "0.00";
            fMain.classList.remove('loss'); return; 
        }

        const size = mar * lev; 
        const qty = size / ent; 
        const feeCost = size * (feePct / 100) * 2; 
        
        let pnl = 0, liq = 0;
        if (isLong) {
            pnl = (qty * (ext - ent)) - feeCost;
            liq = ent - (ent / lev); 
        } else {
            pnl = (qty * (ent - ext)) - feeCost;
            liq = ent + (ent / lev); 
        }
        
        const roi = (pnl / mar) * 100;

        fProf.textContent = format(pnl);
        document.getElementById('fut-roi').textContent = roi.toFixed(2) + "%";
        document.getElementById('fut-size').textContent = format(size);
        document.getElementById('fut-liq').textContent = liq > 0 ? format(liq) : "0.00";

        if(pnl < 0) { fMain.classList.add('loss'); fProf.textContent = "-" + fProf.textContent; }
        else { fMain.classList.remove('loss'); fProf.textContent = "+" + fProf.textContent; }
    }['fut-margin', 'fut-lev', 'fut-entry', 'fut-exit', 'fut-fee', 'pos-long', 'pos-short'].forEach(id => {
        document.getElementById(id)?.addEventListener('input', calcFut);
        if(id === 'pos-long' || id === 'pos-short') document.getElementById(id)?.addEventListener('change', calcFut);
    });

    // --- 3. FEES CALCULATOR LOGIC ---
    function calcFees() {
        const size = getVal('fee-size'), pct = getVal('fee-pct');
        if(!size || !pct) { document.getElementById('fee-total').textContent = "0.00"; document.getElementById('fee-after').textContent = "0.00"; return; }
        
        const feeCost = size * (pct / 100);
        const amountAfter = size - feeCost;

        document.getElementById('fee-total').textContent = format(feeCost);
        document.getElementById('fee-after').textContent = format(amountAfter);
    }['fee-size', 'fee-pct'].forEach(id => document.getElementById(id)?.addEventListener('input', calcFees));
});
// DO NOT clear the HTML first!
async function getLivePrices() {
    // 1. Fetch the data quietly in the background first
    const response = await fetch('YOUR_COINGECKO_API_URL');
    const data = await response.json();

    // 2. Build your new HTML cards
    let newCardsHTML = `<div class="price-card">...</div>`;

    // 3. Swap the HTML instantly! (No blinking!)
    document.querySelector('.price-row').innerHTML = newCardsHTML;
}

// Update every 10 seconds
setInterval(getLivePrices, 10000);
