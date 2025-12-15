// UI Controls and Interface Interactions
// This file handles grid layout controls, toggles, and button states

document.addEventListener('DOMContentLoaded', function() {
  if (!window.StalkerMods) {
    window.StalkerMods = {};
  }
  
  window.StalkerMods.uiControls = {
    init: function() {
      this.setupGridControls();
      this.setupToggleButtons();
      this.setupKeyboardShortcuts();
    },

    setupGridControls: function() {
      const cardsLessBtn = document.getElementById('cards-less');
      const cardsMoreBtn = document.getElementById('cards-more');
      
      if (cardsLessBtn) {
        cardsLessBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.StalkerMods.cardsPerRow === 2) {
            window.StalkerMods.cardsPerRow = 3;
          } else if (window.StalkerMods.cardsPerRow === 3) {
            window.StalkerMods.cardsPerRow = 4;
          } else if (window.StalkerMods.cardsPerRow === 4) {
            window.StalkerMods.cardsPerRow = 'list';
          }
          this.updateGridLayout();
          
          if (window.StalkerMods.filters && !window.StalkerMods.filters.hasActiveFilters()) {
            window.StalkerMods.filters.hideFilterDropdown();
          }
        });
      }

      if (cardsMoreBtn) {
        cardsMoreBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.StalkerMods.cardsPerRow === 'list') {
            window.StalkerMods.cardsPerRow = 4;
          } else if (window.StalkerMods.cardsPerRow === 4) {
            window.StalkerMods.cardsPerRow = 3;
          } else if (window.StalkerMods.cardsPerRow === 3) {
            window.StalkerMods.cardsPerRow = 2;
          }
          this.updateGridLayout();
          
          if (window.StalkerMods.filters && !window.StalkerMods.filters.hasActiveFilters()) {
            window.StalkerMods.filters.hideFilterDropdown();
          }
        });
      }
    },

    updateGridLayout: function() {
      const modList = document.getElementById('mod-list');
      if (modList) {
        if (window.StalkerMods.cardsPerRow === 'list') {
          modList.className = 'cards-list';
        } else {
          modList.className = `grid gap-4 cards-${window.StalkerMods.cardsPerRow}`;
        }
      }
      if (window.StalkerMods.filters && window.StalkerMods.filters.updateMustPlayHighlighting) {
        window.StalkerMods.filters.updateMustPlayHighlighting();
      }
    },

    setupToggleButtons: function() {
      // Toggle grades functionality
      const handleToggleGrades = () => {
        const sortBtn = document.getElementById('sort-button');
        const isHiding = document.body.classList.toggle('hide-grades');
        
        if (isHiding && sortBtn) {
          sortBtn.textContent = 'Randomize';
          window.StalkerMods.sortState = 0; 
        } else if (sortBtn) {
          sortBtn.textContent = 'Sort by Rating';
          window.StalkerMods.sortState = 0;
          // Don't call applyFilters() here to preserve current order
          // Just re-render the current mods to update the display
          if (window.StalkerMods.utils && window.StalkerMods.utils.renderMods) {
            window.StalkerMods.utils.renderMods(window.StalkerMods.currentDisplayedMods);
          }
        }
        this.syncToggleStates();
        
        if (window.StalkerMods.filters && !window.StalkerMods.filters.hasActiveFilters()) {
          window.StalkerMods.filters.hideFilterDropdown();
        }
      };

      if (window.StalkerMods.utils && window.StalkerMods.utils.setupButtonHandlers) {
        window.StalkerMods.utils.setupButtonHandlers(['toggle-grades', 'toggle-grades-mobile'], handleToggleGrades);
      }

      // Toggle videos functionality
      const handleToggleVideos = () => {
        document.body.classList.toggle('hide-videos');
        this.syncToggleStates();
        
        if (window.StalkerMods.filters && !window.StalkerMods.filters.hasActiveFilters()) {
          window.StalkerMods.filters.hideFilterDropdown();
        }
      };

      if (window.StalkerMods.utils && window.StalkerMods.utils.setupButtonHandlers) {
        window.StalkerMods.utils.setupButtonHandlers(['toggle-videos', 'toggle-videos-mobile'], handleToggleVideos);
      }
    },

    syncToggleStates: function() {
      const gradesHidden = document.body.classList.contains('hide-grades');
      const videosHidden = document.body.classList.contains('hide-videos');
      
      ['toggle-grades', 'toggle-grades-mobile'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.toggle('button-active', gradesHidden);
      });
      
      ['toggle-videos', 'toggle-videos-mobile'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.classList.toggle('button-active', videosHidden);
      });
    },

    setupKeyboardShortcuts: function() {
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          // Handle escape key for various UI elements
          const contactOverlay = document.getElementById('contact-overlay');
          const installFilesOverlay = document.getElementById('install-files-overlay');
          
          if (contactOverlay && !contactOverlay.classList.contains('hidden')) {
            contactOverlay.classList.add('hidden');
          }
          if (installFilesOverlay && !installFilesOverlay.classList.contains('hidden')) {
            installFilesOverlay.classList.add('hidden');
          }
          if (window.StalkerMods.filters && window.StalkerMods.filters.isFilterDropdownOpen && !window.StalkerMods.filters.hasActiveFilters()) {
            window.StalkerMods.filters.hideFilterDropdown();
          }
        }
      });
    }
  };

  // Initialize UI controls
  window.StalkerMods.uiControls.init();
});
