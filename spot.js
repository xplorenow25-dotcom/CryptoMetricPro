// /js/spot.js
document.addEventListener('DOMContentLoaded', () => {
    const investmentInput = document.getElementById('investment');
    const entryInput = document.getElementById('entry-price');
    const exitInput = document.getElementById('exit-price');
    const spotAmount = document.getElementById('spot-amount');
    const spotResult = document.getElementById('spot-result');
    const spotRoi = document.getElementById('spot-roi');

    function calculateSpot() {
        const investment = parseFloat(investmentInput.value);
        const entry = parseFloat(entryInput.value);
        const exit = parseFloat(exitInput.value);

        if (isNaN(investment) || isNaN(entry) || isNaN(exit) || entry <= 0) {
            spotAmount.textContent = "0.00";
            spotRoi.textContent = "0.00";
            spotResult.classList.remove('profit', 'loss');
            return;
        }

        // Calculation: (Exit / Entry) * Investment = Total Value
        // Profit = Total Value - Investment
        const coinsPurchased = investment / entry;
        const totalValue = coinsPurchased * exit;
        const pnl = totalValue - investment;
        const roi = (pnl / investment) * 100;

        // Display results (value remains same, symbol changes via main.js)
        spotAmount.textContent = Math.abs(pnl).toFixed(2);
        spotRoi.textContent = roi.toFixed(2);

        if (pnl >= 0) {
            spotResult.classList.add('profit');
            spotResult.classList.remove('loss');
            spotAmount.textContent = '+' + spotAmount.textContent;
        } else {
            spotResult.classList.add('loss');
            spotResult.classList.remove('profit');
            spotAmount.textContent = '-' + spotAmount.textContent;
        }
    }

    // Recalculate on any input change
    [investmentInput, entryInput, exitInput].forEach(input => {
        input.addEventListener('input', calculateSpot);
    });

    // Recalculate if currency triggers display update
    document.addEventListener('currencyChanged', calculateSpot);
});
