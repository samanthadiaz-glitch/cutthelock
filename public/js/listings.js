// Listings page JavaScript
(function() {
  var grid = document.getElementById('listings-grid');
  var categoryFilter = document.getElementById('filter-category');
  var sortFilter = document.getElementById('filter-sort');
  var searchInput = document.getElementById('search-input');
  var searchClear = document.getElementById('search-clear');
  var categoryChips = document.getElementById('category-chips');

  var currentPage = 1;
  var searchTerm = '';
  var searchTimer = null;

  async function loadListings() {
    var category = categoryFilter.value;
    var sort = sortFilter.value;

    grid.innerHTML = '<div class="loading-state">Loading items...</div>';

    try {
      var params = new URLSearchParams({ page: currentPage, limit: 20, sort });
      if (category) params.set('category', category);
      if (searchTerm) params.set('search', searchTerm);

      var res = await fetch('/api/listings?' + params.toString());
      var data = await res.json();

      if (!data.success || data.listings.length === 0) {
        var emptyMsg = searchTerm
          ? '<h3>No results for "' + escapeHtml(searchTerm) + '"</h3><p>Try a different search term or clear your filters.</p>'
          : '<h3>No items yet</h3><p>We\'re cataloging new storage units every week. Check back soon for fresh finds from real auctions.</p>';
        grid.innerHTML = '<div class="empty-state">' + emptyMsg + '</div>';
        return;
      }

      // Show result count if searching
      var countHtml = '';
      if (searchTerm || category) {
        countHtml = '<div class="results-count">' + data.total + ' item' + (data.total !== 1 ? 's' : '') + ' found</div>';
      }

      grid.innerHTML = countHtml + data.listings.map(function(item) {
        var photos = item.photos || [];
        var photoHtml = '';
        if (photos.length > 0 && photos[0]) {
          photoHtml = '<img src="' + escapeHtml(photos[0]) + '" alt="' + escapeHtml(item.title) + ' - Cut The Lock" loading="lazy">';
        } else {
          photoHtml = '<div class="listing-card-placeholder">' + getCategoryIcon(item.category) + '</div>';
        }

        var isSold = item.status === 'sold';
        var badgeHtml = '';
        if (isSold) {
          badgeHtml = '<div class="listing-card-badge listing-card-badge-sold">Sold</div>';
        } else if (item.is_sentimental && item.sentimental_tier === 1) {
          badgeHtml = '<div class="listing-card-badge listing-card-badge-recovery">🔴 Recovery Priority</div>';
        } else if (item.is_trending) {
          badgeHtml = '<div class="listing-card-badge listing-card-badge-trending">🔥 Hot</div>';
        } else if (item.featured) {
          badgeHtml = '<div class="listing-card-badge">Featured</div>';
        }

        var priceClass = isSold ? 'listing-card-price listing-card-price-sold' : 'listing-card-price';
        var cardClass = isSold ? 'listing-card listing-card-sold' : 'listing-card';
        var viewsHtml = (item.view_count && item.view_count > 0)
          ? '<div class="listing-card-views">👁 ' + item.view_count + ' view' + (item.view_count !== 1 ? 's' : '') + '</div>'
          : '';

        // Buy Now button — shown for any item with a payment link
        var bestLink = item.payment_link_url || item.shipping_payment_link_url || item.local_delivery_payment_link_url;
        var actionButtonsHtml = '';
        if (!isSold && bestLink) {
          var priceLabel = parseFloat(item.price) > 0 ? ' — $' + parseFloat(item.price).toFixed(2) : '';
          actionButtonsHtml =
            '<div class="listing-card-actions">' +
              (item.payment_link_url ? '<button class="listing-card-cart-btn" ' +
                'data-id="' + item.id + '">' +
                'Add to Cart' +
              '</button>' : '') +
              '<button class="listing-card-buy-btn" ' +
                'data-link="' + escapeHtml(bestLink) + '" ' +
                'data-id="' + item.id + '" ' +
                'data-price="' + parseFloat(item.price || 0).toFixed(2) + '" ' +
                'data-title="' + escapeHtml(item.title) + '">' +
                '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>' +
                'Buy Now' + priceLabel +
              '</button>' +
            '</div>';
        }

        return '<a href="/listing/' + item.id + '" class="' + cardClass + '">' +
          '<div class="listing-card-image">' + photoHtml + badgeHtml + '</div>' +
          '<div class="listing-card-body">' +
            '<div class="listing-card-category">' + escapeHtml(item.category) + '</div>' +
            '<div class="listing-card-title">' + escapeHtml(item.title) + '</div>' +
            '<div class="listing-card-desc">' + escapeHtml(item.description) + '</div>' +
            '<div class="listing-card-footer">' +
              '<div class="' + priceClass + '">$' + parseFloat(item.price).toFixed(2) + '</div>' +
              (isSold ? '<div class="listing-card-sold-label">Sold</div>' : '<div class="listing-card-condition">' + escapeHtml(item.condition || 'Good') + '</div>') +
            '</div>' +
            viewsHtml +
            actionButtonsHtml +
          '</div>' +
        '</a>';
      }).join('');

      grid.querySelectorAll('.listing-card-cart-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          var id = parseInt(btn.getAttribute('data-id'), 10);
          if (window.CutTheLockCart && id > 0) {
            window.CutTheLockCart.add(id);
            btn.textContent = 'Added';
            btn.classList.add('is-added');
            setTimeout(function() {
              btn.textContent = 'Add to Cart';
              btn.classList.remove('is-added');
            }, 1600);
          }
        });
      });

      // Wire up Buy Now buttons — stop card navigation, call checkout session endpoint
      grid.querySelectorAll('.listing-card-buy-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.stopPropagation();
          e.preventDefault();
          var link = btn.getAttribute('data-link');
          var id = btn.getAttribute('data-id');
          var price = btn.getAttribute('data-price');
          var title = btn.getAttribute('data-title');

          // Track buy click
          try {
            fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event_type: 'buy_click',
                path: '/listings',
                metadata: { listing_id: parseInt(id), price: parseFloat(price), title: title, source: 'grid_card' }
              }),
              keepalive: true
            }).catch(function() {});
          } catch(err) {}

          // Use Stripe Checkout Session endpoint instead of direct payment link
          var btnEl = btn;
          btnEl.disabled = true;
          btnEl.textContent = 'Loading\u2026';

          fetch('/api/checkout/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listing_id: parseInt(id), fulfillment: 'pickup' })
          })
          .then(function(r) {
            if (r.redirected) {
              window.location.href = r.url;
            } else {
              r.json().then(function(data) {
                btnEl.disabled = false;
                btnEl.innerHTML = '<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex-shrink:0\"><rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"2\" ry=\"2\"/><line x1=\"1\" y1=\"10\" x2=\"23\" y2=\"10\"/></svg> Buy Now — $' + parseFloat(price).toFixed(2);
                if (data.message) alert(data.message);
                else if (link) window.open(link, '_blank', 'noopener');
              }).catch(function() {
                btnEl.disabled = false;
                btnEl.innerHTML = '<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex-shrink:0\"><rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"2\" ry=\"2\"/><line x1=\"1\" y1=\"10\" x2=\"23\" y2=\"10\"/></svg> Buy Now — $' + parseFloat(price).toFixed(2);
                if (link) window.open(link, '_blank', 'noopener');
              });
            }
          })
          .catch(function() {
            btnEl.disabled = false;
            btnEl.innerHTML = '<svg width=\"13\" height=\"13\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"flex-shrink:0\"><rect x=\"1\" y=\"4\" width=\"22\" height=\"16\" rx=\"2\" ry=\"2\"/><line x1=\"1\" y1=\"10\" x2=\"23\" y2=\"10\"/></svg> Buy Now — $' + parseFloat(price).toFixed(2);
            if (link) window.open(link, '_blank', 'noopener');
          });
        });
      });

    } catch (err) {
      console.error('Error loading listings:', err);
      grid.innerHTML = '<div class="empty-state"><h3>Something went wrong</h3><p>Please try refreshing the page.</p></div>';
    }
  }

  function getCategoryIcon(category) {
    var icons = {
      furniture: '\u{1FA91}',
      electronics: '\u{1F4F1}',
      collectibles: '\u{2B50}',
      clothing: '\u{1F455}',
      tools: '\u{1F527}',
      sports: '\u{26BD}',
      books: '\u{1F4DA}',
      home: '\u{1F3E0}',
      vintage: '\u{1F4F7}',
      other: '\u{1F4E6}'
    };
    return icons[category] || '\u{1F4E6}';
  }

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Search input with debounce
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimer);
      var val = searchInput.value.trim();
      searchClear.style.display = val ? 'flex' : 'none';
      searchTimer = setTimeout(function() {
        searchTerm = val;
        currentPage = 1;
        loadListings();
      }, 350);
    });

    // Allow enter to search immediately
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        clearTimeout(searchTimer);
        searchTerm = searchInput.value.trim();
        currentPage = 1;
        loadListings();
      }
    });
  }

  // Clear search button
  if (searchClear) {
    searchClear.addEventListener('click', function() {
      searchInput.value = '';
      searchTerm = '';
      searchClear.style.display = 'none';
      currentPage = 1;
      searchInput.focus();
      loadListings();
    });
  }

  // Category chips
  if (categoryChips) {
    categoryChips.addEventListener('click', function(e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;

      // Update active state
      categoryChips.querySelectorAll('.chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');

      // Sync with sidebar dropdown
      var cat = chip.dataset.category;
      categoryFilter.value = cat;
      currentPage = 1;
      loadListings();
    });
  }

  categoryFilter.addEventListener('change', function() {
    currentPage = 1;
    // Sync chips with dropdown
    if (categoryChips) {
      categoryChips.querySelectorAll('.chip').forEach(function(c) {
        c.classList.toggle('active', c.dataset.category === categoryFilter.value);
      });
    }
    loadListings();
  });

  sortFilter.addEventListener('change', function() {
    currentPage = 1;
    loadListings();
  });

  loadListings();
})();
