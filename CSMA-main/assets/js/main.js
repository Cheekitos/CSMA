// Main JavaScript for S.T.A.L.K.E.R. Mods Archive

document.addEventListener('DOMContentLoaded', function() {
  let sortState = 0;
  let cardsPerRow = 3; // Default to 3 cards per row
  let currentDisplayedMods = []; // Track what's currently being displayed
  
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

    // Collect all gallery images
    galleryImages = Array.from(galleryThumbnails).map(thumb => ({
      src: thumb.getAttribute('data-full-src'),
      alt: thumb.querySelector('img').alt
    }));

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
      modList.className = `grid gap-4 cards-${cardsPerRow}`;
    }
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

  // Sort functionality
  const sortButton = document.getElementById('sort-button');
  if (sortButton) {
    sortButton.addEventListener('click', () => {
      const gradesHidden = document.body.classList.contains('hide-grades');
      
      if (gradesHidden) {
        // Shuffle the cards
        const shuffled = shuffleArray([...allModCards]);
        renderMods(shuffled);
      } else {
        sortState = (sortState + 1) % 3;
        
        let toRender;
        switch(sortState) {
          case 0:
            sortButton.textContent = 'Sort by Rating';
            toRender = [...allModCards]; // Original order
            break;
          case 1:
            sortButton.textContent = 'Highest First';
            toRender = [...allModCards].sort((a, b) => {
              const ratingA = parseFloat(a.querySelector('.rating span').textContent);
              const ratingB = parseFloat(b.querySelector('.rating span').textContent);
              return ratingB - ratingA;
            });
            break;
          case 2:
            sortButton.textContent = 'Lowest First';
            toRender = [...allModCards].sort((a, b) => {
              const ratingA = parseFloat(a.querySelector('.rating span').textContent);
              const ratingB = parseFloat(b.querySelector('.rating span').textContent);
              return ratingA - ratingB;
            });
            break;
        }
        renderMods(toRender);
      }
    });
  }

  // Cards per row controls
  const cardsLessBtn = document.getElementById('cards-less');
  const cardsMoreBtn = document.getElementById('cards-more');
  
  if (cardsLessBtn) {
    cardsLessBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cardsPerRow < 4) {
        cardsPerRow++;
        updateGridLayout();
      }
    });
  }

  if (cardsMoreBtn) {
    cardsMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cardsPerRow > 2) {
        cardsPerRow--;
        updateGridLayout();
      }
    });
  }

  // Search functionality
  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      
      const filtered = allModCards.filter(card => {
        const title = card.getAttribute('data-mod-title') || '';
        const description = card.getAttribute('data-mod-description') || '';
        const platform = card.getAttribute('data-mod-platform') || '';
        
        return title.includes(q) || description.includes(q) || platform.includes(q);
      });
      renderMods(filtered);
    });
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
      renderMods([...allModCards]);
    }
    syncToggleStates();
  }

  // Setup consolidated toggle grades handlers
  setupButtonHandlers(['toggle-grades', 'toggle-grades-mobile'], handleToggleGrades);

  // Toggle videos functionality - consolidated handlers
  function handleToggleVideos() {
    document.body.classList.toggle('hide-videos');
    syncToggleStates();
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
    
    // Re-setup video thumbnails for newly rendered cards
    initializeVideoThumbnails();
  }

  // Contact overlay functionality - consolidated handlers
  function showContactOverlay() {
    const contactOverlay = document.getElementById('contact-overlay');
    if (contactOverlay) contactOverlay.classList.remove('hidden');
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
    }
  });
});
