// Core functionality and utilities
// This file contains base functionality needed by other modules

// Global state management
window.StalkerMods = {
  sortState: 0,
  cardsPerRow: 3,
  currentDisplayedMods: [],
  allModCards: [],
  baselineOrder: [],
  
  // Initialize when DOM is ready
  init: function() {
    // Get all mod cards and store references
    this.allModCards = Array.from(document.querySelectorAll('.mod-card'));
    this.currentDisplayedMods = [...this.allModCards];
    this.baselineOrder = [...this.allModCards];
  }
};

// Utility functions
window.StalkerMods.utils = {
  // Shuffle array utility
  shuffleArray: function(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Setup button handlers utility
  setupButtonHandlers: function(buttonIds, handler) {
    buttonIds.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', handler);
    });
  },

  // Apply current sort to an array of mods
  applySortToMods: function(modsArray) {
    const gradesHidden = document.body.classList.contains('hide-grades');
    
    if (gradesHidden) {
      return this.shuffleArray([...modsArray]);
    }
    
    switch(window.StalkerMods.sortState) {
      case 0:
        return [...modsArray].sort((a, b) => {
          const titleA = (a.getAttribute('data-mod-title') || '').toLowerCase();
          const titleB = (b.getAttribute('data-mod-title') || '').toLowerCase();
          return titleA.localeCompare(titleB);
        });
      case 1:
        return [...modsArray].sort((a, b) => {
          const ratingA = parseFloat(a.querySelector('.rating span').textContent);
          const ratingB = parseFloat(b.querySelector('.rating span').textContent);
          return ratingB - ratingA;
        });
      case 2:
        return [...modsArray].sort((a, b) => {
          const ratingA = parseFloat(a.querySelector('.rating span').textContent);
          const ratingB = parseFloat(b.querySelector('.rating span').textContent);
          return ratingA - ratingB;
        });
      default:
        return [...modsArray];
    }
  },

  // Render mods to the container
  renderMods: function(modArray) {
    window.StalkerMods.currentDisplayedMods = modArray;
    const container = document.getElementById('mod-list');
    if (!container) return;
    
    container.innerHTML = '';
    modArray.forEach(card => {
      container.appendChild(card.cloneNode(true));
    });
    
    // Re-initialize components that need it - use safe access
    if (window.StalkerMods.gallery) {
      if (window.StalkerMods.gallery.initializeVideoThumbnails) {
        window.StalkerMods.gallery.initializeVideoThumbnails();
      }
    }
    if (window.StalkerMods.filters) {
      if (window.StalkerMods.filters.updateMustPlayHighlighting) {
        window.StalkerMods.filters.updateMustPlayHighlighting();
      }
    }
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.StalkerMods.init();
});