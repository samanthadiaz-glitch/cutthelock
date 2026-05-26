// Report lost item form JavaScript
// Supports ?item=ID param: fetches and displays the specific recovery item being claimed.
(function() {
  var form = document.getElementById('lost-item-form');
  var successDiv = document.getElementById('form-success');
  var photoInput = document.getElementById('photos');
  var photoPreview = document.getElementById('photo-preview');
  var selectedPhotos = []; // base64 data URLs

  // If this claim is linked to a specific recovery item, load the preview
  var recoveryItemInput = document.getElementById('recovery_item_id');
  if (recoveryItemInput && recoveryItemInput.value) {
    var itemId = recoveryItemInput.value;
    fetch('/api/recovery-items/' + itemId)
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data.success || !data.item) return;
        var item = data.item;
        var preview = document.getElementById('ri-claim-preview');
        var previewImg = document.getElementById('ri-preview-img');
        var previewDesc = document.getElementById('ri-preview-desc');
        if (preview && previewImg && previewDesc) {
          previewImg.src = item.photo_url || '';
          previewDesc.textContent = item.description || '';
          preview.style.display = 'block';
        }
      })
      .catch(function() {
        // Non-critical — preview fails silently
      });
  }

  // Photo preview
  if (photoInput) {
    photoInput.addEventListener('change', function() {
      var files = Array.from(photoInput.files).slice(0, 5);
      selectedPhotos = [];
      photoPreview.innerHTML = '';

      files.forEach(function(file) {
        if (!file.type.startsWith('image/')) return;
        var reader = new FileReader();
        reader.onload = function(e) {
          selectedPhotos.push(e.target.result);
          var img = document.createElement('img');
          img.src = e.target.result;
          img.style.cssText = 'width:72px;height:72px;object-fit:cover;border-radius:6px;border:1px solid rgba(250,247,244,0.12);';
          photoPreview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });
  }

  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.textContent = 'Submitting...';
    submitBtn.disabled = true;

    // Include recovery_item_id if present
    var riInput = document.getElementById('recovery_item_id');
    var recoveryItemId = riInput && riInput.value ? parseInt(riInput.value) : null;

    var formData = {
      reporter_name: form.reporter_name.value.trim(),
      reporter_email: form.reporter_email.value.trim() || null,
      reporter_phone: form.reporter_phone.value.trim() || null,
      item_name: form.item_name.value.trim(),
      item_description: form.item_description.value.trim(),
      category: form.category.value || null,
      facility_name: form.facility_name.value.trim() || null,
      unit_number: form.unit_number.value.trim() || null,
      facility_city: form.facility_city.value.trim() || null,
      facility_state: form.facility_state.value.trim() || null,
      date_lost: form.date_lost.value || null,
      photos: selectedPhotos,
      recovery_item_id: recoveryItemId
    };

    try {
      var res = await fetch('/api/lost-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      var data = await res.json();

      if (data.success) {
        // Meta Pixel — Lead event
        if (typeof fbq === 'function') { fbq('track', 'Lead'); }
        form.style.display = 'none';
        // Show reference number
        var refId = data.item && data.item.id ? data.item.id : '—';
        var refEl = document.getElementById('reference-number');
        if (refEl) {
          refEl.innerHTML = '<span class="ref-label">Reference #</span><span class="ref-value">CTL-' + String(refId).padStart(5, '0') + '</span>';
        }
        successDiv.style.display = 'block';
        // Scroll to top of success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        alert(data.message || 'Something went wrong. Please try again.');
        submitBtn.textContent = 'Submit Report';
        submitBtn.disabled = false;
      }
    } catch (err) {
      console.error('Form submission error:', err);
      alert('Something went wrong. Please try again.');
      submitBtn.textContent = 'Submit Report';
      submitBtn.disabled = false;
    }
  });
})();
