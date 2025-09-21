// Main JavaScript for S.T.A.L.K.E.R. Mods Archive

// Cookie Consent Management
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

document.addEventListener('DOMContentLoaded', function() {
  let sortState = 0;
  let cardsPerRow = 3;
  let currentDisplayedMods = [];
  
  // Get all mod cards
  const allModCards = Array.from(document.querySelectorAll('.mod-card'));
  currentDisplayedMods = [...allModCards];

  // Image Gallery functionality
  let currentImageIndex = 0;
  let galleryImages = [];

  function initializeImageGallery() {
    const galleryThumbnails = document.querySelectorAll('.gallery-thumbnail');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const closeBtn = document.getElementById('lightbox-close');

    if (!lightbox || !lightboxImg) return;

    // Enhanced image fallback handling
    function setupImageFallbacks() {
      galleryThumbnails.forEach(thumbnail => {
        const img = thumbnail.querySelector('img');
        if (img) {
          // Set up error handling for images that already have fallback
          if (img.hasAttribute('data-fallback')) {
            // Remove any existing error handler to avoid duplicates
            img.removeEventListener('error', handleImageError);
            img.addEventListener('error', handleImageError);
          }
          
          // Check if image is already broken (failed to load before JS ran)
          if (img.complete && img.naturalHeight === 0 && img.hasAttribute('data-fallback')) {
            img.src = img.getAttribute('data-fallback');
            img.removeAttribute('data-fallback');
          }
        }
      });
    }

    // Error handler function
    function handleImageError(event) {
      const img = event.target;
      const fallback = img.getAttribute('data-fallback');
      
      if (fallback && img.src !== fallback) {
        img.src = fallback;
        img.removeAttribute('data-fallback');
      }
    }

    // Initialize image fallbacks
    setupImageFallbacks();

    // Collect all gallery images
    const pageGalleryData = document.querySelector('[data-gallery-images]');
    if (pageGalleryData) {
      const allImages = JSON.parse(pageGalleryData.getAttribute('data-gallery-images'));
      const baseUrl = pageGalleryData.getAttribute('data-base-url');
      galleryImages = allImages.slice(0, 10).map((image, index) => ({
        src: baseUrl + image,
        alt: `Gallery image ${index + 1}`
      }));
    } else {
      galleryImages = Array.from(galleryThumbnails).map(thumb => ({
        src: thumb.getAttribute('data-full-src'),
        alt: thumb.querySelector('img').alt
      }));
    }

    // Add click event to thumbnails
    galleryThumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        currentImageIndex = index;
        openLightbox();
      });
    });

    function openLightbox() {
      if (galleryImages.length === 0) return;
      
      lightbox.classList.add('active');
      updateLightboxImage();
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function updateLightboxImage() {
      if (galleryImages.length === 0) return;
      
      const currentImage = galleryImages[currentImageIndex];
      lightboxImg.src = currentImage.src;
      lightboxImg.alt = currentImage.alt;
      
      if (lightboxCounter) {
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
      }
    }

    function nextImage() {
      currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
      updateLightboxImage();
    }

    function prevImage() {
      currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
      updateLightboxImage();
    }

    // Event listeners for lightbox controls
    if (closeBtn) {
      closeBtn.addEventListener('click', closeLightbox);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', nextImage);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', prevImage);
    }

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;

      switch(e.key) {
        case 'Escape':
          closeLightbox();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
      }
    });
  }

  // Initialize image gallery if on mod page
  initializeImageGallery();

  // Consolidated button handler setup
  function setupButtonHandlers(buttonIds, handler) {
    buttonIds.forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.addEventListener('click', handler);
    });
  }

  function updateGridLayout() {
    const modList = document.getElementById('mod-list');
    if (modList) {
      if (cardsPerRow === 'list') {
        modList.className = 'cards-list';
      } else {
        modList.className = `grid gap-4 cards-${cardsPerRow}`;
      }
    }
    updateMustPlayHighlighting();
  }

  // Video thumbnail click handler
  function setupVideoThumbnails() {
    document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
      thumbnail.addEventListener('click', function() {
        const videoId = this.getAttribute('data-video-id');
        const videoUrl = this.getAttribute('data-video-url');
        
        if (videoId) {
          const iframe = document.createElement('iframe');
          iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
          iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
          iframe.allowFullscreen = true;
          iframe.className = 'w-full aspect-video rounded';

          const container = this.closest('.video-container');
          if (container) {
            container.innerHTML = '';
            container.appendChild(iframe);
            container.classList.add('video-loaded');
          }
        }
      });
    });
  }

  function initializeVideoThumbnails() {
    document.querySelectorAll('.video-thumbnail img').forEach(img => {
      img.onload = function() {
        // Image loaded successfully
      };
      
      if (img.complete) {
        img.onload();
      }
    });
    
    setupVideoThumbnails();
  }

  // Initialize video thumbnails
  initializeVideoThumbnails();

  // Filter functionality
  const searchInput = document.getElementById('search-input');
  const filterText = document.getElementById('filter-text');
  const filterTextContent = document.getElementById('filter-text-content');
  const filterArrow = document.getElementById('filter-arrow');
  const filterDropdown = document.getElementById('filter-dropdown');
  const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
  const filterRadios = document.querySelectorAll('.filter-radio');
  const searchContainer = document.getElementById('search-container');
  const controlsContainer = document.getElementById('controls-container');

  let isFilterDropdownOpen = false;

  // Check if any filters are active
  function hasActiveFilters() {
    const searchQuery = searchInput ? searchInput.value.trim() : '';
    const standaloneCheckbox = document.getElementById('filter-standalone-yes');
    const lowspecCheckbox = document.getElementById('filter-lowspec-yes');
    const mustplayCheckbox = document.getElementById('filter-mustplay-yes');
    const platformCheckboxes = document.querySelectorAll('input[id^="filter-platform-"]:checked');
    
    return searchQuery !== '' || 
           (standaloneCheckbox && standaloneCheckbox.checked) ||
           (lowspecCheckbox && lowspecCheckbox.checked) ||
           (mustplayCheckbox && mustplayCheckbox.checked) ||
           platformCheckboxes.length > 0;
  }

  // Update must play highlighting based on filter state
  function updateMustPlayHighlighting() {
    const mustplayCheckbox = document.getElementById('filter-mustplay-yes');
    const modList = document.getElementById('mod-list');
    
    if (mustplayCheckbox && modList) {
      if (mustplayCheckbox.checked) {
        modList.classList.add('highlight-mustplay');
      } else {
        modList.classList.remove('highlight-mustplay');
      }
    }
  }

  // Update filter text based on dropdown state
  function updateFilterText() {
    if (filterTextContent && filterText) {
      if (isFilterDropdownOpen) {
        filterTextContent.textContent = 'Clear';
        filterText.classList.add('dropdown-open');
      } else {
        filterTextContent.textContent = 'Filters';
        filterText.classList.remove('dropdown-open');
      }
    }
  }

  // Show filter dropdown when clicking in search bar or on filter text
  if (searchInput && filterDropdown) {
    searchInput.addEventListener('focus', () => {
      showFilterDropdown();
    });

    searchInput.addEventListener('click', () => {
      showFilterDropdown();
    });
  }

  if (filterText && filterDropdown) {
    filterText.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isFilterDropdownOpen) {
        clearAllFilters();
        hideFilterDropdown();
      } else {
        showFilterDropdown();
      }
    });
  }

  function showFilterDropdown() {
    if (filterDropdown && controlsContainer) {
      filterDropdown.classList.remove('hidden');
      controlsContainer.classList.add('filter-dropdown-open');
      isFilterDropdownOpen = true;
      updateFilterText();
      filterDropdown.offsetHeight;
    }
  }

  function hideFilterDropdown() {
    if (filterDropdown && controlsContainer) {
      if (!hasActiveFilters()) {
        filterDropdown.classList.add('hidden');
        controlsContainer.classList.remove('filter-dropdown-open');
        isFilterDropdownOpen = false;
        updateFilterText();
      }
    }
  }

  // Clear all filters function
  function clearAllFilters() {
    if (searchInput) {
      searchInput.value = '';
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
    
    updateMustPlayHighlighting();
    applyFilters();
  }

  // Close dropdown when clicking outside, but only if no filters are active
  document.addEventListener('click', (e) => {
    if (searchContainer && !searchContainer.contains(e.target)) {
      hideFilterDropdown();
    }
  });

  // Apply filters when inputs change
  filterCheckboxes.forEach(input => {
    input.addEventListener('change', () => {
      updateMustPlayHighlighting();
      applyFilters();
    });
  });
  
  filterRadios.forEach(input => {
    input.addEventListener('change', () => {
      updateMustPlayHighlighting();
      applyFilters();
    });
  });

  // Helper function to apply current sort to an array of mods
  function applySortToMods(modsArray) {
    const gradesHidden = document.body.classList.contains('hide-grades');
    
    if (gradesHidden) {
      return shuffleArray([...modsArray]);
    }
    
    switch(sortState) {
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
  }

  // Helper function to preserve order when filtering
  function preserveOrderFilter(modsToFilter) {
    const orderMap = new Map();
    currentDisplayedMods.forEach((mod, index) => {
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
  }

  // Apply filters function
  function applyFilters() {
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
    const searchQuery = searchInput ? searchInput.value.toLowerCase() : '';

    // Filter mods
    const filtered = allModCards.filter(card => {
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
      finalModOrder = preserveOrderFilter(filtered);
    } else {
      finalModOrder = applySortToMods(filtered);
    }
    
    renderMods(finalModOrder);
  }

  // Sort functionality
  const sortButton = document.getElementById('sort-button');
  if (sortButton) {
    sortButton.addEventListener('click', () => {
      const gradesHidden = document.body.classList.contains('hide-grades');
      
      if (gradesHidden) {
        const shuffled = shuffleArray([...currentDisplayedMods]);
        baselineOrder = [...shuffled];
        renderMods(shuffled);
      } else {
        sortState = (sortState + 1) % 3;
        
        let toRender;
        switch(sortState) {
          case 0:
            sortButton.textContent = 'Sort by Rating';
            baselineOrder = applySortToMods([...allModCards]);
            applyFilters();
            return;
          case 1:
            sortButton.textContent = 'Highest First';
            toRender = [...currentDisplayedMods].sort((a, b) => {
              const ratingA = parseFloat(a.querySelector('.rating span').textContent);
              const ratingB = parseFloat(b.querySelector('.rating span').textContent);
              return ratingB - ratingA;
            });
            baselineOrder = applySortToMods([...allModCards]);
            break;
          case 2:
            sortButton.textContent = 'Lowest First';
            toRender = [...currentDisplayedMods].sort((a, b) => {
              const ratingA = parseFloat(a.querySelector('.rating span').textContent);
              const ratingB = parseFloat(b.querySelector('.rating span').textContent);
              return ratingA - ratingB;
            });
            baselineOrder = applySortToMods([...allModCards]);
            break;
        }
        renderMods(toRender);
      }
      
      if (!hasActiveFilters()) {
        hideFilterDropdown();
      }
    });
  }

  // Cards per row controls
  const cardsLessBtn = document.getElementById('cards-less');
  const cardsMoreBtn = document.getElementById('cards-more');
  
  if (cardsLessBtn) {
    cardsLessBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cardsPerRow === 2) {
        cardsPerRow = 3;
      } else if (cardsPerRow === 3) {
        cardsPerRow = 4;
      } else if (cardsPerRow === 4) {
        cardsPerRow = 'list';
      }
      updateGridLayout();
      
      if (!hasActiveFilters()) {
        hideFilterDropdown();
      }
    });
  }

  if (cardsMoreBtn) {
    cardsMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cardsPerRow === 'list') {
        cardsPerRow = 4;
      } else if (cardsPerRow === 4) {
        cardsPerRow = 3;
      } else if (cardsPerRow === 3) {
        cardsPerRow = 2;
      }
      updateGridLayout();
      
      if (!hasActiveFilters()) {
        hideFilterDropdown();
      }
    });
  }

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Toggle grades functionality
  function handleToggleGrades() {
    const sortBtn = document.getElementById('sort-button');
    const isHiding = document.body.classList.toggle('hide-grades');
    
    if (isHiding && sortBtn) {
      sortBtn.textContent = 'Randomize';
      sortState = 0; 
    } else if (sortBtn) {
      sortBtn.textContent = 'Sort by Rating';
      sortState = 0;
      // Don't call applyFilters() here to preserve current order
      // Just re-render the current mods to update the display
      renderMods(currentDisplayedMods);
    }
    syncToggleStates();
    
    if (!hasActiveFilters()) {
      hideFilterDropdown();
    }
  }

  setupButtonHandlers(['toggle-grades', 'toggle-grades-mobile'], handleToggleGrades);

  // Toggle videos functionality
  function handleToggleVideos() {
    document.body.classList.toggle('hide-videos');
    syncToggleStates();
    
    if (!hasActiveFilters()) {
      hideFilterDropdown();
    }
  }

  setupButtonHandlers(['toggle-videos', 'toggle-videos-mobile'], handleToggleVideos);

  function syncToggleStates() {
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
  }

  function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function renderMods(modArray) {
    currentDisplayedMods = modArray;
    const container = document.getElementById('mod-list');
    if (!container) return;
    
    container.innerHTML = '';
    modArray.forEach(card => {
      container.appendChild(card.cloneNode(true));
    });
    
    updateMustPlayHighlighting();
    initializeVideoThumbnails();
  }

  // Contact overlay functionality
  function showContactOverlay() {
    const contactOverlay = document.getElementById('contact-overlay');
    if (contactOverlay) contactOverlay.classList.remove('hidden');
    
    if (!hasActiveFilters()) {
      hideFilterDropdown();
    }
  }

  setupButtonHandlers(['contact-button', 'contact-button-mobile'], showContactOverlay);

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
      emailText.classList.remove('hidden');
    });
  }

  // Install files overlay functionality
  function showInstallFilesOverlay() {
    const installFilesOverlay = document.getElementById('install-files-overlay');
    if (installFilesOverlay) installFilesOverlay.classList.remove('hidden');
    
    if (!hasActiveFilters()) {
      hideFilterDropdown();
    }
  }

  setupButtonHandlers(['essentials-button', 'essentials-button-mobile'], showInstallFilesOverlay);

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

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (contactOverlay) contactOverlay.classList.add('hidden');
      if (installFilesOverlay) installFilesOverlay.classList.add('hidden');
      if (isFilterDropdownOpen && !hasActiveFilters()) {
        hideFilterDropdown();
      }
    }
  });
});
