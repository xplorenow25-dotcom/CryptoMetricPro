// /js/main.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Currency Display Logic (No Conversion) ---
    const currencySelect = document.getElementById('currency-selector');
    
    // Currency symbol map
    const symbols = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£'
    };

    // Initialize currency from localStorage or default to USD
    const savedCurrency = localStorage.getItem('selectedCurrency') || 'USD';
    if(currencySelect) {
        currencySelect.value = savedCurrency;
    }
    updateCurrencySymbols(savedCurrency);

    // Listen for currency change
    if(currencySelect) {
        currencySelect.addEventListener('change', (e) => {
            const newCurrency = e.target.value;
            localStorage.setItem('selectedCurrency', newCurrency);
            updateCurrencySymbols(newCurrency);
            
            // Trigger a custom event in case calculators need to re-render 
            // their specific formatted outputs immediately.
            document.dispatchEvent(new Event('currencyChanged'));
        });
    }

    function updateCurrencySymbols(currencyCode) {
        const symbol = symbols[currencyCode] || '$';
        const symbolElements = document.querySelectorAll('.currency-symbol');
        symbolElements.forEach(el => {
            el.textContent = symbol;
        });
    }

    // --- 2. Cookie Consent Logic ---
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');

    if (cookieBanner && !localStorage.getItem('cookieConsent')) {
        cookieBanner.classList.remove('hidden');
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.add('hidden');
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookieConsent', 'rejected');
            cookieBanner.classList.add('hidden');
        });
    }

    // --- 3. Mobile Menu Toggle ---
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
});
