(function() {
  function money(value) {
    return '$' + (parseFloat(value || 0)).toFixed(2);
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function getCart() {
    return window.CutTheLockCart || {
      getItems: function() { return []; },
      setItems: function() {},
      remove: function() {},
      updateCount: function() {}
    };
  }

  function firstPhoto(item) {
    var photos = Array.isArray(item.photos) ? item.photos : [];
    return photos.length && photos[0] ? photos[0] : '';
  }

  function renderEmpty(message) {
    var itemsEl = document.getElementById('cart-items');
    itemsEl.innerHTML =
      '<div class="cart-empty">' +
        '<h2>Your cart is empty</h2>' +
        '<p>' + escapeHtml(message || 'Browse the marketplace and add available items to checkout together.') + '</p>' +
        '<a href="/listings" class="btn btn-primary">Browse Items</a>' +
      '</div>';
    updateSummary([]);
  }

  function updateSummary(items) {
    var total = items.reduce(function(sum, item) { return sum + parseFloat(item.price || 0); }, 0);
    document.getElementById('cart-summary-count').textContent = String(items.length);
    document.getElementById('cart-summary-total').textContent = money(total);
    document.getElementById('cart-checkout-btn').disabled = items.length === 0;
  }

  async function loadCart() {
    var cart = getCart();
    var ids = cart.getItems();
    var itemsEl = document.getElementById('cart-items');
    var errEl = document.getElementById('cart-error');
    errEl.style.display = 'none';

    if (!ids.length) {
      renderEmpty();
      return;
    }

    itemsEl.innerHTML = '<div class="loading-state">Loading cart...</div>';

    try {
      var res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ids })
      });
      var data = await res.json();
      if (!data.success) throw new Error(data.message || 'Could not load cart.');

      var items = data.items || [];
      var cleanIds = items.map(function(item) { return item.id; });
      if ((data.unavailable_ids || []).length) cart.setItems(cleanIds);

      if (!items.length) {
        renderEmpty('The items in your cart are no longer available.');
        return;
      }

      itemsEl.innerHTML = items.map(function(item) {
        var photo = firstPhoto(item);
        return '' +
          '<article class="cart-item" data-id="' + item.id + '">' +
            '<a class="cart-item-image" href="/listing/' + item.id + '">' +
              (photo ? '<img src="' + escapeHtml(photo) + '" alt="' + escapeHtml(item.title) + '">' : '<span>Item</span>') +
            '</a>' +
            '<div class="cart-item-body">' +
              '<a href="/listing/' + item.id + '" class="cart-item-title">' + escapeHtml(item.title) + '</a>' +
              '<div class="cart-item-meta">' + escapeHtml(item.category || 'Item') + (item.condition ? ' · ' + escapeHtml(item.condition) : '') + '</div>' +
              '<div class="cart-item-fulfillment">Local pickup</div>' +
            '</div>' +
            '<div class="cart-item-side">' +
              '<div class="cart-item-price">' + money(item.price) + '</div>' +
              '<button class="cart-remove-btn" data-remove-id="' + item.id + '">Remove</button>' +
            '</div>' +
          '</article>';
      }).join('');

      itemsEl.querySelectorAll('[data-remove-id]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          cart.remove(parseInt(btn.getAttribute('data-remove-id'), 10));
          loadCart();
        });
      });

      updateSummary(items);
    } catch (err) {
      itemsEl.innerHTML = '<div class="empty-state"><h3>Something went wrong</h3><p>Please try refreshing the page.</p></div>';
      errEl.textContent = err.message || 'Could not load cart.';
      errEl.style.display = 'block';
      updateSummary([]);
    }
  }

  async function checkout() {
    var cart = getCart();
    var ids = cart.getItems();
    var btn = document.getElementById('cart-checkout-btn');
    var errEl = document.getElementById('cart-error');
    var email = document.getElementById('cart-email').value.trim();
    errEl.style.display = 'none';

    if (!ids.length) {
      renderEmpty();
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Starting checkout...';

    try {
      var res = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ids, buyer_email: email })
      });
      var data = await res.json();
      if (!data.success || !data.url) {
        if (data.unavailable_ids && data.unavailable_ids.length) {
          cart.setItems(ids.filter(function(id) { return data.unavailable_ids.indexOf(id) === -1; }));
          await loadCart();
        }
        throw new Error(data.message || 'Could not start checkout.');
      }
      window.location.href = data.url;
    } catch (err) {
      btn.disabled = false;
      btn.textContent = 'Checkout';
      errEl.textContent = err.message || 'Could not start checkout.';
      errEl.style.display = 'block';
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    document.getElementById('cart-checkout-btn').addEventListener('click', checkout);
  });
})();
