// Shared cart helpers for public marketplace pages.
(function() {
  var KEY = 'ctl_cart_items';

  function read() {
    try {
      var raw = localStorage.getItem(KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(function(id) {
        return Number.isInteger(id) && id > 0;
      }) : [];
    } catch (e) {
      return [];
    }
  }

  function write(ids) {
    var unique = [];
    ids.forEach(function(id) {
      id = parseInt(id, 10);
      if (id > 0 && unique.indexOf(id) === -1) unique.push(id);
    });
    try { localStorage.setItem(KEY, JSON.stringify(unique)); } catch (e) {}
    updateCount();
    return unique;
  }

  function updateCount() {
    var count = read().length;
    document.querySelectorAll('[data-cart-count]').forEach(function(el) {
      el.textContent = String(count);
      el.style.display = count > 0 ? 'inline-flex' : 'none';
    });
    document.querySelectorAll('[data-cart-label]').forEach(function(el) {
      el.textContent = count > 0 ? 'Cart (' + count + ')' : 'Cart';
    });
  }

  window.CutTheLockCart = {
    getItems: read,
    setItems: write,
    add: function(id) {
      var ids = read();
      id = parseInt(id, 10);
      if (id > 0 && ids.indexOf(id) === -1) ids.push(id);
      return write(ids);
    },
    remove: function(id) {
      id = parseInt(id, 10);
      return write(read().filter(function(existing) { return existing !== id; }));
    },
    clear: function() {
      return write([]);
    },
    count: function() {
      return read().length;
    },
    updateCount: updateCount
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateCount);
  } else {
    updateCount();
  }
})();
