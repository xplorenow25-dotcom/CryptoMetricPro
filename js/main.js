// --- TAB SWITCHING LOGIC ---
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- MOBILE MENU TOGGLE ---
    const menuBtn = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            menuBtn.textContent = mobileMenu.classList.contains('active') ? '✕' : '☰';
        });
    }

    // --- COOKIE CONSENT LOGIC ---
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner && !localStorage.getItem('cookieConsent')) {
        cookieBanner.classList.remove('hidden');
    }
    document.getElementById('accept-cookies')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieBanner.classList.add('hidden');
    });
    document.getElementById('reject-cookies')?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'rejected');
        cookieBanner.classList.add('hidden');
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

        const size = mar * lev; // Total position size
        const qty = size / ent; // Number of coins
        const feeCost = size * (feePct / 100) * 2; // Approx fee for opening AND closing full size
        
        let pnl = 0, liq = 0;
        if (isLong) {
            pnl = (qty * (ext - ent)) - feeCost;
            liq = ent - (ent / lev); // Basic long liquidation formula
        } else {
            pnl = (qty * (ent - ext)) - feeCost;
            liq = ent + (ent / lev); // Basic short liquidation formula
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
