// Analytics and Cookie Consent Management
// This file handles all tracking and privacy compliance

(function() {
  const cookieConsent = document.getElementById('cookie-consent');
  const acceptBtn = document.getElementById('cookie-accept');
  const declineBtn = document.getElementById('cookie-decline');
  
  // Check if user has already made a choice
  const consentStatus = localStorage.getItem('cookie-consent');
  
  if (!consentStatus) {
    // Show consent popup after a short delay
    setTimeout(() => {
      if (cookieConsent) {
        cookieConsent.classList.remove('hidden');
      }
    }, 1000);
  } else if (consentStatus === 'accepted') {
    // Load analytics if previously accepted
    loadFullresAnalytics();
  }
  
  // Handle accept button
  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookie-consent', 'accepted');
      hideCookieConsent();
      loadFullresAnalytics();
    });
  }
  
  // Handle decline button
  if (declineBtn) {
    declineBtn.addEventListener('click', () => {
      localStorage.setItem('cookie-consent', 'declined');
      hideCookieConsent();
    });
  }
  
  function hideCookieConsent() {
    if (cookieConsent) {
      cookieConsent.style.transform = 'translateY(100%)';
      setTimeout(() => {
        cookieConsent.classList.add('hidden');
      }, 300);
    }
  }
  
  function loadFullresAnalytics() {
    // Only load if not already loaded
    if (!window.fullresLoaded) {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://t.fullres.net/cheeki.js?' + (new Date() - new Date() % 43200000);
      document.head.appendChild(script);
      window.fullresLoaded = true;
    }
  }
})();