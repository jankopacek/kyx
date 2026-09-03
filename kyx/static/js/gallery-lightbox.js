(function () {
  var triggers = document.querySelectorAll('[data-lightbox-index]');
  var lightbox = document.getElementById('galleryLightbox');
  if (!triggers.length || !lightbox) return;

  var imageEl = document.getElementById('lightboxImage');
  var sourceEl = document.getElementById('lightboxSourceWebp');
  var counterEl = document.getElementById('lightboxCounter');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var prevBtn = lightbox.querySelector('.lightbox-prev');
  var nextBtn = lightbox.querySelector('.lightbox-next');

  var currentIndex = 0;
  var lastFocused = null;

  function show(index) {
    currentIndex = (index + triggers.length) % triggers.length;
    var item = triggers[currentIndex];
    imageEl.src = item.getAttribute('data-full');
    imageEl.alt = item.getAttribute('data-alt');
    sourceEl.srcset = item.getAttribute('data-full-webp');
    counterEl.textContent = (currentIndex + 1) + ' / ' + triggers.length;
  }

  function open(index) {
    lastFocused = document.activeElement;
    show(index);
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    document.addEventListener('keydown', onKeydown);
    closeBtn.focus();
  }

  function close() {
    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  }

  function onKeydown(event) {
    if (event.key === 'Escape') {
      close();
    } else if (event.key === 'ArrowLeft') {
      show(currentIndex - 1);
    } else if (event.key === 'ArrowRight') {
      show(currentIndex + 1);
    }
  }

  triggers.forEach(function (item, index) {
    item.addEventListener('click', function () {
      open(index);
    });
  });

  prevBtn.addEventListener('click', function () { show(currentIndex - 1); });
  nextBtn.addEventListener('click', function () { show(currentIndex + 1); });
  closeBtn.addEventListener('click', close);

  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) {
      close();
    }
  });
})();
