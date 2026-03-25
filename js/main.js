// Tab Switching Logic
function switchTab(tabName) {
    // Update Capsule Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Update Tab Content
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');

    // Update Title
    const titles = { 'spot': 'Spot Calculator', 'futures': 'Futures Calculator', 'fees': 'Fee Calculator' };
    document.getElementById('calc-title').textContent = titles[tabName];
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- CURRENCY LOGIC ---
    const currencySelect = document.getElementById('currency-selector');
    const symbols = { 'USD': '$', 'EUR': '€', 'GBP': '£' };
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
    
    if(currencySelect) currencySelect.value = savedCurrency;
    updateCurrency(savedCurrency);

    currencySelect.addEventListener('change', (e) => {
        localStorage.setItem('selectedCurrency', e.target.value);
        updateCurrency(e.target.value);
    });

    function updateCurrency(currency) {
        document.querySelectorAll('.currency-symbol').forEach(el => el.textContent = symbols[currency]);
        document.querySelectorAll('.currency-label').forEach(el => el.textContent = currency);
    }

    // --- SPOT CALCULATOR LOGIC ---
    const sInv = document.getElementById('spot-inv');
    const sBuy = document.getElementById('spot-buy');
    const sSell = document.getElementById('spot-sell');
    const sFee = document.getElementById('spot-fee');
    const sProf = document.getElementById('spot-profit');
    const sRoi = document.getElementById('spot-roi');
    const sMain = sProf.parentElement;

    function calcSpot() {
        const inv = parseFloat(sInv.value), buy = parseFloat(sBuy.value), sell = parseFloat(sSell.value), feePct = parseFloat(sFee.value) || 0;
        if (!inv || !buy || !sell) { sProf.textContent = "0.00"; sRoi.textContent = "0.00"; sMain.classList.remove('loss'); return; }

        const coins = inv / buy;
        const buyFee = inv * (feePct / 100);
        const grossValue = coins * sell;
        const sellFee = grossValue * (feePct / 100);
        
        const netProfit = grossValue - inv - buyFee - sellFee;
        const roi = (netProfit / inv) * 100;

        sProf.textContent = Math.abs(netProfit).toFixed(2);
        sRoi.textContent = roi.toFixed(2);
        if(netProfit < 0) { sMain.classList.add('loss'); sProf.textContent = "-" + sProf.textContent; } 
        else { sMain.classList.remove('loss'); sProf.textContent = "+" + sProf.textContent; }
    }
    [sInv, sBuy, sSell, sFee].forEach(inp => inp.addEventListener('input', calcSpot));

    // --- FUTURES LOGIC ---
    const fMar = document.getElementById('fut-margin'), fLev = document.getElementById('fut-lev');
    const fEnt = document.getElementById('fut-entry'), fExt = document.getElementById('fut-exit');
    const fProf = document.getElementById('fut-profit'), fRoi = document.getElementById('fut-roi'), fMain = fProf.parentElement;

    function calcFut() {
        const mar = parseFloat(fMar.value), lev = parseFloat(fLev.value), ent = parseFloat(fEnt.value), ext = parseFloat(fExt.value);
        if(!mar || !lev || !ent || !ext) { fProf.textContent = "0.00"; fRoi.textContent = "0.00"; fMain.classList.remove('loss'); return; }

        const size = mar * lev;
        const qty = size / ent;
        const pnl = qty * (ext - ent); // Assuming Long position for simplicity here
        const roi = (pnl / mar) * 100;

        fProf.textContent = Math.abs(pnl).toFixed(2);
        fRoi.textContent = roi.toFixed(2);
        if(pnl < 0) { fMain.classList.add('loss'); fProf.textContent = "-" + fProf.textContent; }
        else { fMain.classList.remove('loss'); fProf.textContent = "+" + fProf.textContent; }
    }[fMar, fLev, fEnt, fExt].forEach(inp => inp.addEventListener('input', calcFut));

    // --- FEES LOGIC ---
    const feeSize = document.getElementById('fee-size'), feePctVal = document.getElementById('fee-pct');
    const feeTot = document.getElementById('fee-total');

    function calcFees() {
        const size = parseFloat(feeSize.value), pct = parseFloat(feePctVal.value);
        if(!size || !pct) { feeTot.textContent = "0.00"; return; }
        feeTot.textContent = (size * (pct / 100)).toFixed(2);
    }[feeSize, feePctVal].forEach(inp => inp.addEventListener('input', calcFees));
});
