// Main JavaScript for S.T.A.L.K.E.R. Mods Archive

document.addEventListener('DOMContentLoaded', function() {
  let sortState = 0;
  let cardsPerRow = 3; // Default to 3 cards per row
  let currentDisplayedMods = []; // Track what's currently being displayed
  
  // Get all mod cards - now sorted alphabetically by default
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

    // Collect all gallery images - get from page data if available, otherwise use thumbnails
    const pageGalleryData = document.querySelector('[data-gallery-images]');
    if (pageGalleryData) {
      const allImages = JSON.parse(pageGalleryData.getAttribute('data-gallery-images'));
      const baseUrl = pageGalleryData.getAttribute('data-base-url');
      galleryImages = allImages.slice(0, 10).map((image, index) => ({
        src: baseUrl + image,
        alt: `Gallery image ${index + 1}`
      }));
    } else {
      // Fallback to thumbnail-based collection
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
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = ''; // Restore scrolling
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
    // Re-apply must play highlighting after layout change
    updateMustPlayHighlighting();
  }

  // Video thumbnail click handler - improved to remove skeleton loading issues
  function setupVideoThumbnails() {
    document.querySelectorAll('.video-thumbnail').forEach(thumbnail => {
      // Remove any skeleton loading elements that might interfere
      const skeletonElements = thumbnail.querySelectorAll('.skeleton-loading');
      skeletonElements.forEach(skeleton => skeleton.remove());
      
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

  // Initialize video thumbnails and ensure images load properly
  function initializeVideoThumbnails() {
    document.querySelectorAll('.video-thumbnail img').forEach(img => {
      // Ensure images load and remove any loading states
      img.onload = function() {
        const skeletonElements = this.parentElement.querySelectorAll('.skeleton-loading');
        skeletonElements.forEach(skeleton => skeleton.remove());
      };
      
      // If image is already loaded (cached), trigger the onload
      if (img.complete) {
        img.onload();
      }
    });
    
    setupVideoThumbnails();
  }

  // Initialize video thumbnails
  initializeVideoThumbnails();

  // UPDATED: Filter functionality with new card-based UI
  const searchInput = document.getElementById('search-input');
  const filterText = document.getElementById('filter-text');
  const filterTextContent = document.getElementById('filter-text-content');
  const filterArrow = document.getElementById('filter-arrow');
  const filterCard = document.getElementById('filter-card');
  const filterCheckboxes = document.querySelectorAll('.filter-checkbox');
  const clearFiltersBtn = document.getElementById('clear-filters');

  let isFilterCardOpen = false;

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

  // UPDATED: Update filter text based on card state
  function updateFilterText() {
    if (filterTextContent && filterText) {
      if (isFilterCardOpen) {
        filterTextContent.textContent = 'Hide';
        filterText.classList.add('dropdown-open');
      } else {
        filterTextContent.textContent = 'Filters';
        filterText.classList.remove('dropdown-open');
      }
    }
  }

  // Show filter card when clicking in search bar or on filter text
  if (searchInput && filterCard) {
    searchInput.addEventListener('focus', () => {
      showFilterCard();
    });

    searchInput.addEventListener('click', () => {
      showFilterCard();
    });
  }

  if (filterText && filterCard) {
    filterText.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isFilterCardOpen) {
        hideFilterCard();
      } else {
        showFilterCard();
      }
    });
  }

  function showFilterCard() {
    if (filterCard) {
      filterCard.classList.remove('hidden');
      isFilterCardOpen = true;
      updateFilterText();
    }
  }

  function hideFilterCard() {
    if (filterCard) {
      // Only hide if no filters are active
      if (!hasActiveFilters()) {
        filterCard.classList.add('hidden');
        isFilterCardOpen = false;
        updateFilterText();
      }
    }
  }

  // UPDATED: Clear all filters function
  function clearAllFilters() {
    // Clear search input text
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Clear standalone checkbox
    const standaloneCheckbox = document.getElementById('filter-standalone-yes');
    if (standaloneCheckbox) standaloneCheckbox.checked = false;
    
    // Clear low-spec checkbox
    const lowspecCheckbox = document.getElementById('filter-lowspec-yes');
    if (lowspecCheckbox) lowspecCheckbox.checked = false;
    
    // Clear must-play checkbox
    const mustplayCheckbox = document.getElementById('filter-mustplay-yes');
    if (mustplayCheckbox) mustplayCheckbox.checked = false;
    
    // Clear platform checkboxes
    document.querySelectorAll('input[id^="filter-platform-"]').forEach(checkbox => {
      checkbox.checked = false;
    });
    
    updateMustPlayHighlighting();
    applyFilters();
    hideFilterCard();
  }

  // Clear filters button handler
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener('click', clearAllFilters);
  }

  // Close filter card when clicking outside, but only if no filters are active
  document.addEventListener('click', (e) => {
    const searchContainer = document.getElementById('search-container');
    if (searchContainer && !searchContainer.contains(e.target) && !filterCard.contains(e.target)) {
      hideFilterCard();
    }
  });

  // Apply filters when inputs change
  filterCheckboxes.forEach(input => {
    input.addEventListener('change', () => {
      updateMustPlayHighlighting();
      applyFilters();
    });
  });

  // UPDATED: Apply filters function - modified to handle must-play as highlight-only
  function applyFilters() {
    // Get active filters
    const activeFilters = {
      standalone: false,
      lowspec: false,
      mustplay: false, // This will be used for highlighting only
      platforms: []
    };

    // Standalone filter (only show standalone if checked)
    const standaloneCheckbox = document.getElementById('filter-standalone-yes');
    if (standaloneCheckbox && standaloneCheckbox.checked) {
      activeFilters.standalone = true;
    }

    // Low-spec filter (only show low-spec if checked)
    const lowspecCheckbox = document.getElementById('filter-lowspec-yes');
    if (lowspecCheckbox && lowspecCheckbox.checked) {
      activeFilters.lowspec = true;
    }

    // Must-play filter (for highlighting only, not filtering)
    const mustplayCheckbox = document.getElementById('filter-mustplay-yes');
    if (mustplayCheckbox && mustplayCheckbox.checked) {
      activeFilters.mustplay = true;
    }

    // Platform filter (checkboxes)
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

    // Filter mods - MODIFIED: mustplay filter doesn't actually filter out cards
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

      // Standalone filter (only filter if checkbox is checked)
      if (activeFilters.standalone) {
        const cardStandalone = card.getAttribute('data-mod-standalone') === 'true';
        if (!cardStandalone) {
          return false;
        }
      }

      // Low-spec filter (only filter if checkbox is checked)
      if (activeFilters.lowspec) {
        const cardLowspec = card.getAttribute('data-mod-lowspec') === 'true';
        if (!cardLowspec) {
          return false;
        }
      }

      // NOTE: Must-play filter is NOT included here - it only highlights, doesn't filter

      // Platform filter (if any platforms are selected, show only those)
      if (activeFilters.platforms.length > 0) {
        const cardPlatform = (card.getAttribute('data-mod-platform') || '').toLowerCase();
        if (!activeFilters.platforms.includes(cardPlatform)) {
          return false;
        }
      }

      return true;
    });

    renderMods(filtered);
  }

  // Sort functionality
  const sortButton = document.getElementById('sort-button');
  if (sortButton) {
    sortButton.addEventListener('click', () => {
      const gradesHidden = document.body.classList.contains('hide-grades');
      
      if (gradesHidden) {
        // Shuffle the cards
        const shuffled = shuffleArray([...currentDisplayedMods]);
        renderMods(shuffled);
      } else {
        sortState = (sortState + 1) % 3;
        
        let toRender;
        switch(sortState) {
          case 0:
            sortButton.textContent = 'Sort by Rating';
            // Apply current filters instead of showing all cards
            applyFilters();
            return; // Exit early since applyFilters will call renderMods
          case 1:
            sortButton.textContent = 'Highest First';
            toRender = [...currentDisplayedMods].sort((a, b) => {
              const ratingA = parseFloat(a.querySelector('.rating span').textContent);
              const ratingB = parseFloat(b.querySelector('.rating span').textContent);
              return ratingB - ratingA;
            });
            break;
          case 2:
            sortButton.textContent = 'Lowest First';
            toRender = [...currentDisplayedMods].sort((a, b) => {
              const ratingA = parseFloat(a.querySelector('.rating span').textContent);
              const ratingB = parseFloat(b.querySelector('.rating span').textContent);
              return ratingA - ratingB;
            });
            break;
        }
        renderMods(toRender);
      }
      
      // Don't hide filter card if filters are active
      if (!hasActiveFilters()) {
        hideFilterCard();
      }
    });
  }

  // Cards per row controls - UPDATED for list view
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
      
      // Don't hide filter card if filters are active
      if (!hasActiveFilters()) {
        hideFilterCard();
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
      
      // Don't hide filter card if filters are active
      if (!hasActiveFilters()) {
        hideFilterCard();
      }
    });
  }

  // Search functionality - updated to work with filters
  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  // Toggle grades functionality - consolidated handlers
  function handleToggleGrades() {
    const sortBtn = document.getElementById('sort-button');
    const isHiding = document.body.classList.toggle('hide-grades');
    
    if (isHiding && sortBtn) {
      sortBtn.textContent = 'Randomize';
      sortState = 0; 
    } else if (sortBtn) {
      sortBtn.textContent = 'Sort by Rating';
      sortState = 0;
      applyFilters(); // Apply current filters instead of showing all cards
    }
    syncToggleStates();
    
    // Don't hide filter card if filters are active
    if (!hasActiveFilters()) {
      hideFilterCard();
    }
  }

  // Setup consolidated toggle grades handlers
  setupButtonHandlers(['toggle-grades', 'toggle-grades-mobile'], handleToggleGrades);

  // Toggle videos functionality - consolidated handlers
  function handleToggleVideos() {
    document.body.classList.toggle('hide-videos');
    syncToggleStates();
    
    // Don't hide filter card if filters are active
    if (!hasActiveFilters()) {
      hideFilterCard();
    }
  }

  // Setup consolidated toggle videos handlers
  setupButtonHandlers(['toggle-videos', 'toggle-videos-mobile'], handleToggleVideos);

  function syncToggleStates() {
    const gradesHidden = document.body.classList.contains('hide-grades');
    const videosHidden = document.body.classList.contains('hide-videos');
    
    // Update all grade toggle buttons
    ['toggle-grades', 'toggle-grades-mobile'].forEach(id => {
      const btn = document.getElementById(id);
      if (btn) btn.classList.toggle('button-active', gradesHidden);
    });
    
    // Update all video toggle buttons
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
    
    // Re-apply must play highlighting after rendering
    updateMustPlayHighlighting();
    
    // Re-setup video thumbnails for newly rendered cards
    initializeVideoThumbnails();
  }

  // Contact overlay functionality - consolidated handlers
  function showContactOverlay() {
    const contactOverlay = document.getElementById('contact-overlay');
    if (contactOverlay) contactOverlay.classList.remove('hidden');
    
    // Don't hide filter card if filters are active
    if (!hasActiveFilters()) {
      hideFilterCard();
    }
  }

  // Setup consolidated contact handlers
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

  // Install files overlay functionality - consolidated handlers
  function showInstallFilesOverlay() {
    const installFilesOverlay = document.getElementById('install-files-overlay');
    if (installFilesOverlay) installFilesOverlay.classList.remove('hidden');
    
    // Don't hide filter card if filters are active
    if (!hasActiveFilters()) {
      hideFilterCard();
    }
  }

  // Setup consolidated essentials handlers
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
      if (isFilterCardOpen && !hasActiveFilters()) {
        hideFilterCard();
      }
    }
  });
});
