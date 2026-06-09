// Listing detail page JavaScript - polished gallery, lightbox, breadcrumbs, related items
(function() {
  var container = document.getElementById('listing-detail');
  var currentPhotoIndex = 0;
  var photos = [];
  var lightboxOpen = false;

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function fallbackCopyUrl(url, labelEl) {
    try {
      var ta = document.createElement('textarea');
      ta.value = url;
      ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      if (labelEl) { labelEl.textContent = 'Copied!'; }
      setTimeout(function() { if (labelEl) labelEl.textContent = 'Copy Link'; }, 2000);
    } catch (e) {}
  }

  function getCategoryIcon(category) {
    var icons = {
      furniture: '🪑', electronics: '📱', collectibles: '⭐',
      clothing: '👕', tools: '🔧', sports: '⚽',
      books: '📚', home: '🏠', vintage: '📷', other: '📦'
    };
    return icons[category] || '📦';
  }

  function formatCategory(cat) {
    var names = {
      furniture: 'Furniture', electronics: 'Electronics', collectibles: 'Collectibles',
      clothing: 'Clothing', tools: 'Tools', sports: 'Sports & Outdoors',
      books: 'Books & Media', home: 'Home & Kitchen', vintage: 'Vintage', other: 'Other'
    };
    return names[cat] || (cat ? cat.charAt(0).toUpperCase() + cat.slice(1) : 'Items');
  }

  // ──────────── LIGHTBOX ────────────

  function createLightbox() {
    if (document.getElementById('ctl-lightbox')) return;
    var lb = document.createElement('div');
    lb.id = 'ctl-lightbox';
    lb.className = 'ctl-lightbox';
    lb.innerHTML =
      '<button class="lb-close" id="lb-close" aria-label="Close">' +
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '</button>' +
      '<button class="lb-nav lb-prev" id="lb-prev" aria-label="Previous photo">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<div class="lb-image-wrap">' +
        '<img id="lb-img" src="" alt="" />' +
      '</div>' +
      '<button class="lb-nav lb-next" id="lb-next" aria-label="Next photo">' +
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>' +
      '</button>' +
      '<div class="lb-counter" id="lb-counter"></div>';
    document.body.appendChild(lb);

    lb.addEventListener('click', function(e) {
      if (e.target === lb) closeLightbox();
    });
    document.getElementById('lb-close').addEventListener('click', closeLightbox);
    document.getElementById('lb-prev').addEventListener('click', function(e) {
      e.stopPropagation();
      showLightboxPhoto(currentPhotoIndex - 1);
    });
    document.getElementById('lb-next').addEventListener('click', function(e) {
      e.stopPropagation();
      showLightboxPhoto(currentPhotoIndex + 1);
    });

    // Touch swipe support
    var touchStartX = 0;
    lb.addEventListener('touchstart', function(e) { touchStartX = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 50) showLightboxPhoto(currentPhotoIndex + (dx < 0 ? 1 : -1));
    });
  }

  function openLightbox(index) {
    createLightbox();
    lightboxOpen = true;
    currentPhotoIndex = index;
    showLightboxPhoto(index);
    var lb = document.getElementById('ctl-lightbox');
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxOpen = false;
    var lb = document.getElementById('ctl-lightbox');
    if (lb) lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  function showLightboxPhoto(index) {
    if (photos.length === 0) return;
    currentPhotoIndex = (index + photos.length) % photos.length;
    var img = document.getElementById('lb-img');
    var counter = document.getElementById('lb-counter');
    if (img) {
      img.style.opacity = '0';
      img.src = photos[currentPhotoIndex];
      img.onload = function() { img.style.opacity = '1'; };
    }
    if (counter) counter.textContent = (currentPhotoIndex + 1) + ' / ' + photos.length;

    // Hide nav if only 1 photo
    var prev = document.getElementById('lb-prev');
    var next = document.getElementById('lb-next');
    if (prev) prev.style.display = photos.length <= 1 ? 'none' : '';
    if (next) next.style.display = photos.length <= 1 ? 'none' : '';
  }

  // Keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (!lightboxOpen) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showLightboxPhoto(currentPhotoIndex - 1);
    if (e.key === 'ArrowRight') showLightboxPhoto(currentPhotoIndex + 1);
  });

  // ──────────── GALLERY ────────────

  function buildGallery(item, isSold) {
    photos = (item.photos || []).filter(Boolean);
    var hasPhotos = photos.length > 0;

    var mainHtml = '';
    var thumbsHtml = '';

    if (hasPhotos) {
      mainHtml =
        '<div class="gallery-main" id="gallery-main">' +
          (isSold ? '<div class="detail-sold-overlay">SOLD</div>' : '') +
          '<img src="' + escapeHtml(photos[0]) + '" alt="' + escapeHtml(item.title) + ' - Cut The Lock" id="gallery-main-img" class="gallery-main-img" />' +
          (photos.length > 1 ? '<div class="gallery-counter" id="gallery-counter">1 / ' + photos.length + '</div>' : '') +
          '<button class="gallery-zoom-btn" id="gallery-zoom" aria-label="View full size">' +
            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>' +
          '</button>' +
        '</div>';

      if (photos.length > 1) {
        thumbsHtml = '<div class="gallery-thumbs" id="gallery-thumbs">';
        for (var i = 0; i < photos.length; i++) {
          thumbsHtml +=
            '<button class="gallery-thumb' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="Photo ' + (i + 1) + '">' +
              '<img src="' + escapeHtml(photos[i]) + '" alt="Photo ' + (i + 1) + '" loading="lazy" />' +
            '</button>';
        }
        thumbsHtml += '</div>';
      }
    } else {
      mainHtml =
        '<div class="gallery-main gallery-main-placeholder">' +
          (isSold ? '<div class="detail-sold-overlay">SOLD</div>' : '') +
          '<div class="detail-gallery-placeholder">' + getCategoryIcon(item.category) + '</div>' +
        '</div>';
    }

    return '<div class="gallery-wrap">' + mainHtml + thumbsHtml + '</div>';
  }

  function attachGalleryEvents() {
    var mainImg = document.getElementById('gallery-main-img');
    var zoomBtn = document.getElementById('gallery-zoom');
    var thumbsContainer = document.getElementById('gallery-thumbs');
    var counter = document.getElementById('gallery-counter');

    function switchPhoto(index) {
      if (!photos[index]) return;
      currentPhotoIndex = index;
      if (mainImg) {
        mainImg.style.opacity = '0.6';
        mainImg.src = photos[index];
        mainImg.onload = function() { mainImg.style.opacity = '1'; };
      }
      if (counter) counter.textContent = (index + 1) + ' / ' + photos.length;
      // Update active thumb
      if (thumbsContainer) {
        thumbsContainer.querySelectorAll('.gallery-thumb').forEach(function(t) {
          t.classList.toggle('active', parseInt(t.dataset.index) === index);
        });
      }
    }

    if (mainImg) {
      mainImg.addEventListener('click', function() { openLightbox(currentPhotoIndex); });
    }
    if (zoomBtn) {
      zoomBtn.addEventListener('click', function() { openLightbox(currentPhotoIndex); });
    }
    if (thumbsContainer) {
      thumbsContainer.addEventListener('click', function(e) {
        var btn = e.target.closest('.gallery-thumb');
        if (!btn) return;
        switchPhoto(parseInt(btn.dataset.index));
      });
    }
  }

  // ──────────── RELATED ITEMS ────────────

  async function loadRelatedItems(category, excludeId) {
    try {
      var res = await fetch('/api/listings?category=' + encodeURIComponent(category) + '&limit=5&sort=newest');
      var data = await res.json();
      if (!data.success) return '';

      var items = data.listings.filter(function(i) { return i.id !== excludeId; }).slice(0, 4);
      if (items.length === 0) return '';

      var html = '<section class="related-section">' +
        '<h2 class="related-title">More ' + escapeHtml(formatCategory(category)) + '</h2>' +
        '<div class="related-grid">';

      items.forEach(function(item) {
        var ph = (item.photos || []).filter(Boolean);
        var imgHtml = ph.length > 0
          ? '<img src="' + escapeHtml(ph[0]) + '" alt="' + escapeHtml(item.title) + ' - Cut The Lock" loading="lazy" />'
          : '<div class="listing-card-placeholder">' + getCategoryIcon(item.category) + '</div>';
        var isSold = item.status === 'sold';
        html +=
          '<a href="/listing/' + item.id + '" class="listing-card' + (isSold ? ' listing-card-sold' : '') + '">' +
            '<div class="listing-card-image">' +
              imgHtml +
              (isSold ? '<div class="listing-card-badge listing-card-badge-sold">Sold</div>' : (item.is_sentimental && item.sentimental_tier === 1 ? '<div class="listing-card-badge listing-card-badge-recovery">🔴 Recovery Priority</div>' : (item.featured ? '<div class="listing-card-badge">Featured</div>' : ''))) +
            '</div>' +
            '<div class="listing-card-body">' +
              '<div class="listing-card-category">' + escapeHtml(item.category) + '</div>' +
              '<div class="listing-card-title">' + escapeHtml(item.title) + '</div>' +
              '<div class="listing-card-footer">' +
                '<div class="' + (isSold ? 'listing-card-price listing-card-price-sold' : 'listing-card-price') + '">$' + parseFloat(item.price).toFixed(2) + '</div>' +
                (isSold ? '<div class="listing-card-sold-label">Sold</div>' : '<div class="listing-card-condition">' + escapeHtml(item.condition || 'Good') + '</div>') +
              '</div>' +
            '</div>' +
          '</a>';
      });

      html += '</div></section>';
      return html;
    } catch (e) {
      return '';
    }
  }

  // ──────────── MAIN LOAD ────────────

  async function loadListing() {
    try {
      var res = await fetch('/api/listings/' + LISTING_ID);
      var data = await res.json();

      if (!data.success || !data.listing) {
        container.innerHTML =
          '<div class="empty-state">' +
            '<h3>Item not found</h3>' +
            '<p>This listing may have been sold or removed.</p>' +
            '<a href="/listings" class="btn btn-secondary">Back to Shop</a>' +
          '</div>';
        return;
      }

      var item = data.listing;
      var isSold = item.status === 'sold';

      // Update page title + OG
      document.title = item.title + ' | Cut The Lock';

      // Breadcrumb
      var catLabel = formatCategory(item.category);
      var titleShort = item.title.length > 40 ? item.title.slice(0, 38) + '…' : item.title;
      var breadcrumb =
        '<nav class="breadcrumb" aria-label="Breadcrumb">' +
          '<a href="/" class="breadcrumb-item">Home</a>' +
          '<span class="breadcrumb-sep">›</span>' +
          '<a href="/listings" class="breadcrumb-item">Shop</a>' +
          '<span class="breadcrumb-sep">›</span>' +
          '<a href="/listings?category=' + encodeURIComponent(item.category) + '" class="breadcrumb-item">' + escapeHtml(catLabel) + '</a>' +
          '<span class="breadcrumb-sep">›</span>' +
          '<span class="breadcrumb-current">' + escapeHtml(titleShort) + '</span>' +
        '</nav>';

      // Gallery
      var galleryHtml = buildGallery(item, isSold);

      // Meta rows
      var metaRows = '';
      if (item.condition) {
        metaRows += '<div class="detail-meta-row"><span class="detail-meta-label">Condition</span><span class="detail-meta-value detail-condition-badge detail-condition-' + item.condition.toLowerCase().replace(/\s+/g, '-') + '">' + escapeHtml(item.condition) + '</span></div>';
      }
      if (item.category) {
        metaRows += '<div class="detail-meta-row"><span class="detail-meta-label">Category</span><span class="detail-meta-value">' + escapeHtml(catLabel) + '</span></div>';
      }
      if (item.unit_origin) {
        metaRows += '<div class="detail-meta-row"><span class="detail-meta-label">Unit</span><span class="detail-meta-value">' + escapeHtml(item.unit_origin) + '</span></div>';
      }
      if (item.facility_name) {
        var loc = item.facility_name;
        if (item.facility_city) loc += ', ' + item.facility_city;
        if (item.facility_state) loc += ' ' + item.facility_state;
        metaRows += '<div class="detail-meta-row"><span class="detail-meta-label">Sourced From</span><span class="detail-meta-value">' + escapeHtml(loc) + '</span></div>';
      }
      metaRows += '<div class="detail-meta-row"><span class="detail-meta-label">Listed</span><span class="detail-meta-value">' + new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '</span></div>';

      // Action
      var actionHtml = '';
      var hasShipping = item.shipping_enabled && item.shipping_payment_link_url;
      var hasLocalDelivery = item.local_delivery && item.local_delivery_payment_link_url;
      var hasPickup = !!item.payment_link_url;
      if (isSold) {
        actionHtml =
          '<div class="detail-sold-banner">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>' +
            '<span>This item has been sold</span>' +
          '</div>' +
          '<a href="/listings" class="btn btn-secondary" style="width:100%;margin-top:12px;">Browse Other Items</a>';
      } else if (hasShipping || hasLocalDelivery) {
        // Fulfillment selector — local pickup + shipping + local delivery (as available)
        var shippingTotal = hasShipping ? parseFloat(item.price) + parseFloat(item.shipping_price || 0) : 0;
        var deliveryTotal = hasLocalDelivery ? parseFloat(item.price) + parseFloat(item.delivery_fee || 20) : 0;

        // Determine default selection: pickup > shipping > local_delivery
        var defaultFulfillment = hasPickup ? 'pickup' : (hasShipping ? 'shipping' : 'local_delivery');

        var fulfillmentOptions = '<div class="fulfillment-selector" id="fulfillment-selector">' +
          '<div class="fulfillment-label">Choose fulfillment:</div>';
        if (hasPickup) {
          fulfillmentOptions +=
            '<label class="fulfillment-option ' + (defaultFulfillment === 'pickup' ? 'selected' : '') + '" id="opt-pickup">' +
              '<input type="radio" name="fulfillment" value="pickup" ' + (defaultFulfillment === 'pickup' ? 'checked' : '') + ' style="margin-right:8px;">' +
              '<span>🏠 Local Pickup</span>' +
              '<span class="fulfillment-price">Free</span>' +
            '</label>';
        }
        if (hasShipping) {
          fulfillmentOptions +=
            '<label class="fulfillment-option ' + (defaultFulfillment === 'shipping' ? 'selected' : '') + '" id="opt-shipping">' +
              '<input type="radio" name="fulfillment" value="shipping" ' + (defaultFulfillment === 'shipping' ? 'checked' : '') + ' style="margin-right:8px;">' +
              '<span>📦 Ship to Me</span>' +
              '<span class="fulfillment-price">+$' + parseFloat(item.shipping_price || 0).toFixed(2) + '</span>' +
            '</label>';
        }
        if (hasLocalDelivery) {
          fulfillmentOptions +=
            '<label class="fulfillment-option ' + (defaultFulfillment === 'local_delivery' ? 'selected' : '') + '" id="opt-local-delivery">' +
              '<input type="radio" name="fulfillment" value="local_delivery" ' + (defaultFulfillment === 'local_delivery' ? 'checked' : '') + ' style="margin-right:8px;">' +
              '<span>🚚 Local Delivery</span>' +
              '<span class="fulfillment-price">+$' + parseFloat(item.delivery_fee || 20).toFixed(2) + '</span>' +
            '</label>';
        }
        fulfillmentOptions += '</div>';

        // Address form (shown when shipping or local delivery is selected)
        var initialAddrShow = (defaultFulfillment === 'shipping' || defaultFulfillment === 'local_delivery') ? 'block' : 'none';
        var initialAddrTitle = defaultFulfillment === 'local_delivery' ? 'Delivery Address' : 'Shipping Address';
        var addressForm =
          '<div class="shipping-form" id="shipping-form" style="display:' + initialAddrShow + ';">' +
            '<div class="shipping-form-title" id="addr-form-title">' + initialAddrTitle + '</div>' +
            '<input type="text" class="shipping-input" id="ship-name" placeholder="Full Name" autocomplete="name">' +
            '<input type="text" class="shipping-input" id="ship-address" placeholder="Street Address" autocomplete="street-address">' +
            '<div class="shipping-row">' +
              '<input type="text" class="shipping-input" id="ship-city" placeholder="City" style="flex:2;" autocomplete="address-level2">' +
              '<input type="text" class="shipping-input" id="ship-state" placeholder="State" style="flex:1;" autocomplete="address-level1" maxlength="2">' +
              '<input type="text" class="shipping-input" id="ship-zip" placeholder="ZIP" style="flex:1;" autocomplete="postal-code" maxlength="10">' +
            '</div>' +
            '<div class="shipping-error" id="shipping-error" style="display:none;color:#e74c3c;font-size:0.82rem;margin-top:0.4rem;"></div>' +
          '</div>';

        // Initial buy button label
        var initialLabel, initialNote;
        if (defaultFulfillment === 'pickup') {
          initialLabel = 'Buy Now — $' + parseFloat(item.price).toFixed(2);
          initialNote = 'Secure checkout — local pickup in the Round Rock, TX area.';
        } else if (defaultFulfillment === 'shipping') {
          initialLabel = 'Buy Now — $' + shippingTotal.toFixed(2) + ' (incl. shipping)';
          initialNote = 'Secure checkout — we\'ll ship to your address within 3–5 days.';
        } else {
          initialLabel = 'Buy Now — $' + deliveryTotal.toFixed(2) + ' (incl. delivery)';
          initialNote = 'Secure checkout — we\'ll deliver to your address in the Round Rock, TX area.';
        }

        actionHtml = fulfillmentOptions + addressForm +
          '<button class="btn btn-buy" id="buy-now-btn" data-listing-id="' + item.id + '">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' +
            '<span id="buy-now-label">' + initialLabel + '</span>' +
          '</button>' +
          (hasPickup ? '<button class="btn btn-secondary btn-add-cart-detail" id="add-to-cart-btn">Add to Cart</button>' : '') +
          '<p class="buy-note" id="buy-note-text">' + initialNote + '</p>';
      } else if (item.payment_link_url) {
        actionHtml =
          '<div class="fulfillment-info">🏠 <strong>Local Pickup</strong> — Round Rock, TX area</div>' +
          '<a href="' + escapeHtml(item.payment_link_url) + '" class="btn btn-buy" id="buy-now-btn" data-listing-id="' + item.id + '">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' +
            'Buy Now — $' + parseFloat(item.price).toFixed(2) +
          '</a>' +
          '<button class="btn btn-secondary btn-add-cart-detail" id="add-to-cart-btn">Add to Cart</button>' +
          '<p class="buy-note">Secure checkout — local pickup in the Round Rock, TX area.</p>';
      } else {
        actionHtml =
          '<a href="mailto:info@cutthelock.com?subject=Interested in: ' + encodeURIComponent(item.title) + '" class="btn btn-buy">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>' +
            'Ask About This Item' +
          '</a>' +
          '<p class="buy-note">Reply within 24 hours. Local pickup or shipping available.</p>';
      }

      // Trust badges
      var trustHtml =
        '<div class="detail-trust">' +
          '<div class="trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg><span>Authenticated & cataloged</span></div>' +
          '<div class="trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>Ships in 3–5 days</span></div>' +
          '<div class="trust-item"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg><span>Real storage unit finds</span></div>' +
        '</div>';

      // Share section
      var shareHtml =
        '<div class="detail-share" id="detail-share">' +
          '<span class="detail-share-label">Share this item</span>' +
          '<div class="detail-share-buttons">' +
            '<button class="detail-share-btn" id="share-copy-btn" title="Copy link">' +
              '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
              '<span id="share-copy-label">Copy Link</span>' +
            '</button>' +
            (typeof navigator !== 'undefined' && navigator.share ?
              '<button class="detail-share-btn" id="share-native-btn" title="Share">' +
                '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>' +
                'Share' +
              '</button>' : '') +
          '</div>' +
        '</div>';

      container.innerHTML =
        breadcrumb +
        '<div class="detail-layout">' +
          galleryHtml +
          '<div class="detail-info">' +
            '<div class="detail-category-badge">' + getCategoryIcon(item.category) + ' ' + escapeHtml(catLabel) + '</div>' +
            (item.is_sentimental && item.sentimental_tier === 1 ? '<div class="detail-recovery-banner">🔴 <strong>Recovery Priority Item</strong> — This item has been flagged as sentimental. If it belongs to you, <a href="/report-lost" style="color:inherit;text-decoration:underline;">file a free recovery claim</a> before it sells.</div>' : '') +
            '<h1 class="detail-title">' + escapeHtml(item.title) + '</h1>' +
            '<div class="detail-price-wrap">' +
              '<div class="detail-price' + (isSold ? ' detail-price-sold' : '') + '">$' + parseFloat(item.price).toFixed(2) + '</div>' +
              (isSold ? '<span class="detail-sold-chip">Sold</span>' : '<span class="detail-avail-chip">Available</span>') +
            '</div>' +
            (item.description ? '<p class="detail-description">' + escapeHtml(item.description) + '</p>' : '') +
            '<div class="detail-meta">' + metaRows + '</div>' +
            '<div class="detail-action">' + actionHtml + '</div>' +
            trustHtml +
            shareHtml +
          '</div>' +
        '</div>';

      // Attach gallery interactions after DOM update
      attachGalleryEvents();

      // Share buttons
      var copyBtn = document.getElementById('share-copy-btn');
      var copyLabel = document.getElementById('share-copy-label');
      if (copyBtn) {
        copyBtn.addEventListener('click', function() {
          var url = window.location.href;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(function() {
              if (copyLabel) { copyLabel.textContent = 'Copied!'; }
              setTimeout(function() { if (copyLabel) copyLabel.textContent = 'Copy Link'; }, 2000);
            }).catch(function() {
              fallbackCopyUrl(url, copyLabel);
            });
          } else {
            fallbackCopyUrl(url, copyLabel);
          }
        });
      }
      var nativeBtn = document.getElementById('share-native-btn');
      if (nativeBtn && navigator.share) {
        nativeBtn.addEventListener('click', function() {
          navigator.share({
            title: item.title + ' — $' + parseFloat(item.price).toFixed(2),
            text: item.description ? item.description.slice(0, 100) : 'Check out this item on Cut The Lock',
            url: window.location.href
          }).catch(function() {});
        });
      }

      var addCartBtn = document.getElementById('add-to-cart-btn');
      if (addCartBtn) {
        addCartBtn.addEventListener('click', function() {
          if (window.CutTheLockCart) {
            window.CutTheLockCart.add(item.id);
            addCartBtn.textContent = 'Added to Cart';
            setTimeout(function() { addCartBtn.textContent = 'Add to Cart'; }, 1600);
          }
        });
      }

      // ---- FULFILLMENT SELECTOR + BUY NOW LOGIC ----
      var hasShippingOption = item.shipping_enabled && item.shipping_payment_link_url;
      var hasLocalDeliveryOption = item.local_delivery && item.local_delivery_payment_link_url;

      function trackBuyClick() {
        try {
          var qs = window.location.search;
          var params = new URLSearchParams(qs);
          fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: 'buy_click',
              path: window.location.pathname,
              referrer: document.referrer || '',
              utm_source: params.get('utm_source') || '',
              utm_medium: params.get('utm_medium') || '',
              utm_campaign: params.get('utm_campaign') || '',
              metadata: { listing_id: item.id, price: item.price, title: item.title }
            }),
            keepalive: true
          }).catch(function() {});
          fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: 'checkout_initiated',
              metadata: { listing_id: item.id, price: item.price, item_title: item.title },
              page_url: window.location.href
            })
          }).catch(function() {});
        } catch(e) {}
      }

      if (hasShippingOption || hasLocalDeliveryOption) {
        var shippingTotal = hasShippingOption ? parseFloat(item.price) + parseFloat(item.shipping_price || 0) : 0;
        var localDeliveryTotal = hasLocalDeliveryOption ? parseFloat(item.price) + parseFloat(item.delivery_fee || 20) : 0;

        // Listen to radio buttons for fulfillment selection
        var radios = document.querySelectorAll('input[name="fulfillment"]');
        radios.forEach(function(radio) {
          radio.addEventListener('change', function() {
            var val = this.value;
            var isShip = val === 'shipping';
            var isLocalDel = val === 'local_delivery';
            var needsAddress = isShip || isLocalDel;
            var shippingForm = document.getElementById('shipping-form');
            var addrTitle = document.getElementById('addr-form-title');
            var buyLabel = document.getElementById('buy-now-label');
            var buyNote = document.getElementById('buy-note-text');
            var optPickup = document.getElementById('opt-pickup');
            var optShipping = document.getElementById('opt-shipping');
            var optLocalDel = document.getElementById('opt-local-delivery');
            if (shippingForm) shippingForm.style.display = needsAddress ? 'block' : 'none';
            if (addrTitle) addrTitle.textContent = isLocalDel ? 'Delivery Address' : 'Shipping Address';
            if (buyLabel) {
              if (isShip) buyLabel.textContent = 'Buy Now — $' + shippingTotal.toFixed(2) + ' (incl. shipping)';
              else if (isLocalDel) buyLabel.textContent = 'Buy Now — $' + localDeliveryTotal.toFixed(2) + ' (incl. delivery)';
              else buyLabel.textContent = 'Buy Now — $' + parseFloat(item.price).toFixed(2);
            }
            if (buyNote) {
              if (isShip) buyNote.textContent = "Secure checkout \u2014 we\u2019ll ship to your address within 3\u20135 days.";
              else if (isLocalDel) buyNote.textContent = 'Secure checkout \u2014 we\u2019ll deliver to your address in the Round Rock, TX area.';
              else buyNote.textContent = 'Secure checkout \u2014 local pickup in the Round Rock, TX area.';
            }
            if (optPickup) optPickup.classList.toggle('selected', val === 'pickup');
            if (optShipping) optShipping.classList.toggle('selected', isShip);
            if (optLocalDel) optLocalDel.classList.toggle('selected', isLocalDel);
          });
        });

        // Buy Now button handler for multi-fulfillment flow
        var buyBtn = document.getElementById('buy-now-btn');
        if (buyBtn) {
          buyBtn.addEventListener('click', function() {
            var selectedFulfillment = 'pickup';
            var radio = document.querySelector('input[name="fulfillment"]:checked');
            if (radio) selectedFulfillment = radio.value;

            trackBuyClick();
            try { sessionStorage.setItem('ctl_purchase_listing_id', item.id); } catch(e) {}

            if (selectedFulfillment === 'shipping' || selectedFulfillment === 'local_delivery') {
              // Validate address
              var name = (document.getElementById('ship-name') || {}).value || '';
              var address = (document.getElementById('ship-address') || {}).value || '';
              var city = (document.getElementById('ship-city') || {}).value || '';
              var state = (document.getElementById('ship-state') || {}).value || '';
              var zip = (document.getElementById('ship-zip') || {}).value || '';
              var errEl = document.getElementById('shipping-error');

              name = name.trim(); address = address.trim(); city = city.trim();
              state = state.trim(); zip = zip.trim();

              var addrLabel = selectedFulfillment === 'local_delivery' ? 'delivery' : 'shipping';
              if (!name || !address || !city || !state || !zip) {
                if (errEl) { errEl.textContent = 'Please fill in all ' + addrLabel + ' address fields.'; errEl.style.display = 'block'; }
                return;
              }
              if (errEl) errEl.style.display = 'none';

              // Save to backend, then redirect
              var btn = this;
              var labelEl = document.getElementById('buy-now-label');
              btn.disabled = true;
              if (labelEl) labelEl.textContent = 'Processing\u2026';

              fetch('/api/orders/pre-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  listing_id: item.id,
                  fulfillment: selectedFulfillment,
                  shipping_name: name,
                  shipping_address: address,
                  shipping_city: city,
                  shipping_state: state,
                  shipping_zip: zip
                })
              })
              .then(function(r) { return r.json(); })
              .then(function(data) {
                if (data.success) {
                  try {
                    sessionStorage.setItem('ctl_order_info', JSON.stringify({
                      order_id: data.order_id,
                      fulfillment: selectedFulfillment,
                      shipping: { name: name, address: address, city: city, state: state, zip: zip }
                    }));
                  } catch(e) {}
                  var redirectUrl = selectedFulfillment === 'local_delivery'
                    ? item.local_delivery_payment_link_url
                    : item.shipping_payment_link_url;
                  window.location.href = redirectUrl;
                } else {
                  btn.disabled = false;
                  var failLabel = selectedFulfillment === 'local_delivery'
                    ? 'Buy Now — $' + localDeliveryTotal.toFixed(2) + ' (incl. delivery)'
                    : 'Buy Now — $' + shippingTotal.toFixed(2) + ' (incl. shipping)';
                  if (labelEl) labelEl.textContent = failLabel;
                  if (errEl) { errEl.textContent = data.message || 'Failed to process. Please try again.'; errEl.style.display = 'block'; }
                }
              })
              .catch(function() {
                btn.disabled = false;
                var failLabel = selectedFulfillment === 'local_delivery'
                  ? 'Buy Now — $' + localDeliveryTotal.toFixed(2) + ' (incl. delivery)'
                  : 'Buy Now — $' + shippingTotal.toFixed(2) + ' (incl. shipping)';
                if (labelEl) labelEl.textContent = failLabel;
                if (errEl) { errEl.textContent = 'Connection error. Please try again.'; errEl.style.display = 'block'; }
              });

            } else {
              // Local pickup — use Stripe Checkout Session
              var pickupBtn = this;
              var pickupLabelEl = document.getElementById('buy-now-label');
              pickupBtn.disabled = true;
              if (pickupLabelEl) pickupLabelEl.textContent = 'Loading\u2026';
              fetch('/api/checkout/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ listing_id: item.id, fulfillment: 'pickup' })
              })
              .then(function(r) {
                if (r.redirected) {
                  window.location.href = r.url;
                } else {
                  return r.json().then(function(data) {
                    pickupBtn.disabled = false;
                    if (pickupLabelEl) pickupLabelEl.textContent = 'Buy Now — $' + parseFloat(item.price).toFixed(2);
                    var errEl = document.getElementById('shipping-error');
                    if (errEl) { errEl.textContent = data.message || 'Failed to start checkout.'; errEl.style.display = 'block'; }
                  });
                }
              })
              .catch(function() {
                pickupBtn.disabled = false;
                if (pickupLabelEl) pickupLabelEl.textContent = 'Buy Now — $' + parseFloat(item.price).toFixed(2);
              });
            }
          });
        }

      } else {
        // Simple pickup-only or no-link: store listing ID on Buy Now click
        var buyBtn = document.getElementById('buy-now-btn');
        if (buyBtn) {
          buyBtn.addEventListener('click', function() {
            try { sessionStorage.setItem('ctl_purchase_listing_id', item.id); } catch(e) {}
            trackBuyClick();
          });
        }
      }

      // Sticky mobile buy bar — appears when user scrolls past the main action section
      var primaryPaymentLink = item.payment_link_url || item.shipping_payment_link_url || item.local_delivery_payment_link_url;
      if (!isSold && primaryPaymentLink) {
        var stickyBar = document.getElementById('detail-sticky-buy');
        if (!stickyBar) {
          stickyBar = document.createElement('div');
          stickyBar.id = 'detail-sticky-buy';
          stickyBar.className = 'detail-sticky-buy';
          stickyBar.innerHTML =
            '<div class="detail-sticky-buy-inner">' +
              '<div class="detail-sticky-buy-info">' +
                '<div class="detail-sticky-buy-title">' + escapeHtml(item.title.length > 30 ? item.title.slice(0, 28) + '\u2026' : item.title) + '</div>' +
                '<div class="detail-sticky-buy-price">$' + parseFloat(item.price).toFixed(2) + '</div>' +
              '</div>' +
              '<button class="btn-buy detail-sticky-buy-btn" id="sticky-buy-btn">' +
                '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' +
                ' Buy Now' +
              '</button>' +
            '</div>';
          document.body.appendChild(stickyBar);

          // Wire sticky Buy Now to the main buy button (handles all fulfillment logic)
          document.getElementById('sticky-buy-btn').addEventListener('click', function() {
            var mainBtn = document.getElementById('buy-now-btn');
            if (mainBtn) {
              mainBtn.click();
            } else {
              // Fallback: direct link
              window.open(primaryPaymentLink, '_blank', 'noopener');
            }
          });
        }

        // Show sticky bar when main action scrolls out of view
        var actionEl = document.querySelector('.detail-action');
        if (actionEl && typeof IntersectionObserver !== 'undefined') {
          var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
              stickyBar.classList.toggle('visible', !entry.isIntersecting);
            });
          }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
          observer.observe(actionEl);
        } else if (actionEl) {
          // Fallback for older browsers: show after 300px scroll
          window.addEventListener('scroll', function() {
            var rect = actionEl.getBoundingClientRect();
            stickyBar.classList.toggle('visible', rect.bottom < 0);
          }, { passive: true });
        }
      }

      // Load related items async
      if (item.category) {
        loadRelatedItems(item.category, item.id).then(function(relHtml) {
          if (relHtml) {
            container.insertAdjacentHTML('beforeend', relHtml);
          }
        });
      }

    } catch (err) {
      console.error('Error loading listing:', err);
      container.innerHTML =
        '<div class="empty-state"><h3>Something went wrong</h3><p>Please try refreshing the page.</p></div>';
    }
  }

  loadListing();
})();
