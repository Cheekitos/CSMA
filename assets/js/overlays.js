// Modal and popup management
// This file handles all overlay popups, modals, and their interactions

document.addEventListener('DOMContentLoaded', function() {
  if (!window.StalkerMods) {
    window.StalkerMods = {};
  }
  
  window.StalkerMods.overlays = {
    init: function() {
      this.setupContactOverlay();
      this.setupInstallFilesOverlay();
      this.setupTabSwitching();
      this.setupEssentialsTabSwitching();
    },

    setupContactOverlay: function() {
      const showContactOverlay = () => {
        const contactOverlay = document.getElementById('contact-overlay');
        if (contactOverlay) contactOverlay.classList.remove('hidden');
        
        // Reset to About tab when opening
        this.resetToAboutTab();
        
        if (window.StalkerMods.filters && !window.StalkerMods.filters.hasActiveFilters()) {
          window.StalkerMods.filters.hideFilterDropdown();
        }
      };

      // Try using utils setupButtonHandlers if available, otherwise set up manually
      if (window.StalkerMods.utils && window.StalkerMods.utils.setupButtonHandlers) {
        window.StalkerMods.utils.setupButtonHandlers(['contact-button', 'contact-button-mobile'], showContactOverlay);
      } else {
        // Fallback for pages without utils (like stalker-map)
        const contactBtn = document.getElementById('contact-button');
        const contactBtnMobile = document.getElementById('contact-button-mobile');
        if (contactBtn) contactBtn.addEventListener('click', showContactOverlay);
        if (contactBtnMobile) contactBtnMobile.addEventListener('click', showContactOverlay);
      }

      const contactClose = document.getElementById('contact-close');
      const contactOverlay = document.getElementById('contact-overlay');
      const revealEmail = document.getElementById('reveal-email');
      const emailText = document.getElementById('email-text');

      if (contactClose) {
        contactClose.addEventListener('click', () => {
          if (contactOverlay) contactOverlay.classList.add('hidden');
        });
      }
      
      if (contactOverlay) {
        contactOverlay.addEventListener('click', e => {
          if (e.target === contactOverlay) contactOverlay.classList.add('hidden');
        });
      }
      
      if (revealEmail && emailText) {
        revealEmail.addEventListener('click', () => {
          // This keeps the original toggle behavior (show/hide)
          emailText.classList.toggle('hidden');
        });
      }
    },

    setupInstallFilesOverlay: function() {
      const showInstallFilesOverlay = () => {
        const installFilesOverlay = document.getElementById('install-files-overlay');
        if (installFilesOverlay) installFilesOverlay.classList.remove('hidden');
        
        // Reset to Essential Files tab when opening
        this.resetToEssentialsTab();
        
        if (window.StalkerMods.filters && !window.StalkerMods.filters.hasActiveFilters()) {
          window.StalkerMods.filters.hideFilterDropdown();
        }
      };

      // Try using utils setupButtonHandlers if available, otherwise set up manually
      if (window.StalkerMods.utils && window.StalkerMods.utils.setupButtonHandlers) {
        window.StalkerMods.utils.setupButtonHandlers(['essentials-button', 'essentials-button-mobile'], showInstallFilesOverlay);
      } else {
        // Fallback for pages without utils (like stalker-map)
        const essentialsBtn = document.getElementById('essentials-button');
        const essentialsBtnMobile = document.getElementById('essentials-button-mobile');
        if (essentialsBtn) essentialsBtn.addEventListener('click', showInstallFilesOverlay);
        if (essentialsBtnMobile) essentialsBtnMobile.addEventListener('click', showInstallFilesOverlay);
      }

      const installFilesOverlay = document.getElementById('install-files-overlay');
      const installFilesClose = document.getElementById('install-files-close');

      if (installFilesClose) {
        installFilesClose.addEventListener('click', () => {
          if (installFilesOverlay) installFilesOverlay.classList.add('hidden');
        });
      }

      if (installFilesOverlay) {
        installFilesOverlay.addEventListener('click', (e) => {
          if (e.target === installFilesOverlay) {
            installFilesOverlay.classList.add('hidden');
          }
        });
      }
    },

    setupTabSwitching: function() {
      const aboutTab = document.getElementById('about-tab');
      const faqTab = document.getElementById('faq-tab');
      const aboutContent = document.getElementById('about-content');
      const faqContent = document.getElementById('faq-content');

      if (aboutTab && faqTab && aboutContent && faqContent) {
        aboutTab.addEventListener('click', () => {
          // Switch to About tab
          aboutTab.classList.add('text-white', 'border-yellow-400');
          aboutTab.classList.remove('text-gray-400', 'border-transparent');
          faqTab.classList.add('text-gray-400', 'border-transparent');
          faqTab.classList.remove('text-white', 'border-yellow-400');
          
          // Show About content, hide FAQ content
          aboutContent.classList.remove('hidden');
          faqContent.classList.add('hidden');
        });

        faqTab.addEventListener('click', () => {
          // Switch to FAQ tab
          faqTab.classList.add('text-white', 'border-yellow-400');
          faqTab.classList.remove('text-gray-400', 'border-transparent');
          aboutTab.classList.add('text-gray-400', 'border-transparent');
          aboutTab.classList.remove('text-white', 'border-yellow-400');
          
          // Show FAQ content, hide About content
          faqContent.classList.remove('hidden');
          aboutContent.classList.add('hidden');
        });
      }
    },

    setupEssentialsTabSwitching: function() {
      const essentialsTab = document.getElementById('essentials-tab');
      const resourcesTab = document.getElementById('resources-tab');
      const essentialsContent = document.getElementById('essentials-content');
      const resourcesContent = document.getElementById('resources-content');

      if (essentialsTab && resourcesTab && essentialsContent && resourcesContent) {
        essentialsTab.addEventListener('click', () => {
          // Switch to Essential Files tab
          essentialsTab.classList.add('text-white', 'border-yellow-400');
          essentialsTab.classList.remove('text-gray-400', 'border-transparent');
          resourcesTab.classList.add('text-gray-400', 'border-transparent');
          resourcesTab.classList.remove('text-white', 'border-yellow-400');
          
          // Show Essential Files content, hide Resources content
          essentialsContent.classList.remove('hidden');
          resourcesContent.classList.add('hidden');
        });

        resourcesTab.addEventListener('click', () => {
          // Switch to Resources tab
          resourcesTab.classList.add('text-white', 'border-yellow-400');
          resourcesTab.classList.remove('text-gray-400', 'border-transparent');
          essentialsTab.classList.add('text-gray-400', 'border-transparent');
          essentialsTab.classList.remove('text-white', 'border-yellow-400');
          
          // Show Resources content, hide Essential Files content
          resourcesContent.classList.remove('hidden');
          essentialsContent.classList.add('hidden');
        });
      }
    },

    resetToAboutTab: function() {
      const aboutTab = document.getElementById('about-tab');
      const faqTab = document.getElementById('faq-tab');
      const aboutContent = document.getElementById('about-content');
      const faqContent = document.getElementById('faq-content');
      
      if (aboutTab && faqTab && aboutContent && faqContent) {
        aboutTab.classList.add('text-white', 'border-yellow-400');
        aboutTab.classList.remove('text-gray-400', 'border-transparent');
        faqTab.classList.add('text-gray-400', 'border-transparent');
        faqTab.classList.remove('text-white', 'border-yellow-400');
        
        aboutContent.classList.remove('hidden');
        faqContent.classList.add('hidden');
      }
    },

    resetToEssentialsTab: function() {
      const essentialsTab = document.getElementById('essentials-tab');
      const resourcesTab = document.getElementById('resources-tab');
      const essentialsContent = document.getElementById('essentials-content');
      const resourcesContent = document.getElementById('resources-content');
      
      if (essentialsTab && resourcesTab && essentialsContent && resourcesContent) {
        essentialsTab.classList.add('text-white', 'border-yellow-400');
        essentialsTab.classList.remove('text-gray-400', 'border-transparent');
        resourcesTab.classList.add('text-gray-400', 'border-transparent');
        resourcesTab.classList.remove('text-white', 'border-yellow-400');
        
        essentialsContent.classList.remove('hidden');
        resourcesContent.classList.add('hidden');
      }
    }
  };

  // Initialize overlays
  window.StalkerMods.overlays.init();
});
