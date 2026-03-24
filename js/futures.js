// /js/futures.js
document.addEventListener('DOMContentLoaded', () => {
    const radios = document.querySelectorAll('input[name="position"]');
    const marginInput = document.getElementById('margin');
    const leverageInput = document.getElementById('leverage');
    const entryInput = document.getElementById('fut-entry');
    const exitInput = document.getElementById('fut-exit');
    
    const futAmount = document.getElementById('fut-amount');
    const futResult = document.getElementById('fut-result');
    const futRoi = document.getElementById('fut-roi');

    function calculateFutures() {
        const position = document.querySelector('input[name="position"]:checked').value;
        const margin = parseFloat(marginInput.value);
        const leverage = parseFloat(leverageInput.value);
        const entry = parseFloat(entryInput.value);
        const exit = parseFloat(exitInput.value);

        if (isNaN(margin) || isNaN(leverage) || isNaN(entry) || isNaN(exit) || entry <= 0) {
            futAmount.textContent = "0.00";
            futRoi.textContent = "0.00";
            futResult.classList.remove('profit', 'loss');
            return;
        }

        const positionSize = margin * leverage;
        const contractQuantity = positionSize / entry;
        
        let pnl = 0;
        if (position === 'long') {
            pnl = contractQuantity * (exit - entry);
        } else {
            pnl = contractQuantity * (entry - exit);
        }

        const roi = (pnl / margin) * 100;

        futAmount.textContent = Math.abs(pnl).toFixed(2);
        futRoi.textContent = roi.toFixed(2);

        if (pnl >= 0) {
            futResult.classList.add('profit');
            futResult.classList.remove('loss');
            futAmount.textContent = '+' + futAmount.textContent;
        } else {
            futResult.classList.add('loss');
            futResult.classList.remove('profit');
            futAmount.textContent = '-' + futAmount.textContent;
        }
    }[marginInput, leverageInput, entryInput, exitInput].forEach(input => {
        input.addEventListener('input', calculateFutures);
    });
    
    radios.forEach(radio => {
        radio.addEventListener('change', calculateFutures);
    });

    document.addEventListener('currencyChanged', calculateFutures);
});
