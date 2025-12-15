let currentZoom = 100;
const zoomStep = 10;
const minZoom = 50;
const maxZoom = 150;

let isPanning = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

// 0 = collapsed, 1 = full view, 2 = fully expanded
let expandState = 0;

// Track last search term to detect changes
let lastSearchTerm = '';

// --- Card Logic ---

function toggleCard(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  
  const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  
  const isExpanded = details.classList.contains('expanded');
  
  if (isExpanded) {
    // Collapse
    details.style.height = details.scrollHeight + 'px';
    requestAnimationFrame(() => {
      details.style.height = '0';
      details.classList.remove('expanded');
      if (icon) icon.classList.remove('rotated');
      card.classList.remove('expanded');
      if (connector) connector.classList.add('hidden');
      if (childrenRow) childrenRow.classList.add('hidden');
    });
  } else {
    // Expand
    details.classList.add('expanded');
    if (icon) icon.classList.add('rotated');
    card.classList.add('expanded');
    if (connector) connector.classList.remove('hidden');
    if (childrenRow) childrenRow.classList.remove('hidden');
    
    // Smooth height animation
    const height = details.scrollHeight;
    details.style.height = '0';
    requestAnimationFrame(() => {
      details.style.height = height + 'px';
    });
    
    setTimeout(() => {
      if (details.classList.contains('expanded')) {
        details.style.height = 'auto';
      }
    }, 300);
  }
}

// --- Expansion Logic ---

function toggleAll() {
  const button = document.getElementById('toggleAllBtn');
  
  if (expandState === 0) {
    expandFullView();
    expandState = 1;
    button.textContent = 'Expand All';
  } else if (expandState === 1) {
    expandAll();
    expandState = 2;
    button.textContent = 'Collapse All';
  } else {
    collapseAll();
    expandState = 0;
    button.textContent = 'Full View';
  }
}

function expandFullView() {
  // Collect all unique IDs that are parents (have associated children containers)
  const parentIds = new Set();
  
  document.querySelectorAll('.children-row[data-parent], .hierarchical-children[data-parent]').forEach(el => {
    parentIds.add(el.getAttribute('data-parent'));
  });
  
  // Find all cards corresponding to these parent IDs and expand ONLY their children/connectors
  parentIds.forEach(id => {
    const card = document.querySelector(`.mod-card[data-id="${id}"]`);
    if (card) {
      forceExpandCardChildren(card);
    }
  });
}

function expandAll() {
  const allCards = document.querySelectorAll('.mod-card[data-id]');
  allCards.forEach(card => forceExpandCard(card));
}

function collapseAll() {
  const allCards = document.querySelectorAll('.mod-card[data-id]');
  allCards.forEach(card => forceCollapseCard(card));
}

function forceExpandCard(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  
  if (!details.classList.contains('expanded')) {
    details.classList.add('expanded');
    if (icon) icon.classList.add('rotated');
    card.classList.add('expanded');
    if (connector) connector.classList.remove('hidden');
    if (childrenRow) childrenRow.classList.remove('hidden');
    details.style.height = 'auto';
  }
}

// Expands children/connector without expanding card details
function forceExpandCardChildren(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  
  // Only expand children/connector, do not add 'expanded' class to details or card
  if (connector) connector.classList.remove('hidden');
  if (childrenRow) childrenRow.classList.remove('hidden');

  // Ensure details remain collapsed and icon is not rotated
  details.classList.remove('expanded');
  card.classList.remove('expanded');
  if (icon) icon.classList.remove('rotated');
  details.style.height = '0'; // Explicitly set height to 0
}


function forceCollapseCard(card) {
  const details = card.querySelector(':scope > .mod-details');
  const icon = card.querySelector(':scope > .mod-header .expand-icon');
  const cardId = card.getAttribute('data-id');
  const connector = document.querySelector(`.branch-connector[data-parent="${cardId}"]`);
  const childrenRow = document.querySelector(`.children-row[data-parent="${cardId}"], .hierarchical-children[data-parent="${cardId}"]`);
  
  details.style.height = '0';
  details.classList.remove('expanded');
  if (icon) icon.classList.remove('rotated');
  card.classList.remove('expanded');
  if (connector) connector.classList.add('hidden');
  if (childrenRow) childrenRow.classList.add('hidden');
}

// --- Pan to Card ---

function panToCard(card) {
  const wrapper = document.getElementById('flowchartWrapper');
  const container = document.getElementById('flowchartContainer');
  
  // Get the wrapper dimensions
  const wrapperRect = wrapper.getBoundingClientRect();
  
  // Get current scale
  const scale = currentZoom / 100;
  
  // Get the card's position relative to the container (before any transform)
  // We need to calculate its position in the original, unscaled coordinate system
  const cardRect = card.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  
  // Calculate card's position in the unscaled container coordinate system
  // First, get the card's position relative to the container's current transformed position
  const cardRelativeX = (cardRect.left - containerRect.left) / scale;
  const cardRelativeY = (cardRect.top - containerRect.top) / scale;
  
  // Get card dimensions in unscaled coordinates
  const cardWidth = cardRect.width / scale;
  const cardHeight = cardRect.height / scale;
  
  // Calculate the card's center in unscaled coordinates
  const cardCenterX = cardRelativeX + cardWidth / 2;
  const cardCenterY = cardRelativeY + cardHeight / 2;
  
  // Target position: horizontally centered, 200px from top
  const targetX = wrapperRect.width / 2;
  const targetY = 200;
  
  // Calculate the required translation to position the card at the target
  // We need to account for the scale when translating
  translateX = targetX - (cardCenterX * scale);
  translateY = targetY - (cardCenterY * scale);
  
  // Temporarily add a transition for smooth panning
  container.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  updateZoom();
  
  // Remove the transition after animation completes to allow normal panning
  setTimeout(() => {
    container.style.transition = '';
  }, 600);
}

// --- Search Functionality ---

function handleSearchInput(event) {
  const input = document.getElementById('modSearchInput');
  const filter = input.value.toLowerCase().trim();
  const enterBtn = document.getElementById('searchEnterBtn');
  const clearBtn = document.getElementById('clearSearchBtn');
  
  // Show/hide buttons
  if (filter.length > 0) {
    enterBtn.classList.remove('hidden');
    clearBtn.classList.remove('hidden');
  } else {
    enterBtn.classList.add('hidden');
    clearBtn.classList.add('hidden');
    // Clear highlights when input is empty
    document.querySelectorAll('.search-match').forEach(c => c.classList.remove('search-match'));
    lastSearchTerm = '';
    return;
  }
  
  // If user presses Enter key, execute search
  if (event.key === 'Enter') {
    executeSearch();
  }
  // If user presses Escape, clear search
  else if (event.key === 'Escape') {
    clearSearch();
  }
  // If search term changed (user deleted/modified), reset view
  else if (lastSearchTerm !== '' && filter !== lastSearchTerm) {
    resetViewQuick();
    document.querySelectorAll('.search-match').forEach(c => c.classList.remove('search-match'));
  }
}

function executeSearch() {
  const input = document.getElementById('modSearchInput');
  const filter = input.value.toLowerCase().trim();
  
  if (filter.length === 0) return;
  
  // Store the search term
  lastSearchTerm = filter;
  
  const cards = document.querySelectorAll('.mod-card');
  
  // Remove previous highlights
  document.querySelectorAll('.search-match').forEach(c => c.classList.remove('search-match'));

  let firstMatch = null;

  cards.forEach(card => {
    const modName = card.getAttribute('data-name') || "";
    
    if (modName.includes(filter)) {
      // Highlight match
      card.classList.add('search-match');
      if (!firstMatch) firstMatch = card;

      // Recursively expand all parents so this card is visible
      expandParents(card);
    }
  });

  // Pan to first match if found
  if (firstMatch) {
    // Delay to ensure parent expansions are fully rendered and heights calculated
    setTimeout(() => {
      panToCard(firstMatch);
    }, 350);
  }
}

function expandParents(cardElement) {
  // Traverse up the DOM to find parent containers
  let current = cardElement.parentElement;
  
  while (current && !current.classList.contains('flowchart-container')) {
    // If we hit a hierarchical-children or children-row, we need to find the controller card
    if (current.classList.contains('hierarchical-children') || current.classList.contains('children-row')) {
      const parentId = current.getAttribute('data-parent');
      const parentCard = document.querySelector(`.mod-card[data-id="${parentId}"]`);
      if (parentCard) {
        forceExpandCard(parentCard);
      }
    }
    current = current.parentElement;
  }
}

function clearSearch() {
  const input = document.getElementById('modSearchInput');
  input.value = '';
  document.getElementById('searchEnterBtn').classList.add('hidden');
  document.getElementById('clearSearchBtn').classList.add('hidden');
  document.querySelectorAll('.search-match').forEach(c => c.classList.remove('search-match'));
  lastSearchTerm = '';
  resetViewQuick();
}

// Quick reset without scroll animation (for ESC or text modification)
function resetViewQuick() {
  currentZoom = 100;
  translateX = 0;
  translateY = 0;
  updateZoom();
  collapseAll();
  expandState = 0;
  document.getElementById('toggleAllBtn').textContent = 'Full View';
}

// --- View Logic ---

function centerView() {
  // Temporarily add a transition for smooth centering
  const container = document.getElementById('flowchartContainer');
  container.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  
  // Reset translation to center
  translateX = 0;
  translateY = 0;
  updateZoom();
  
  // Remove the transition after animation completes
  setTimeout(() => {
    container.style.transition = '';
  }, 600);
}

function updateZoom() {
  const container = document.getElementById('flowchartContainer');
  const zoomLevel = document.getElementById('zoomLevel');
  document.getElementById('zoomInBtn').disabled = currentZoom >= maxZoom;
  document.getElementById('zoomOutBtn').disabled = currentZoom <= minZoom;
  
  zoomLevel.textContent = `${currentZoom}%`;
  container.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom / 100})`;
}

function zoomIn() {
  if (currentZoom < maxZoom) {
    currentZoom += zoomStep;
    updateZoom();
  }
}

function zoomOut() {
  if (currentZoom > minZoom) {
    currentZoom -= zoomStep;
    updateZoom();
  }
}

function resetView() {
  currentZoom = 100;
  translateX = 0;
  translateY = 0;
  updateZoom();
  collapseAll();
  clearSearch();
  expandState = 0;
  document.getElementById('toggleAllBtn').textContent = 'Full View';
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initPanZoom() {
  const wrapper = document.getElementById('flowchartWrapper');
  
  wrapper.addEventListener('mousedown', (e) => {
    // Don't pan if clicking card or scrollbar
    if (e.target.closest('.mod-card') || e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;
    
    isPanning = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    wrapper.style.cursor = 'grabbing';
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!isPanning) return;
    e.preventDefault();
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    updateZoom(); // Re-applies transform
  });
  
  window.addEventListener('mouseup', () => {
    isPanning = false;
    wrapper.style.cursor = 'grab';
  });
  
  // Touch support
  wrapper.addEventListener('touchstart', (e) => {
    if (e.target.closest('.mod-card')) return;
    if (e.touches.length === 1) {
      isPanning = true;
      startX = e.touches[0].clientX - translateX;
      startY = e.touches[0].clientY - translateY;
    }
  }, { passive: true });
  
  wrapper.addEventListener('touchmove', (e) => {
    if (!isPanning || e.touches.length !== 1) return;
    translateX = e.touches[0].clientX - startX;
    translateY = e.touches[0].clientY - startY;
    updateZoom();
  }, { passive: true });
  
  wrapper.addEventListener('touchend', () => {
    isPanning = false;
  });
}

document.addEventListener('DOMContentLoaded', function() {
  updateZoom();
  initPanZoom();
  
  // Setup button handlers for Essentials/About popups (if they exist)
  const popupMap = {
    'essentials-button': 'install-files-overlay',
    'contact-button': 'contact-overlay'
  };
  
  Object.keys(popupMap).forEach(btnId => {
    const btn = document.getElementById(btnId);
    const overlay = document.getElementById(popupMap[btnId]);
    if (btn && overlay) {
      btn.addEventListener('click', () => overlay.classList.remove('hidden'));
      // Close logic
      const closeBtn = overlay.querySelector('button[id$="close"]'); // generic selector
      if(closeBtn) closeBtn.addEventListener('click', () => overlay.classList.add('hidden'));
      overlay.addEventListener('click', (e) => {
        if(e.target === overlay) overlay.classList.add('hidden');
      });
    }
  });
});
