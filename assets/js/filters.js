// Search and filtering functionality
// This file handles all filtering, searching, and sorting logic

document.addEventListener('DOMContentLoaded', function() {
  if (!window.StalkerMods) {
    window.StalkerMods = {};
  }
  
  window.StalkerMods.filters = {
    isFilterDropdownOpen: false,
    searchInput: null,
    filterText: null,
    filterTextContent: null,
    filterArrow: null,
    filterDropdown: null,
    filterCheckboxes: null,
    filterRadios: null,
    searchContainer: null,
    controlsContainer: null,
    baselineOrder: [],

    init: function() {
      this.setupFilterElements();
      this.setupSearchInput();
      this.setupSortButton();
      this.bindEventListeners();
      this.baselineOrder = [...window.StalkerMods.allModCards];
    },

    setupFilterElements: function() {
      this.searchInput = document.getElementById('search-input');
      this.filterText = document.getElementById('filter-text');
      this.filterTextContent = document.getElementById('filter-text-content');
      this.filterArrow = document.getElementById('filter-arrow');
      this.filterDropdown = document.getElementById('filter-dropdown');
      this.filterCheckboxes = document.querySelectorAll('.filter-checkbox');
      this.filterRadios = document.querySelectorAll('.filter-radio');
      this.searchContainer = document.getElementById('search-container');
      this.controlsContainer = document.getElementById('controls-container');
    },

    setupSearchInput: function() {
      if (this.searchInput && this.filterDropdown) {
        this.searchInput.addEventListener('focus', () => {
          this.showFilterDropdown();
        });

        this.searchInput.addEventListener('click', () => {
          this.showFilterDropdown();
        });

        this.searchInput.addEventListener('input', () => {
          this.applyFilters();
        });
      }
    },

    setupSortButton: function() {
      const sortButton = document.getElementById('sort-button');
      if (sortButton) {
        sortButton.addEventListener('click', () => {
          const gradesHidden = document.body.classList.contains('hide-grades');
          
          if (gradesHidden) {
            const shuffled = window.StalkerMods.utils.shuffleArray([...window.StalkerMods.currentDisplayedMods]);
            this.baselineOrder = [...shuffled];
            window.StalkerMods.utils.renderMods(shuffled);
          } else {
            window.StalkerMods.sortState = (window.StalkerMods.sortState + 1) % 3;
            
            let toRender;
            switch(window.StalkerMods.sortState) {
              case 0:
                sortButton.textContent = 'Sort by Rating';
                this.baselineOrder = window.StalkerMods.utils.applySortToMods([...window.StalkerMods.allModCards]);
                this.applyFilters();
                return;
              case 1:
                sortButton.textContent = 'Highest First';
                toRender = [...window.StalkerMods.currentDisplayedMods].sort((a, b) => {
                  const ratingA = parseFloat(a.querySelector('.rating span').textContent);
                  const ratingB = parseFloat(b.querySelector('.rating span').textContent);
                  return ratingB - ratingA;
                });
                this.baselineOrder = window.StalkerMods.utils.applySortToMods([...window.StalkerMods.allModCards]);
                break;
              case 2:
                sortButton.textContent = 'Lowest First';
                toRender = [...window.StalkerMods.currentDisplayedMods].sort((a, b) => {
                  const ratingA = parseFloat(a.querySelector('.rating span').textContent);
                  const ratingB = parseFloat(b.querySelector('.rating span').textContent);
                  return ratingA - ratingB;
                });
                this.baselineOrder = window.StalkerMods.utils.applySortToMods([...window.StalkerMods.allModCards]);
                break;
            }
            window.StalkerMods.utils.renderMods(toRender);
          }
          
          if (!this.hasActiveFilters()) {
            this.hideFilterDropdown();
          }
        });
      }
    },

    bindEventListeners: function() {
      // Apply filters when inputs change
      this.filterCheckboxes.forEach(input => {
        input.addEventListener('change', () => {
          this.updateMustPlayHighlighting();
          this.applyFilters();
        });
      });
      
      this.filterRadios.forEach(input => {
        input.addEventListener('change', () => {
          this.updateMustPlayHighlighting();
          this.applyFilters();
        });
      });

      // Filter text click handler
      if (this.filterText && this.filterDropdown) {
        this.filterText.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.isFilterDropdownOpen) {
            this.clearAllFilters();
            this.hideFilterDropdown();
          } else {
            this.showFilterDropdown();
          }
        });
      }

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (this.searchContainer && !this.searchContainer.contains(e.target)) {
          this.hideFilterDropdown();
        }
      });
    },

    showFilterDropdown: function() {
      if (this.filterDropdown && this.controlsContainer) {
        this.filterDropdown.classList.remove('hidden');
        this.controlsContainer.classList.add('filter-dropdown-open');
        this.isFilterDropdownOpen = true;
        this.updateFilterText();
        this.filterDropdown.offsetHeight;
      }
    },

    hideFilterDropdown: function() {
      if (this.filterDropdown && this.controlsContainer) {
        if (!this.hasActiveFilters()) {
          this.filterDropdown.classList.add('hidden');
          this.controlsContainer.classList.remove('filter-dropdown-open');
          this.isFilterDropdownOpen = false;
          this.updateFilterText();
        }
      }
    },

    updateFilterText: function() {
      if (this.filterTextContent && this.filterText) {
        if (this.isFilterDropdownOpen) {
          this.filterTextContent.textContent = 'Clear';
          this.filterText.classList.add('dropdown-open');
        } else {
          this.filterTextContent.textContent = 'Filters';
          this.filterText.classList.remove('dropdown-open');
        }
      }
    },

    hasActiveFilters: function() {
      const searchQuery = this.searchInput ? this.searchInput.value.trim() : '';
      const standaloneCheckbox = document.getElementById('filter-standalone-yes');
      const lowspecCheckbox = document.getElementById('filter-lowspec-yes');
      const mustplayCheckbox = document.getElementById('filter-mustplay-yes');
      const platformCheckboxes = document.querySelectorAll('input[id^="filter-platform-"]:checked');
      
      return searchQuery !== '' || 
             (standaloneCheckbox && standaloneCheckbox.checked) ||
             (lowspecCheckbox && lowspecCheckbox.checked) ||
             (mustplayCheckbox && mustplayCheckbox.checked) ||
             platformCheckboxes.length > 0;
    },

    clearAllFilters: function() {
      if (this.searchInput) {
        this.searchInput.value = '';
      }
      
      const standaloneCheckbox = document.getElementById('filter-standalone-yes');
      if (standaloneCheckbox) standaloneCheckbox.checked = false;
      
      const lowspecCheckbox = document.getElementById('filter-lowspec-yes');
      if (lowspecCheckbox) lowspecCheckbox.checked = false;
      
      const mustplayCheckbox = document.getElementById('filter-mustplay-yes');
      if (mustplayCheckbox) mustplayCheckbox.checked = false;
      
      document.querySelectorAll('input[id^="filter-platform-"]').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      this.updateMustPlayHighlighting();
      this.applyFilters();
    },

    updateMustPlayHighlighting: function() {
      const mustplayCheckbox = document.getElementById('filter-mustplay-yes');
      const modList = document.getElementById('mod-list');
      
      if (mustplayCheckbox && modList) {
        if (mustplayCheckbox.checked) {
          modList.classList.add('highlight-mustplay');
        } else {
          modList.classList.remove('highlight-mustplay');
        }
      }
    },

    preserveOrderFilter: function(modsToFilter) {
      const orderMap = new Map();
      window.StalkerMods.currentDisplayedMods.forEach((mod, index) => {
        const modTitle = mod.getAttribute('data-mod-title');
        orderMap.set(modTitle, index);
      });
      
      return modsToFilter.sort((a, b) => {
        const titleA = a.getAttribute('data-mod-title');
        const titleB = b.getAttribute('data-mod-title');
        const orderA = orderMap.get(titleA) ?? Infinity;
        const orderB = orderMap.get(titleB) ?? Infinity;
        return orderA - orderB;
      });
    },

    applyFilters: function() {
      // Get active filters
      const activeFilters = {
        standalone: false,
        lowspec: false,
        mustplay: false,
        platforms: []
      };

      // Standalone filter
      const standaloneCheckbox = document.getElementById('filter-standalone-yes');
      if (standaloneCheckbox && standaloneCheckbox.checked) {
        activeFilters.standalone = true;
      }

      // Low-spec filter
      const lowspecCheckbox = document.getElementById('filter-lowspec-yes');
      if (lowspecCheckbox && lowspecCheckbox.checked) {
        activeFilters.lowspec = true;
      }

      // Must-play filter (for highlighting only)
      const mustplayCheckbox = document.getElementById('filter-mustplay-yes');
      if (mustplayCheckbox && mustplayCheckbox.checked) {
        activeFilters.mustplay = true;
      }

      // Platform filter
      if (document.getElementById('filter-platform-soc') && document.getElementById('filter-platform-soc').checked) {
        activeFilters.platforms.push('shadow of chernobyl');
      }
      if (document.getElementById('filter-platform-cs') && document.getElementById('filter-platform-cs').checked) {
        activeFilters.platforms.push('clear sky');
      }
      if (document.getElementById('filter-platform-cop') && document.getElementById('filter-platform-cop').checked) {
        activeFilters.platforms.push('call of pripyat');
      }

      // Get search query
      const searchQuery = this.searchInput ? this.searchInput.value.toLowerCase() : '';

      // Filter mods
      const filtered = window.StalkerMods.allModCards.filter(card => {
        // Search filter
        if (searchQuery) {
          const title = card.getAttribute('data-mod-title') || '';
          const description = card.getAttribute('data-mod-description') || '';
          const platform = card.getAttribute('data-mod-platform') || '';
          
          if (!title.includes(searchQuery) && !description.includes(searchQuery) && !platform.includes(searchQuery)) {
            return false;
          }
        }

        // Standalone filter
        if (activeFilters.standalone) {
          const cardStandalone = card.getAttribute('data-mod-standalone') === 'true';
          if (!cardStandalone) {
            return false;
          }
        }

        // Low-spec filter
        if (activeFilters.lowspec) {
          const cardLowspec = card.getAttribute('data-mod-lowspec') === 'true';
          if (!cardLowspec) {
            return false;
          }
        }

        // Platform filter
        if (activeFilters.platforms.length > 0) {
          const cardPlatform = (card.getAttribute('data-mod-platform') || '').toLowerCase();
          if (!activeFilters.platforms.includes(cardPlatform)) {
            return false;
          }
        }

        return true;
      });

      // Apply sort order
      const gradesHidden = document.body.classList.contains('hide-grades');
      let finalModOrder;
      
      if (gradesHidden) {
        finalModOrder = this.preserveOrderFilter(filtered);
      } else {
        finalModOrder = window.StalkerMods.utils.applySortToMods(filtered);
      }
      
      window.StalkerMods.utils.renderMods(finalModOrder);
    }
  };

  // Initialize filters
  window.StalkerMods.filters.init();
});
