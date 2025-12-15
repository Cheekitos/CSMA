// Image gallery and video functionality
// This file handles all media components including lightbox and video thumbnails

window.StalkerMods.gallery = {
  currentImageIndex: 0,
  galleryImages: [],

  init: function() {
    this.initializeImageGallery();
    this.initializeVideoThumbnails();
  },

  initializeImageGallery: function() {
    const galleryThumbnails = document.querySelectorAll('.gallery-thumbnail');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCounter = document.getElementById('lightbox-counter');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');
    const closeBtn = document.getElementById('lightbox-close');

    if (!lightbox || !lightboxImg) return;

    // Enhanced image fallback handling
    this.setupImageFallbacks(galleryThumbnails);

    // Collect all gallery images
    const pageGalleryData = document.querySelector('[data-gallery-images]');
    if (pageGalleryData) {
      const allImages = JSON.parse(pageGalleryData.getAttribute('data-gallery-images'));
      const baseUrl = pageGalleryData.getAttribute('data-base-url');
      this.galleryImages = allImages.slice(0, 10).map((image, index) => ({
        src: baseUrl + image,
        alt: `Gallery image ${index + 1}`
      }));
    } else {
      this.galleryImages = Array.from(galleryThumbnails).map(thumb => ({
        src: thumb.getAttribute('data-full-src'),
        alt: thumb.querySelector('img') ? thumb.querySelector('img').alt : 'Gallery image'
      }));
    }

    // Add click event to thumbnails
    galleryThumbnails.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        this.currentImageIndex = index;
        this.openLightbox();
      });
    });

    // Event listeners for lightbox controls
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeLightbox());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextImage());
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prevImage());
    }

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        this.closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;

      switch(e.key) {
        case 'Escape':
          this.closeLightbox();
          break;
        case 'ArrowRight':
          this.nextImage();
          break;
        case 'ArrowLeft':
          this.prevImage();
          break;
      }
    });
  },

  // Enhanced image fallback handling
  setupImageFallbacks: function(galleryThumbnails) {
    const self = this; // Store reference to this for the inner function
    
    galleryThumbnails.forEach(thumbnail => {
      const img = thumbnail.querySelector('img');
      if (img) {
        // Set up error handling for images that already have fallback
        if (img.hasAttribute('data-fallback')) {
          // Remove any existing error handler to avoid duplicates
          img.removeEventListener('error', self.handleImageError);
          img.addEventListener('error', self.handleImageError);
        }
        
        // Check if image is already broken (failed to load before JS ran)
        if (img.complete && img.naturalHeight === 0 && img.hasAttribute('data-fallback')) {
          img.src = img.getAttribute('data-fallback');
          img.removeAttribute('data-fallback');
        }
      }
    });
  },

  // Error handler function
  handleImageError: function(event) {
    const img = event.target;
    const fallback = img.getAttribute('data-fallback');
    
    if (fallback && img.src !== fallback) {
      img.src = fallback;
      img.removeAttribute('data-fallback');
    }
  },

  openLightbox: function() {
    const lightbox = document.getElementById('lightbox');
    if (this.galleryImages.length === 0 || !lightbox) return;
    
    lightbox.classList.add('active');
    this.updateLightboxImage();
    document.body.style.overflow = 'hidden';
  },

  closeLightbox: function() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  updateLightboxImage: function() {
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCounter = document.getElementById('lightbox-counter');
    
    if (this.galleryImages.length === 0 || !lightboxImg) return;
    
    const currentImage = this.galleryImages[this.currentImageIndex];
    lightboxImg.src = currentImage.src;
    lightboxImg.alt = currentImage.alt;
    
    if (lightboxCounter) {
      lightboxCounter.textContent = `${this.currentImageIndex + 1} / ${this.galleryImages.length}`;
    }
  },

  nextImage: function() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.galleryImages.length;
    this.updateLightboxImage();
  },

  prevImage: function() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.galleryImages.length) % this.galleryImages.length;
    this.updateLightboxImage();
  },

  // Video thumbnail functionality
  setupVideoThumbnails: function() {
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
  },

  initializeVideoThumbnails: function() {
    document.querySelectorAll('.video-thumbnail img').forEach(img => {
      img.onload = function() {
        // Image loaded successfully
      };
      
      if (img.complete) {
        img.onload();
      }
    });
    
    this.setupVideoThumbnails();
  }
};

// Initialize gallery when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (!window.StalkerMods) {
    window.StalkerMods = {};
  }
  window.StalkerMods.gallery.init();
});