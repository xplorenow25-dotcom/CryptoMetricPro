// /js/fees.js
document.addEventListener('DOMContentLoaded', () => {
    const tradeSizeInput = document.getElementById('trade-size');
    const feePctInput = document.getElementById('fee-pct');
    const feeAmount = document.getElementById('fee-amount');

    function calculateFees() {
        const tradeSize = parseFloat(tradeSizeInput.value);
        const feePct = parseFloat(feePctInput.value);

        if (isNaN(tradeSize) || isNaN(feePct)) {
            feeAmount.textContent = "0.00";
            return;
        }

        const totalFee = tradeSize * (feePct / 100);
        feeAmount.textContent = totalFee.toFixed(2);
    }[tradeSizeInput, feePctInput].forEach(input => {
        input.addEventListener('input', calculateFees);
    });

    document.addEventListener('currencyChanged', calculateFees);
});
